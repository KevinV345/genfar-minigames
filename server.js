import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "./db.js"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"
import multer from "multer"
import fs from "fs"

const app = express()
app.use(express.json())
app.use(cors())

const SECRET = "clave-secreta"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public", "img")
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + extension)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

app.use(express.static("public"))

const auth =
  (adminOnly = false) =>
  async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      console.log("No token provided")
      return res.status(401).json({ error: "Token requerido" })
    }
    try {
      const user = jwt.verify(token, SECRET)
      if (adminOnly && !user.es_admin) {
        console.log("User is not admin:", user)
        return res.status(403).json({ error: "Acceso denegado" })
      }
      req.user = user
      next()
    } catch (error) {
      console.log("Token verification failed:", error.message)
      res.status(403).json({ error: "Token inválido" })
    }
  }

const logChange = async (accion, detalle, usuario = null) => {
  try {
    let mensajeLog = ""
    if (usuario) {
      mensajeLog = `el usuario ${usuario.nombre}, ${accion} - ${detalle}`
    } else {
      mensajeLog = `${accion} - ${detalle}`
    }

    await pool.query("INSERT INTO logs_cambios (accion, detalle) VALUES (?,?)", [accion, mensajeLog])
  } catch (error) {
    console.error("Error logging change:", error)
  }
}

const getUserInfo = async (userId) => {
  try {
    const [rows] = await pool.query("SELECT nombre FROM usuarios WHERE id = ?", [userId])
    return rows.length > 0 ? rows[0] : { nombre: "Usuario desconocido" }
  } catch (error) {
    return { nombre: "Usuario desconocido" }
  }
}

