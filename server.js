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
    const [rows] = await pool.query(`
      SELECT id, nombre, 
             genfy_pregunta_visible, 
             genfy_encuentra_visible, 
             mision_genfy_visible, 
             ruleta_visible 
      FROM paises ORDER BY nombre
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/paises/:id", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, nombre, 
             genfy_pregunta_visible, 
             genfy_encuentra_visible, 
             mision_genfy_visible, 
             ruleta_visible 
      FROM paises WHERE id=?
    `,
      [req.params.id],
    )
    if (!rows.length) return res.status(404).json({ error: "País no encontrado" })
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/paises", auth(true), async (req, res) => {
  try {
    const {
      nombre,
      genfy_pregunta_visible = true,
      genfy_encuentra_visible = true,
      mision_genfy_visible = true,
      ruleta_visible = true,
    } = req.body

    const [result] = await pool.query(
      `
      INSERT INTO paises (nombre, genfy_pregunta_visible, genfy_encuentra_visible, mision_genfy_visible, ruleta_visible) 
      VALUES (?, ?, ?, ?, ?)
    `,
      [nombre, genfy_pregunta_visible, genfy_encuentra_visible, mision_genfy_visible, ruleta_visible],
    )

    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo país", `País: ${nombre} - Configuración general`, usuario)
    res.json({ mensaje: "País agregado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/paises/:id", auth(true), async (req, res) => {
  try {
    const { nombre, genfy_pregunta_visible, genfy_encuentra_visible, mision_genfy_visible, ruleta_visible } = req.body

    await pool.query(
      `
      UPDATE paises SET 
        nombre=?, 
        genfy_pregunta_visible=?, 
        genfy_encuentra_visible=?, 
        mision_genfy_visible=?, 
        ruleta_visible=? 
      WHERE id=?
    `,
      [nombre, genfy_pregunta_visible, genfy_encuentra_visible, mision_genfy_visible, ruleta_visible, req.params.id],
    )

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






app.post("/api/objetos/:objetoId/colliders/batch", auth(true), async (req, res) => {
  try {
    const { objetoId } = req.params;
    const { points } = req.body;

    // Iniciar una transacción para asegurar la integridad de los datos
    await pool.query("START TRANSACTION");

    // Eliminar los colliders existentes para este objeto
    await pool.query("DELETE FROM genfy_encuentra_colliders WHERE objeto_id = ?", [objetoId]);

    // Insertar los nuevos puntos del collider
    const insertQuery = "INSERT INTO genfy_encuentra_colliders (objeto_id, punto_x, punto_y, indice) VALUES (?, ?, ?, ?)";
    for (const point of points) {
      await pool.query(insertQuery, [objetoId, point.punto_x, point.punto_y, point.indice]);
    }

    // Confirmar la transacción
    await pool.query("COMMIT");

    const usuario = await getUserInfo(req.user.id);
    await logChange("guardó colliders", `Objeto ID: ${objetoId}`, usuario);

    res.json({ mensaje: "Colliders guardados exitosamente" });
  } catch (error) {
    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");
    console.error("Error al guardar colliders:", error);
    res.status(500).json({ error: "Error del servidor al guardar los colliders" });
  }
});


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


// Obtener un objeto por su ID
app.get("/api/objetos/:id", async (req, res) => {
  try {
    const [objeto] = await pool.query(
      `SELECT id, 
              escenario_id, 
              imagen_objetivo, 
              orden, 
              enlace as Url
       FROM genfy_encuentra_objetos 
       WHERE id=?`,
      [req.params.id]
    )

    if (objeto.length === 0) {
      return res.status(404).json({ error: "Objeto no encontrado" })
    }

    // Normalizar enlace como URL
    const objetoConUrl = {
      ...objeto[0],
      enlace: objeto[0].enlace
        ? (/^https?:\/\//i.test(objeto[0].enlace)
            ? objeto[0].enlace
            : `http://${objeto[0].enlace}`)
        : null,
    }

    res.json(objetoConUrl)
  } catch (error) {
    console.error("Error al obtener objeto:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})


// Actualizar un objeto
app.put(
  "/api/objetos/:id",
  auth(true),
  upload.single("imagen_objetivo"),
  async (req, res) => {
    try {
      const { id } = req.params
      const { Url } = req.body
      let imagen_url = null

      if (req.file) {
        imagen_url = `/img/${req.file.filename}`
      }

      await pool.query("UPDATE genfy_encuentra_objetos SET enlace = ? WHERE id = ?", [Url, id])

      if (imagen_url) {
        await pool.query("UPDATE genfy_encuentra_objetos SET imagen_objetivo = ? WHERE id = ?", [
          imagen_url,
          id,
        ])
      }

      const usuario = await getUserInfo(req.user.id)
      await logChange(
        "actualizó un objeto",
        `Objeto actualizado en el escenario - ID: ${id}`,
        usuario,
      )

      res.json({ mensaje: "Objeto actualizado exitosamente" })
    } catch (error) {
      console.error("Error al actualizar objeto:", error)
      res.status(500).json({ error: "Error del servidor al actualizar el objeto" })
    }
  },
)

// Eliminar un objeto
app.delete("/api/objetos/:id", auth(true), async (req, res) => {
  try {
    const { id } = req.params

    // 1. Obtener la ruta de la imagen para eliminar el archivo
    const [objeto] = await pool.query("SELECT imagen_objetivo FROM genfy_encuentra_objetos WHERE id = ?", [id])
    if (objeto.length === 0) {
      return res.status(404).json({ error: "Objeto no encontrado" })
    }
    const imagenUrl = objeto[0].imagen_objetivo
    const imagePath = path.join(__dirname, "public", imagenUrl)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    // 2. Eliminar los colliders asociados
    await pool.query("DELETE FROM genfy_encuentra_colliders WHERE objeto_id = ?", [id])

    // 3. Eliminar el objeto
    await pool.query("DELETE FROM genfy_encuentra_objetos WHERE id=?", [id])

    const usuario = await getUserInfo(req.user.id)
    await logChange("eliminó un objeto", `Objeto eliminado - ID: ${id}`, usuario)

    res.json({ mensaje: "Objeto eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar objeto:", error)
    res.status(500).json({ error: "Error del servidor al eliminar el objeto" })
  }
})
app.get("/api/objetos/:id/colliders", async (req, res) => {
  try {
    const [colliders] = await pool.query("SELECT * FROM genfy_encuentra_colliders WHERE objeto_id = ?", [
      req.params.id,
    ])
    res.json(colliders)
  } catch (error) {
    console.error("Error al obtener colliders:", error)
    res.status(500).json({ error: "Error del servidor al obtener colliders" })
  }
})

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
    const { paises_ids, tipo, enlace } = req.body
    if (!paises_ids || !tipo || !req.file) {
      return res.status(400).json({ error: "Países, tipo e imagen son requeridos" })
    }
    const paisesIdsArray = paises_ids.split(",").map(Number)

    const imagen_url = `/img/${req.file.filename}`
    const [result] = await pool.query("INSERT INTO mision_genfy_sprites (tipo, imagen_url, enlace) VALUES (?,?,?)", [
      tipo,
      imagen_url,
      enlace || null,
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
    const { paises_ids, tipo, enlace } = req.body
    const paisesIdsArray = paises_ids.split(",").map(Number)
    let imagen_url = req.body.imagen_url

    if (req.file) {
      imagen_url = `/img/${req.file.filename}`
    }

    await pool.query("UPDATE mision_genfy_sprites SET tipo=?, imagen_url=?, enlace=? WHERE id=?", [
      tipo,
      imagen_url,
      enlace || null,
      spriteId,
    ])
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

app.get("/api/spritesUnity/:paisId", async (req, res) => {
  try {
    const { paisId } = req.params

    // Get all sprites for the country
    const [sprites] = await pool.query(
      `SELECT s.id, s.tipo, s.imagen_url, s.enlace
        FROM mision_genfy_sprites s
        JOIN mision_genfy_sprites_paises sp ON s.id = sp.sprite_id
        WHERE sp.pais_id = ?
        ORDER BY s.tipo ASC, s.id ASC`,
      [paisId],
    )

    if (sprites.length === 0) {
      return res.status(404).json({ error: "No se encontraron sprites para el país especificado." })
    }

    // Get therapy associations
    const [terapias] = await pool.query(
      `SELECT t.medicamento_id, t.bacteria_id
        FROM mision_genfy_terapias t
        JOIN mision_genfy_sprites_paises sp1 ON t.medicamento_id = sp1.sprite_id
        JOIN mision_genfy_sprites_paises sp2 ON t.bacteria_id = sp2.sprite_id
        WHERE sp1.pais_id = ? AND sp2.pais_id = ?`,
      [paisId, paisId],
    )

    // Separate sprites by type
    const spritesMedicamento = sprites.filter((s) => s.tipo === "medicamento")
    const spritesBacteria = sprites.filter((s) => s.tipo === "bacteria")

    // Create therapy pairs and remaining sprites
    const medicamentoArray = []
    const bacteriaArray = []
    const usedMedicamentos = new Set()
    const usedBacterias = new Set()

    // First, add therapy pairs maintaining same index
    terapias.forEach((terapia) => {
      const medicamento = spritesMedicamento.find((s) => s.id === terapia.medicamento_id)
      const bacteria = spritesBacteria.find((s) => s.id === terapia.bacteria_id)

      if (medicamento && bacteria) {
        const { tipo: tipoMed, ...medicamentoData } = medicamento
        const { tipo: tipoBac, ...bacteriaData } = bacteria

        medicamentoArray.push(medicamentoData)
        bacteriaArray.push(bacteriaData)
        usedMedicamentos.add(medicamento.id)
        usedBacterias.add(bacteria.id)
      }
    })

    // Fill remaining slots with unpaired sprites
    const remainingMedicamentos = spritesMedicamento.filter((s) => !usedMedicamentos.has(s.id))
    const remainingBacterias = spritesBacteria.filter((s) => !usedBacterias.has(s.id))

    // Function to fill array to exactly 6 elements
    const fillToSix = (targetArray, sourceArray) => {
      while (targetArray.length < 6) {
        if (sourceArray.length === 0) break

        const sprite = sourceArray[targetArray.length % sourceArray.length]
        const { tipo, ...spriteData } = sprite
        targetArray.push(spriteData)
      }

      // Ensure exactly 6 elements
      return targetArray.slice(0, 6)
    }

    const finalMedicamentos = fillToSix([...medicamentoArray], remainingMedicamentos)
    const finalBacterias = fillToSix([...bacteriaArray], remainingBacterias)

    res.json({
      medicamento: finalMedicamentos,
      bacteria: finalBacterias,
    })
  } catch (error) {
    console.error("Error al obtener sprites para Unity:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})
app.post("/api/escenarios", auth(true), upload.single("imagen"), async (req, res) => {
  try {
    console.log("[v0] Creating escenario - body:", req.body)
    console.log("[v0] Creating escenario - file:", req.file)

    let paises_ids, imagen_fondo

    // Handle FormData (with file upload)
    if (req.file) {
      paises_ids = JSON.parse(req.body.paises_ids || "[]")
      imagen_fondo = `/img/${req.file.filename}`
    } else {
      // Handle JSON request
      paises_ids = req.body.paises_ids
      imagen_fondo = req.body.imagen_fondo
    }

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

    const usuario = await getUserInfo(req.user.id)
    await logChange("creó un nuevo escenario", `Escenario ID: ${escenarioId}`, usuario)

    console.log("[v0] Escenario created successfully:", escenarioId)
    res.json({ mensaje: "Escenario creado", id: escenarioId })
  } catch (error) {
    console.error("[v0] Error creating escenario:", error)
    res.status(500).json({ error: "Error del servidor: " + error.message })
  }
})
app.put("/api/escenarios/:id", auth(true), upload.single("imagen"), async (req, res) => {
  try {
    const escenarioId = req.params.id
    console.log("[v0] Updating escenario:", escenarioId, "- body:", req.body)
    console.log("[v0] Updating escenario - file:", req.file)

    let paises_ids, imagen_fondo

    // Handle FormData (with file upload)
    if (req.file) {
      paises_ids = JSON.parse(req.body.paises_ids || "[]")
      imagen_fondo = `/img/${req.file.filename}`
    } else {
      // Handle JSON request
      paises_ids = req.body.paises_ids
      imagen_fondo = req.body.imagen_fondo
    }

    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0 || !imagen_fondo) {
      return res.status(400).json({ error: "Países e imagen de fondo son requeridos" })
    }

    await pool.query("UPDATE genfy_encuentra_escenarios SET imagen_fondo=? WHERE id=?", [
      imagen_fondo,
      escenarioId,
    ])
    await pool.query("DELETE FROM genfy_encuentra_escenarios_paises WHERE escenario_id=?", [escenarioId])

    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO genfy_encuentra_escenarios_paises (escenario_id, pais_id) VALUES (?,?)", [
        escenarioId,
        paisId,
      ])
    }

    const usuario = await getUserInfo(req.user.id)
    await logChange("actualizó un escenario", `Escenario ID: ${escenarioId}`, usuario)

    console.log("[v0] Escenario updated successfully:", escenarioId)
    res.json({ mensaje: "Escenario actualizado" })
  } catch (error) {
    console.error("[v0] Error updating escenario:", error)
    res.status(500).json({ error: "Error del servidor: " + error.message })
  }
})
app.post("/api/escenarios/:id/objetos", auth(true), upload.single("imagen_objetivo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo de imagen" })
    }

    const { Url } = req.body
    const escenarioId = req.params.id
    const imagen_url = `/img/${req.file.filename}`

    // CORRECCIÓN: El número de '?' debe coincidir con el número de valores.
    await pool.query("INSERT INTO genfy_encuentra_objetos (escenario_id, imagen_objetivo, enlace) VALUES (?, ?, ?)", [
      escenarioId,
      imagen_url,
      Url
    ])

    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo objeto", `Objeto agregado al escenario ${escenarioId}`, usuario)

    res.status(201).json({ mensaje: "Objeto agregado exitosamente" })
  } catch (error) {
    console.error("Error al agregar objeto:", error)
    res.status(500).json({ error: "Error del servidor al agregar el objeto" })
  }
})

app.get("/api/escenariosUnity/:paisId", async (req, res) => {
  try {
    const { paisId } = req.params

    // Get all scenarios for the country
    const [escenarios] = await pool.query(
      `SELECT e.id, e.imagen_fondo
       FROM genfy_encuentra_escenarios e
       JOIN genfy_encuentra_escenarios_paises ep ON e.id = ep.escenario_id
       WHERE ep.pais_id = ?
       ORDER BY e.id ASC`,
      [paisId],
    )

    if (escenarios.length === 0) {
      return res.status(404).json({ error: "No se encontraron escenarios para el país especificado." })
    }

    // Get objects for each scenario
    const escenariosConObjetos = await Promise.all(
      escenarios.map(async (escenario) => {
        const [objetos] = await pool.query(
          `SELECT o.id, o.imagen_objetivo, o.orden, o.enlace,
                 GROUP_CONCAT(CONCAT(c.punto_x, ',', c.punto_y) ORDER BY c.indice SEPARATOR ';') as colliders
           FROM genfy_encuentra_objetos o
           LEFT JOIN genfy_encuentra_colliders c ON o.id = c.objeto_id
           WHERE o.escenario_id = ?
           GROUP BY o.id
           ORDER BY o.orden ASC`,
          [escenario.id],
        )

        // Process colliders
        const objetosConColliders = objetos.map((obj) => ({
          ...obj,
          colliders: obj.colliders
            ? obj.colliders.split(";").map((point) => {
                const [x, y] = point.split(",")
                return { x: Number.parseFloat(x), y: Number.parseFloat(y) }
              })
            : [],
        }))

        return {
          ...escenario,
          objetos: objetosConColliders,
        }
      }),
    )

    res.json(escenariosConObjetos)
  } catch (error) {
    console.error("Error al obtener escenarios para Unity:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/terapias", async (req, res) => {
  try {
    const [terapias] = await pool.query(
      `SELECT
         t.id,
         t.medicamento_id,
         t.bacteria_id,
         med_sprite.imagen_url AS medicamento_imagen,
         bac_sprite.imagen_url AS bacteria_imagen
       FROM mision_genfy_terapias t
       LEFT JOIN mision_genfy_sprites AS med_sprite ON t.medicamento_id = med_sprite.id
       LEFT JOIN mision_genfy_sprites AS bac_sprite ON t.bacteria_id = bac_sprite.id
       ORDER BY t.id`
    );
    res.json(terapias);
  } catch (error) {
    console.error("Error al obtener terapias:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.post("/api/terapias", async (req, res) => {
  try {
    const { medicamento_id, bacteria_id } = req.body

    if (!medicamento_id || !bacteria_id) {
      return res.status(400).json({ error: "Medicamento y bacteria son requeridos" })
    }

    const [result] = await pool.query("INSERT INTO mision_genfy_terapias (medicamento_id, bacteria_id) VALUES (?, ?)", [
      medicamento_id,
      bacteria_id,
    ])

    res.json({ id: result.insertId, medicamento_id, bacteria_id })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Esta asociación de terapia ya existe" })
    }
    console.error("Error al crear terapia:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/terapias/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM mision_genfy_terapias WHERE id = ?", [id])
    res.json({ message: "Terapia eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar terapia:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/ruleta/temas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ruleta_temas ORDER BY nombre")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})




app.delete("/api/ruleta/temas/:id", auth(true), async (req, res) => {
  try {
    const [temaToDelete] = await pool.query("SELECT nombre FROM ruleta_temas WHERE id=?", [req.params.id])
    const nombreTema = temaToDelete.length > 0 ? temaToDelete[0].nombre : "Tema desconocido"

    await pool.query("DELETE FROM ruleta_temas WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un tema de ruleta",
      `Tema eliminado: ${nombreTema} - Juego Ruleta - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Tema eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/ruleta/preguntas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rp.*, rt.nombre as tema_nombre,
            GROUP_CONCAT(p.nombre SEPARATOR ', ') as paises_nombres,
            GROUP_CONCAT(p.id SEPARATOR ',') as paises_ids
       FROM ruleta_preguntas rp 
       LEFT JOIN ruleta_temas rt ON rp.tema_id = rt.id
       LEFT JOIN ruleta_preguntas_paises rpp ON rp.id = rpp.pregunta_id
       LEFT JOIN paises p ON rpp.pais_id = p.id 
       GROUP BY rp.id
       ORDER BY rp.id DESC`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})
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
       ORDER BY e.id DESC`
    )

    res.json(rows)
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

app.get("/api/escenarios/:id/objetos", async (req, res) => {
  try {
    const [objetos] = await pool.query(
      `SELECT o.id, 
              o.imagen_objetivo, 
              o.orden, 
              o.enlace,
              GROUP_CONCAT(CONCAT(c.punto_x, ',', c.punto_y) ORDER BY c.indice SEPARATOR ';') as colliders
      FROM genfy_encuentra_objetos o
      LEFT JOIN genfy_encuentra_colliders c ON o.id = c.objeto_id
      WHERE o.escenario_id = ?
      GROUP BY o.id
      ORDER BY o.orden ASC`,
      [req.params.id]
    )


    const objetosConColliders = objetos.map((obj) => ({
      ...obj,
      colliders: obj.colliders
        ? obj.colliders.split(";").map((point) => {
            const [x, y] = point.split(",")
            return { x: Number.parseFloat(x), y: Number.parseFloat(y) }
          })
        : [],
    }))

    res.json(objetosConColliders)
  } catch (error) {
    console.error("Error al obtener objetos del escenario:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/ruleta/preguntas", auth(true), async (req, res) => {
  try {
    const { tema_id, paises_ids, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa } =
      req.body

    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    const [result] = await pool.query(
      "INSERT INTO ruleta_preguntas (tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa) VALUES (?,?,?,?,?,?,?)",
      [tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa ? 1 : 0],
    )
    const preguntaId = result.insertId

    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO ruleta_preguntas_paises (pregunta_id, pais_id) VALUES (?,?)", [preguntaId, paisId])
    }

    const [paisesInfo] = await pool.query("SELECT nombre FROM paises WHERE id IN (?)", [paises_ids])
    const nombresPaises = paisesInfo.map((p) => p.nombre).join(", ")
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó una nueva pregunta de ruleta", `Pregunta para ${nombresPaises} - Juego Ruleta`, usuario)

    res.json({ mensaje: "Pregunta creada", id: preguntaId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/ruleta/preguntas/:id", auth(true), async (req, res) => {
  try {
    const preguntaId = req.params.id
    const { tema_id, paises_ids, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa } =
      req.body

    if (!paises_ids || !Array.isArray(paises_ids) || paises_ids.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un país" })
    }

    await pool.query(
      "UPDATE ruleta_preguntas SET tema_id=?, pregunta=?, respuesta_correcta=?, respuesta_1=?, respuesta_2=?, respuesta_3=?, activa=? WHERE id=?",
      [tema_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, activa ? 1 : 0, preguntaId],
    )

    await pool.query("DELETE FROM ruleta_preguntas_paises WHERE pregunta_id=?", [preguntaId])

    for (const paisId of paises_ids) {
      await pool.query("INSERT INTO ruleta_preguntas_paises (pregunta_id, pais_id) VALUES (?,?)", [preguntaId, paisId])
    }

    const [paisesInfo] = await pool.query("SELECT nombre FROM paises WHERE id IN (?)", [paises_ids])
    const nombresPaises = paisesInfo.map((p) => p.nombre).join(", ")
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó una pregunta de ruleta",
      `Pregunta de ${nombresPaises} - Juego Ruleta - ID: ${preguntaId}`,
      usuario,
    )

    res.json({ mensaje: "Pregunta actualizada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/ruleta/preguntas/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM ruleta_preguntas WHERE id=?", [req.params.id])
    res.json({ mensaje: "Pregunta eliminada" })
  } catch (error) {
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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`)
})