app.get("/api/auth/verify", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, correo, es_admin FROM usuarios WHERE id = ?", [req.user.id])

    if (!rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    const user = rows[0]
    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        es_admin: !!user.es_admin,
      },
    })
  } catch (error) {
    console.error("Error verifying user:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/upload", auth(), upload.single("image"), (req, res) => {
  try {
    console.log("Upload request from user:", req.user.id)
    console.log("File received:", req.file ? req.file.filename : "No file")

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" })
    }

    const imageUrl = `/img/${req.file.filename}`
    console.log("Image uploaded successfully:", imageUrl)

    res.json({
      url: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Error al subir la imagen" })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body

    console.log("Login attempt:", { correo, contrasena: "***" })

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo=?", [correo])
    console.log("User found:", rows.length > 0)

    if (!rows.length) {
      console.log("No user found with email:", correo)
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const user = rows[0]
    console.log("User data:", { id: user.id, nombre: user.nombre, es_admin: user.es_admin })

    const match = await bcrypt.compare(contrasena, user.contrasena_hash)
    console.log("Password match:", match)

    if (!match) {
      console.log("Password does not match for user:", correo)
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const token = jwt.sign({ id: user.id, es_admin: !!user.es_admin }, SECRET)
    console.log("Login successful for user:", correo)

    await logChange("inició sesión", `Acceso al sistema - Panel de administración de minijuegos`, user)

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        es_admin: !!user.es_admin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/usuarios", auth(true), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, correo, es_admin FROM usuarios")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/usuarios", auth(true), async (req, res) => {
  try {
    const { nombre, correo, contrasena, es_admin } = req.body
    const hash = await bcrypt.hash(contrasena, 10)
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, correo, contrasena_hash, es_admin) VALUES (?,?,?,?)",
      [nombre, correo, hash, es_admin ? 1 : 0],
    )
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo usuario", `Usuario: ${nombre} (${correo}) - Sistema de administración`, usuario)
    res.json({ mensaje: "Usuario creado", id: result.insertId })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El correo ya está registrado" })
    } else {
      res.status(500).json({ error: "Error del servidor" })
    }
  }
})

app.put("/api/usuarios/:id", auth(true), async (req, res) => {
  try {
    const { nombre, correo, es_admin, contrasena } = req.body
    let query = "UPDATE usuarios SET nombre=?, correo=?, es_admin=?"
    const params = [nombre, correo, es_admin ? 1 : 0]

    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, 10)
      query += ", contrasena_hash=?"
      params.push(hash)
    }

    query += " WHERE id=?"
    params.push(req.params.id)

    await pool.query(query, params)
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó un usuario",
      `Usuario: ${nombre} (${correo}) - Sistema de administración - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Usuario actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/usuarios/:id", auth(true), async (req, res) => {
  try {
    const [userToDelete] = await pool.query("SELECT nombre FROM usuarios WHERE id=?", [req.params.id])
    const nombreEliminado = userToDelete.length > 0 ? userToDelete[0].nombre : "Usuario desconocido"

    await pool.query("DELETE FROM usuarios WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un usuario",
      `Usuario eliminado: ${nombreEliminado} - Sistema de administración - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Usuario eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/paises", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM paises ORDER BY nombre")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/paises/:id", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM paises WHERE id=?", [req.params.id])
    if (!rows.length) return res.status(404).json({ error: "País no encontrado" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/paises", auth(true), async (req, res) => {
  try {
    const { nombre } = req.body
    const [result] = await pool.query("INSERT INTO paises (nombre) VALUES (?)", [nombre])
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo país", `País: ${nombre} - Configuración general`, usuario)
    res.json({ mensaje: "País agregado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/paises/:id", auth(true), async (req, res) => {
  try {
    const { nombre } = req.body
    await pool.query("UPDATE paises SET nombre=? WHERE id=?", [nombre, req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange("actualizó un país", `País: ${nombre} - Configuración general - ID: ${req.params.id}`, usuario)
    res.json({ mensaje: "País actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/paises/:id", auth(true), async (req, res) => {
  try {
    const [paisToDelete] = await pool.query("SELECT nombre FROM paises WHERE id=?", [req.params.id])
    const nombrePais = paisToDelete.length > 0 ? paisToDelete[0].nombre : "País desconocido"

    await pool.query("DELETE FROM paises WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un país",
      `País eliminado: ${nombrePais} - Configuración general - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "País eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// MODIFICADO: Rutas de Preguntas para soportar múltiples países
app.get("/api/preguntas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
            GROUP_CONCAT(pa.nombre SEPARATOR ', ') as paises_nombres,
            GROUP_CONCAT(pa.id SEPARATOR ',') as paises_ids
       FROM genfy_pregunta p 
       LEFT JOIN genfy_pregunta_paises pp ON p.id = pp.pregunta_id
       LEFT JOIN paises pa ON pp.pais_id = pa.id 
       GROUP BY p.id
       ORDER BY p.id DESC`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/preguntas", auth(true), async (req, res) => {
  try {
    const { paises_ids, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3 } = req.body

    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    const [result] = await pool.query(
      "INSERT INTO genfy_pregunta (pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3) VALUES (?,?,?,?,?)",
      [pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3],
    )
    const preguntaId = result.insertId

    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO genfy_pregunta_paises (pregunta_id, pais_id) VALUES (?,?)", [preguntaId, paisId])
    }

    const [paisesInfo] = await pool.query("SELECT nombre FROM paises WHERE id IN (?)", [paises_ids])
    const nombresPaises = paisesInfo.map((p) => p.nombre).join(", ")
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó una nueva pregunta", `Pregunta para ${nombresPaises} - Juego Genfy Pregunta`, usuario)

    res.json({ mensaje: "Pregunta creada", id: preguntaId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/preguntas/:id", auth(true), async (req, res) => {
  try {
    const preguntaId = req.params.id
    const { paises_ids, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3 } = req.body

    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    await pool.query(
      "UPDATE genfy_pregunta SET pregunta=?, respuesta_correcta=?, respuesta_1=?, respuesta_2=?, respuesta_3=? WHERE id=?",
      [pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, preguntaId],
    )

    await pool.query("DELETE FROM genfy_pregunta_paises WHERE pregunta_id=?", [preguntaId])

    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO genfy_pregunta_paises (pregunta_id, pais_id) VALUES (?,?)", [preguntaId, paisId])
    }

    const [paisesInfo] = await pool.query("SELECT nombre FROM paises WHERE id IN (?)", [paises_ids])
    const nombresPaises = paisesInfo.map((p) => p.nombre).join(", ")
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó una pregunta",
      `Pregunta de ${nombresPaises} - Juego Genfy Pregunta - ID: ${preguntaId}`,
      usuario,
    )

    res.json({ mensaje: "Pregunta actualizada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/preguntas/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_pregunta WHERE id=?", [req.params.id])
    res.json({ mensaje: "Pregunta eliminada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// MODIFICADO: Rutas de Escenarios para soportar múltiples países
app.get("/api/escenarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, 
            GROUP_CONCAT(p.nombre SEPARATOR ', ') as paises_nombres,
            GROUP_CONCAT(p.id SEPARATOR ',') as paises_ids
       FROM genfy_encuentra_escenarios e 
       LEFT JOIN genfy_encuentra_escenarios_paises ep ON e.id = ep.escenario_id
       LEFT JOIN paises p ON ep.pais_id = p.id 
       GROUP BY e.id
       ORDER BY e.id DESC`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/escenarios", auth(true), async (req, res) => {
  try {
    const { paises_ids, imagen_fondo } = req.body
    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0 || !imagen_fondo) {
      return res.status(400).json({ error: "Países e imagen de fondo son requeridos" })
    }

    const [result] = await pool.query("INSERT INTO genfy_encuentra_escenarios (imagen_fondo) VALUES (?)", [
      imagen_fondo,
    ])
    const escenarioId = result.insertId
    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO genfy_encuentra_escenarios_paises (escenario_id, pais_id) VALUES (?,?)", [
        escenarioId,
        paisId,
      ])
    }

    res.json({ mensaje: "Escenario creado", id: escenarioId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    const escenarioId = req.params.id
    const { paises_ids, imagen_fondo } = req.body
    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0 || !imagen_fondo) {
      return res.status(400).json({ error: "Países e imagen de fondo son requeridos" })
    }
    await pool.query("UPDATE genfy_encuentra_escenarios SET imagen_fondo=? WHERE id=?", [imagen_fondo, escenarioId])
    await pool.query("DELETE FROM genfy_encuentra_escenarios_paises WHERE escenario_id=?", [escenarioId])
    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO genfy_encuentra_escenarios_paises (escenario_id, pais_id) VALUES (?,?)", [
        escenarioId,
        paisId,
      ])
    }

    res.json({ mensaje: "Escenario actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_encuentra_escenarios WHERE id=?", [req.params.id])
    res.json({ mensaje: "Escenario eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// MODIFICADO: Rutas de Sprites para soportar múltiples países
app.get("/api/sprites", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, 
            GROUP_CONCAT(p.nombre SEPARATOR ', ') as paises_nombres,
            GROUP_CONCAT(p.id SEPARATOR ',') as paises_ids
       FROM mision_genfy_sprites s 
       LEFT JOIN mision_genfy_sprites_paises sp ON s.id = sp.sprite_id
       LEFT JOIN paises p ON sp.pais_id = p.id 
       GROUP BY s.id
       ORDER BY s.id DESC`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/sprites", auth(), upload.single("imagen"), async (req, res) => {
  try {
    const { paises_ids, tipo } = req.body
    if (!paises_ids || !tipo || !req.file) {
      return res.status(400).json({ error: "Países, tipo e imagen son requeridos" })
    }
    const paisesIdsArray = paises_ids.split(",").map(Number)

    const imagen_url = `/img/${req.file.filename}`
    const [result] = await pool.query("INSERT INTO mision_genfy_sprites (tipo, imagen_url) VALUES (?,?)", [
      tipo,
      imagen_url,
    ])
    const spriteId = result.insertId
    for (const paisId of paisesIdsArray) {
      await pool.query("INSERT INTO mision_genfy_sprites_paises (sprite_id, pais_id) VALUES (?,?)", [spriteId, paisId])
    }

    res.json({ success: true, mensaje: "Sprite creado", id: spriteId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor", details: error.message })
  }
})

app.put("/api/sprites/:id", auth(true), upload.single("imagen"), async (req, res) => {
  try {
    const spriteId = req.params.id
    const { paises_ids, tipo } = req.body
    const paisesIdsArray = paises_ids.split(",").map(Number)
    let imagen_url = req.body.imagen_url

    if (req.file) {
      imagen_url = `/img/${req.file.filename}`
    }

    await pool.query("UPDATE mision_genfy_sprites SET tipo=?, imagen_url=? WHERE id=?", [tipo, imagen_url, spriteId])
    await pool.query("DELETE FROM mision_genfy_sprites_paises WHERE sprite_id=?", [spriteId])
    for (const paisId of paisesIdsArray) {
      await pool.query("INSERT INTO mision_genfy_sprites_paises (sprite_id, pais_id) VALUES (?,?)", [spriteId, paisId])
    }

    res.json({ success: true, mensaje: "Sprite actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/sprites/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM mision_genfy_sprites WHERE id=?", [req.params.id])
    res.json({ mensaje: "Sprite eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// Unity API endpoints for game data consumption
app.get("/api/spritesUnity/:paisId", async (req, res) => {
  try {
    const { paisId } = req.params

    const [sprites] = await pool.query(
      `SELECT s.id, s.tipo, s.imagen_url
        FROM mision_genfy_sprites s
        JOIN mision_genfy_sprites_paises sp ON s.id = sp.sprite_id
        WHERE sp.pais_id = ?
        ORDER BY s.tipo ASC, s.id ASC`,
      [paisId],
    )

    if (sprites.length === 0) {
      return res.status(404).json({ error: "No se encontraron sprites para el país especificado." })
    }

    // Dividir los sprites en dos arrays según el tipo
    const spritesMedicamento = sprites.filter((s) => s.tipo === "medicamento")
    const spritesBacteria = sprites.filter((s) => s.tipo === "bacteria")

    // Función para asegurar que un array tenga exactamente 6 elementos y el formato de datos correcto
    const formatSpritesArray = (arr) => {
      // Check if array is empty
      if (!arr || arr.length === 0) {
        return []
      }

      const formatted = []
      if (arr.length >= 6) {
        // Si hay 6 o más, tomamos los 6 primeros y removemos el campo 'tipo'
        for (let i = 0; i < 6; i++) {
          const { tipo, ...rest } = arr[i]
          formatted.push(rest)
        }
      } else {
        // Si hay menos de 6, repetimos los elementos de forma ordenada y removemos el campo 'tipo'
        let i = 0
        while (formatted.length < 6) {
          const { tipo, ...rest } = arr[i % arr.length]
          formatted.push(rest)
          i++
        }
      }
      return formatted
    }

    // Formatear los dos arrays de sprites
    const resultadoMedicamento = formatSpritesArray(spritesMedicamento)
    const resultadoBacteria = formatSpritesArray(spritesBacteria)

    // Devolver un objeto con los dos arrays
    res.json({
      medicamento: resultadoMedicamento,
      bacteria: resultadoBacteria,
    })
  } catch (error) {
    console.error("Error al obtener sprites para Unity:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenariosUnity/:paisId", async (req, res) => {
  const { paisId } = req.params

  try {
    // Traer escenarios con su país usando la nueva estructura de múltiples países
    const [escenarios] = await pool.query(
      `SELECT e.*, p.nombre AS pais_nombre
       FROM genfy_encuentra_escenarios e
       JOIN genfy_encuentra_escenarios_paises ep ON e.id = ep.escenario_id
       LEFT JOIN paises p ON ep.pais_id = p.id
       WHERE ep.pais_id = ?`,
      [paisId],
    )

    for (const escenario of escenarios) {
      // Traer objetos de este escenario
      const [objetos] = await pool.query(
        `SELECT o.id, o.imagen_objetivo, o.orden
         FROM genfy_encuentra_objetos o
         WHERE o.escenario_id = ?
         ORDER BY o.orden ASC`,
        [escenario.id],
      )

      for (const objeto of objetos) {
        // Traer colliders de cada objeto
        const [colliders] = await pool.query(
          `SELECT c.id, c.punto_x, c.punto_y, c.indice
           FROM genfy_encuentra_colliders c
           WHERE c.objeto_id = ?
           ORDER BY c.indice ASC`,
          [objeto.id],
        )
        objeto.colliders = colliders
      }

      escenario.objetos = objetos
    }

    res.json(escenarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

// Unity endpoint for roulette game
app.get("/api/ruletaUnity/:paisId", async (req, res) => {
  try {
    const { paisId } = req.params

    const [temas] = await pool.query(`SELECT id, nombre FROM ruleta_temas ORDER BY id`)

    const ruletaData = {}

    // Para cada tema, obtener sus preguntas y crear la estructura simplificada
    for (const tema of temas) {
      const [preguntas] = await pool.query(
        `SELECT pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3 FROM ruleta_preguntas WHERE tema_id = ?`,
        [tema.id],
      )

      ruletaData[tema.nombre.toLowerCase()] = preguntas.map((p) => ({
        pregunta: p.pregunta,
        respuestas: [p.respuesta_correcta, p.respuesta_1, p.respuesta_2, p.respuesta_3].filter(
          (respuesta) => respuesta && respuesta.trim() !== "",
        ), // Filtrar respuestas vacías
        correcta: p.respuesta_correcta,
      }))
    }

    res.json(ruletaData)
  } catch (error) {
    console.error("Error al obtener datos de ruleta para Unity:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenarios/:escenarioId/objetos", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM genfy_encuentra_objetos WHERE escenario_id = ? ORDER BY orden, id`, [
      req.params.escenarioId,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/objetos/:id", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM genfy_encuentra_objetos WHERE id = ?", [req.params.id])
    if (!rows.length) {
      return res.status(404).json({ error: "Objeto no encontrado" })
    }
    res.json(rows[0])
  } catch (error) {
    console.error("Error getting object:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/escenarios/:escenarioId/objetos", auth(true), upload.single("imagen_objetivo"), async (req, res) => {
  try {
    console.log("[v0] Adding object to scenario:", req.params.escenarioId)
    console.log("[v0] Request body:", req.body)
    console.log("[v0] Uploaded file:", req.file)

    const { orden } = req.body
    const escenario_id = req.params.escenarioId

    if (!req.file) {
      console.log("[v0] No file uploaded")
      return res.status(400).json({ error: "Se requiere una imagen" })
    }

    const imagen_objetivo = `/img/${req.file.filename}`
    console.log("[v0] Generated image URL:", imagen_objetivo)

    const [result] = await pool.query(
      "INSERT INTO genfy_encuentra_objetos (escenario_id, imagen_objetivo, orden) VALUES (?,?,?)",
      [escenario_id, imagen_objetivo, orden || 1],
    )

    console.log("[v0] Object created with ID:", result.insertId)
    res.json({ mensaje: "Objeto creado", id: result.insertId })
  } catch (error) {
    console.error("[v0] Error creating object:", error)
    res.status(500).json({ error: "Error del servidor", details: error.message })
  }
})

app.put("/api/objetos/:id", auth(true), upload.single("imagen_objetivo"), async (req, res) => {
  try {
    console.log("[v0] Updating object:", req.params.id)
    console.log("[v0] Request body:", req.body)
    console.log("[v0] Uploaded file:", req.file)

    let { imagen_objetivo, orden } = req.body

    // If a new file was uploaded, use the new file path
    if (req.file) {
      imagen_objetivo = `/img/${req.file.filename}`
      console.log("[v0] New image uploaded:", imagen_objetivo)
    }

    // Ensure we have the required fields
    if (!imagen_objetivo || !orden) {
      return res.status(400).json({ error: "Imagen y orden son requeridos" })
    }

    await pool.query("UPDATE genfy_encuentra_objetos SET imagen_objetivo=?, orden=? WHERE id=?", [
      imagen_objetivo,
      Number.parseInt(orden) || 1,
      req.params.id,
    ])

    console.log("[v0] Object updated successfully")
    res.json({ mensaje: "Objeto actualizado" })
  } catch (error) {
    console.error("[v0] Error updating object:", error)
    res.status(500).json({ error: "Error del servidor", details: error.message })
  }
})

app.delete("/api/objetos/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_encuentra_objetos WHERE id=?", [req.params.id])
    res.json({ mensaje: "Objeto eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/objetos/:objetoId/colliders", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM genfy_encuentra_colliders WHERE objeto_id = ? ORDER BY indice", [
      req.params.objetoId,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/objetos/:objetoId/colliders/batch", auth(true), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { points } = req.body
    const objeto_id = req.params.objetoId
    if (!objeto_id || !points || !Array.isArray(points)) {
      return res.status(400).json({ error: "Datos inválidos" })
    }
    await connection.beginTransaction()
    await connection.query("DELETE FROM genfy_encuentra_colliders WHERE objeto_id = ?", [objeto_id])
    for (const point of points) {
      await connection.query(
        "INSERT INTO genfy_encuentra_colliders (objeto_id, punto_x, punto_y, indice) VALUES (?,?,?,?)",
        [objeto_id, point.punto_x, point.punto_y, point.indice],
      )
    }
    await connection.commit()
    connection.release()
    res.json({ mensaje: "Collider polígono creado exitosamente", puntos: points.length })
  } catch (error) {
    await connection.rollback()
    connection.release()
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/logs", auth(true), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM logs_cambios ORDER BY fecha DESC LIMIT 100")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// Rutas de Ruleta (sin cambios, ya que no dependen de países)
app.get("/api/ruleta/temas", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ruleta_temas ORDER BY nombre")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/ruleta/temas", auth(true), async (req, res) => {
  try {
    const { nombre, color } = req.body
    const [result] = await pool.query("INSERT INTO ruleta_temas (nombre, color) VALUES (?,?)", [nombre, color])
    res.json({ mensaje: "Tema creado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/ruleta/temas/:id", auth(true), async (req, res) => {
  try {
    const { nombre, color, activo } = req.body
    await pool.query("UPDATE ruleta_temas SET nombre=?, color=?, activo=? WHERE id=?", [
      nombre,
      color,
      activo ? 1 : 0,
      req.params.id,
    ])
    res.json({ mensaje: "Tema actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/ruleta/temas/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM ruleta_temas WHERE id=?", [req.params.id])
    res.json({ mensaje: "Tema eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// MODIFICADO: Updated GET endpoint to include countries information
app.get("/api/ruleta/preguntas", async (req, res) => {
  try {
    const [preguntas] = await pool.query(`
      SELECT 
        rp.*,
        rt.nombre as tema_nombre,
        rt.color as tema_color,
        GROUP_CONCAT(DISTINCT p.id) as paises_ids,
        GROUP_CONCAT(DISTINCT p.nombre) as paises_nombres
      FROM ruleta_preguntas rp
      JOIN ruleta_temas rt ON rp.tema_id = rt.id
      LEFT JOIN ruleta_preguntas_paises rpp ON rp.id = rpp.pregunta_id
      LEFT JOIN paises p ON rpp.pais_id = p.id
      GROUP BY rp.id
      ORDER BY rp.id DESC
    `)
    res.json(preguntas)
  } catch (error) {
    console.error("Error fetching ruleta questions:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

// MODIFICADO: Updated POST endpoint to handle multiple countries for ruleta questions
app.post("/api/ruleta/preguntas", auth(true), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, paises_ids } = req.body

    // Validar que se hayan seleccionado países
    if (!paises_ids || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    // Insertar la pregunta
    const [result] = await connection.query(
      "INSERT INTO ruleta_preguntas (tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3) VALUES (?,?,?,?,?,?)",
      [tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3],
    )

    const preguntaId = result.insertId

    // Insertar las relaciones con países
    for (const paisId of paises_ids) {
      await connection.query("INSERT INTO ruleta_preguntas_paises (pregunta_id, pais_id) VALUES (?, ?)", [
        preguntaId,
        paisId,
      ])
    }

    await connection.commit()
    res.json({ mensaje: "Pregunta creada", id: preguntaId })
  } catch (error) {
    await connection.rollback()
    console.error("Error creating ruleta question:", error)
    res.status(500).json({ error: "Error del servidor" })
  } finally {
    connection.release()
  }
})

// MODIFICADO: Updated PUT endpoint to handle multiple countries for ruleta questions
app.put("/api/ruleta/preguntas/:id", auth(true), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa, paises_ids } =
      req.body

    // Validar que se hayan seleccionado países
    if (!paises_ids || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    // Actualizar la pregunta
    await connection.query(
      "UPDATE ruleta_preguntas SET tema_id=?, pregunta=?, respuesta_correcta=?, respuesta_1=?, respuesta_2=?, respuesta_3=?, activa=? WHERE id=?",
      [tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa, req.params.id],
    )

    // Eliminar relaciones existentes con países
    await connection.query("DELETE FROM ruleta_preguntas_paises WHERE pregunta_id = ?", [req.params.id])

    // Insertar las nuevas relaciones con países
    for (const paisId of paises_ids) {
      await connection.query("INSERT INTO ruleta_preguntas_paises (pregunta_id, pais_id) VALUES (?, ?)", [
        req.params.id,
        paisId,
      ])
    }

    await connection.commit()
    res.json({ mensaje: "Pregunta actualizada" })
  } catch (error) {
    await connection.rollback()
    console.error("Error updating ruleta question:", error)
    res.status(500).json({ error: "Error del servidor" })
  } finally {
    connection.release()
  }
})

app.delete("/api/ruleta/preguntas/:id", auth(true), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Eliminar relaciones con países primero
    await connection.query("DELETE FROM ruleta_preguntas_paises WHERE pregunta_id = ?", [req.params.id])

    // Eliminar la pregunta
    await connection.query("DELETE FROM ruleta_preguntas WHERE id = ?", [req.params.id])

    await connection.commit()
    res.json({ mensaje: "Pregunta eliminada" })
  } catch (error) {
    await connection.rollback()
    console.error("Error deleting ruleta question:", error)
    res.status(500).json({ error: "Error del servidor" })
  } finally {
    connection.release()
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor ejecutándose en http://localhost:3000")
})
