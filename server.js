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

app.get("/api/preguntas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, pa.nombre as pais_nombre FROM genfy_pregunta p LEFT JOIN paises pa ON p.pais_id = pa.id ORDER BY pa.nombre, p.pregunta`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/preguntas/pais/:paisId", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, pa.nombre as pais_nombre FROM genfy_pregunta p LEFT JOIN paises pa ON p.pais_id = pa.id WHERE p.pais_id = ?`,
      [req.params.paisId],
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/preguntas", auth(true), async (req, res) => {
  try {
    const { pais_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3 } = req.body
    const [result] = await pool.query(
      "INSERT INTO genfy_pregunta (pais_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3) VALUES (?,?,?,?,?,?)",
      [pais_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3],
    )
    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó una nueva pregunta", `Pregunta para ${nombrePais} - Juego Genfy Pregunta`, usuario)
    res.json({ mensaje: "Pregunta creada", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/preguntas/:id", auth(true), async (req, res) => {
  try {
    const { pais_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3 } = req.body
    await pool.query(
      "UPDATE genfy_pregunta SET pais_id=?, pregunta=?, respuesta_correcta=?, respuesta_1=?, respuesta_2=?, respuesta_3=? WHERE id=?",
      [pais_id, pregunta, respuesta_correcta, respuesta_1, respuesta_2, respuesta_3, req.params.id],
    )
    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó una pregunta",
      `Pregunta de ${nombrePais} - Juego Genfy Pregunta - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Pregunta actualizada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/preguntas/:id", auth(true), async (req, res) => {
  try {
    const [preguntaInfo] = await pool.query(
      `SELECT p.pregunta, pa.nombre as pais_nombre FROM genfy_pregunta p LEFT JOIN paises pa ON p.pais_id = pa.id WHERE p.id=?`,
      [req.params.id],
    )

    const infoPregunta =
      preguntaInfo.length > 0
        ? `${preguntaInfo[0].pregunta.substring(0, 50)}... de ${preguntaInfo[0].pais_nombre}`
        : "Pregunta desconocida"

    await pool.query("DELETE FROM genfy_pregunta WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó una pregunta",
      `Pregunta eliminada: ${infoPregunta} - Juego Genfy Pregunta - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Pregunta eliminada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, p.nombre as pais_nombre FROM genfy_encuentra_escenarios e LEFT JOIN paises p ON e.pais_id = p.id ORDER BY p.nombre`,
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenariosUnity/:paisId", async (req, res) => {
  const { paisId } = req.params;

  try {
    // Traer escenarios con su país
    const [escenarios] = await pool.query(
      `SELECT e.*, p.nombre AS pais_nombre
       FROM genfy_encuentra_escenarios e
       LEFT JOIN paises p ON e.pais_id = p.id
       WHERE e.pais_id = ?`,
      [paisId]
    );

    for (let escenario of escenarios) {
      // Traer objetos de este escenario
      const [objetos] = await pool.query(
        `SELECT o.id, o.imagen_objetivo, o.orden
         FROM genfy_encuentra_objetos o
         WHERE o.escenario_id = ?
         ORDER BY o.orden ASC`,
        [escenario.id]
      );

      for (let objeto of objetos) {
        // Traer colliders de cada objeto
        const [colliders] = await pool.query(
          `SELECT c.id, c.punto_x, c.punto_y, c.indice
           FROM genfy_encuentra_colliders c
           WHERE c.objeto_id = ?
           ORDER BY c.indice ASC`,
          [objeto.id]
        );
        objeto.colliders = colliders;
      }

      escenario.objetos = objetos;
    }

    res.json(escenarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});


app.post("/api/escenarios", auth(true), async (req, res) => {
  try {
    const { pais_id, imagen_fondo } = req.body

    if (!pais_id || !imagen_fondo) {
      return res.status(400).json({ error: "País e imagen de fondo son requeridos" })
    }

    const [result] = await pool.query("INSERT INTO genfy_encuentra_escenarios (pais_id, imagen_fondo) VALUES (?,?)", [
      pais_id,
      imagen_fondo,
    ])

    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo escenario", `Escenario para ${nombrePais} - Juego Genfy Encuentra`, usuario)

    res.json({ mensaje: "Escenario creado", id: result.insertId })
  } catch (error) {
    console.error("Error creating scenario:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    const { pais_id, imagen_fondo } = req.body

    if (!pais_id || !imagen_fondo) {
      return res.status(400).json({ error: "País e imagen de fondo son requeridos" })
    }

    await pool.query("UPDATE genfy_encuentra_escenarios SET pais_id=?, imagen_fondo=? WHERE id=?", [
      pais_id,
      imagen_fondo,
      req.params.id,
    ])

    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó un escenario",
      `Escenario de ${nombrePais} - Juego Genfy Encuentra - ID: ${req.params.id}`,
      usuario,
    )

    res.json({ mensaje: "Escenario actualizado" })
  } catch (error) {
    console.error("Error updating scenario:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    const [escenarioInfo] = await pool.query(
      `SELECT pa.nombre as pais_nombre FROM genfy_encuentra_escenarios e LEFT JOIN paises pa ON e.pais_id = pa.id WHERE e.id=?`,
      [req.params.id],
    )

    const nombrePais = escenarioInfo.length > 0 ? escenarioInfo[0].pais_nombre : "País desconocido"

    // Delete related objects and colliders first
    await pool.query(
      "DELETE FROM genfy_encuentra_colliders WHERE objeto_id IN (SELECT id FROM genfy_encuentra_objetos WHERE escenario_id = ?)",
      [req.params.id],
    )
    await pool.query("DELETE FROM genfy_encuentra_objetos WHERE escenario_id = ?", [req.params.id])
    await pool.query("DELETE FROM genfy_encuentra_escenarios WHERE id=?", [req.params.id])

    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un escenario",
      `Escenario de ${nombrePais} eliminado - Juego Genfy Encuentra - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Escenario eliminado" })
  } catch (error) {
    console.error("Error deleting scenario:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenarios/:escenarioId/objetos", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM genfy_encuentra_objetos WHERE escenario_id = ? ORDER BY orden, id`, [
      req.params.escenarioId,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})
app.post("/api/escenarios/:escenarioId/objetos", auth(true), async (req, res) => {
  try {
    const { imagen_objetivo, orden } = req.body
    const escenario_id = req.params.escenarioId

    const [result] = await pool.query(
      "INSERT INTO genfy_encuentra_objetos (escenario_id, imagen_objetivo, orden) VALUES (?,?,?)",
      [escenario_id, imagen_objetivo, orden || 1],
    )

    const [escenarioInfo] = await pool.query(
      `SELECT pa.nombre as pais_nombre 
       FROM genfy_encuentra_escenarios e 
       LEFT JOIN paises pa ON e.pais_id = pa.id 
       WHERE e.id=?`,
      [escenario_id],
    )

    const nombrePais = escenarioInfo.length > 0 ? escenarioInfo[0].pais_nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "agregó un objeto",
      `Objeto al escenario de ${nombrePais} - Juego Genfy Encuentra`,
      usuario,
    )

    res.json({ mensaje: "Objeto creado", id: result.insertId })
  } catch (error) {
    console.error("Error creating object:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/objetos/:id", auth(true), async (req, res) => {
  try {
    const { imagen_objetivo, orden } = req.body
    await pool.query(
      "UPDATE genfy_encuentra_objetos SET imagen_objetivo=?, orden=? WHERE id=?",
      [imagen_objetivo, orden || 1, req.params.id],
    )

    const [objetoInfo] = await pool.query(
      `SELECT pa.nombre as pais_nombre 
       FROM genfy_encuentra_objetos o 
       JOIN genfy_encuentra_escenarios e ON o.escenario_id = e.id 
       LEFT JOIN paises pa ON e.pais_id = pa.id 
       WHERE o.id=?`,
      [req.params.id],
    )

    const nombrePais = objetoInfo.length > 0 ? objetoInfo[0].pais_nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó un objeto",
      `Objeto del escenario de ${nombrePais} - Juego Genfy Encuentra - ID: ${req.params.id}`,
      usuario,
    )

    res.json({ mensaje: "Objeto actualizado" })
  } catch (error) {
    console.error("Error updating object:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/objetos/:id", auth(true), async (req, res) => {
  try {
    const [objetoInfo] = await pool.query(
      `SELECT pa.nombre as pais_nombre 
       FROM genfy_encuentra_objetos o 
       JOIN genfy_encuentra_escenarios e ON o.escenario_id = e.id 
       LEFT JOIN paises pa ON e.pais_id = pa.id 
       WHERE o.id=?`,
      [req.params.id],
    )

    const nombrePais = objetoInfo.length > 0 ? objetoInfo[0].pais_nombre : "País desconocido"

    await pool.query("DELETE FROM genfy_encuentra_objetos WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un objeto",
      `Objeto del escenario de ${nombrePais} - Juego Genfy Encuentra - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Objeto eliminado" })
  } catch (error) {
    console.error("Error deleting object:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})


app.get("/api/colliders/escenario/:escenarioId", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM genfy_encuentra_colliders WHERE escenario_id = ? ORDER BY indice", [
      req.params.escenarioId,
    ])
    res.json(rows)
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
  try {
    const { points } = req.body
    const objeto_id = req.params.objetoId

    if (!objeto_id || !points || !Array.isArray(points)) {
      return res.status(400).json({ error: "Datos inválidos" })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Borrar colliders existentes
      await connection.query("DELETE FROM genfy_encuentra_colliders WHERE objeto_id = ?", [objeto_id])

      // Insertar nuevos colliders
      for (const point of points) {
        await connection.query(
          "INSERT INTO genfy_encuentra_colliders (objeto_id, punto_x, punto_y, indice) VALUES (?,?,?,?)",
          [objeto_id, point.punto_x, point.punto_y, point.indice],
        )
      }

      await connection.commit()

      const [objetoInfo] = await connection.query(
        `SELECT pa.nombre as pais_nombre 
         FROM genfy_encuentra_objetos o 
         JOIN genfy_encuentra_escenarios e ON o.escenario_id = e.id 
         LEFT JOIN paises pa ON e.pais_id = pa.id 
         WHERE o.id=?`,
        [objeto_id],
      )

      const nombrePais = objetoInfo.length > 0 ? objetoInfo[0].pais_nombre : "País desconocido"
      const usuario = await getUserInfo(req.user.id)
      await logChange(
        "configuró colliders",
        `Polígono de ${points.length} puntos para objeto del escenario de ${nombrePais} - Juego Genfy Encuentra`,
        usuario,
      )

      res.json({ mensaje: "Collider polígono creado exitosamente", puntos: points.length })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error creating batch colliders:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})


app.post("/api/colliders", auth(true), async (req, res) => {
  try {
    const { escenario_id, punto_x, punto_y, indice } = req.body
    const [result] = await pool.query(
      "INSERT INTO genfy_encuentra_colliders (escenario_id, punto_x, punto_y, indice) VALUES (?,?,?,?)",
      [escenario_id, punto_x, punto_y, indice],
    )
    await logChange("Insert", `Nuevo collider para escenario ID: ${escenario_id}`)
    res.json({ mensaje: "Collider creado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/colliders/:id", auth(true), async (req, res) => {
  try {
    const { escenario_id, punto_x, punto_y, indice } = req.body
    await pool.query("UPDATE genfy_encuentra_colliders SET escenario_id=?, punto_x=?, punto_y=?, indice=? WHERE id=?", [
      escenario_id,
      punto_x,
      punto_y,
      indice,
      req.params.id,
    ])
    await logChange("Update", `Collider actualizado ID: ${req.params.id}`)
    res.json({ mensaje: "Collider actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/colliders/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_encuentra_colliders WHERE id=?", [req.params.id])
    await logChange("Delete", `Collider eliminado ID: ${req.params.id}`)
    res.json({ mensaje: "Collider eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/sprites", async (req, res) => {
  try{
    const [rows] = await pool.query(
      `SELECT s.*, p.nombre as pais_nombre FROM mision_genfy_sprites s LEFT JOIN paises p ON s.pais_id = p.id ORDER BY p.nombre, s.tipo`,
    )
    res.json(rows)
  }catch (error){
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/sprites", auth(), upload.single("imagen"), async (req, res) => {
  try {
    const { pais_id, tipo } = req.body
    console.log("Creating sprite with data:", { pais_id, tipo, file: req.file ? req.file.filename : "no file" })

    if (!pais_id || !tipo) {
      return res.status(400).json({ error: "País y tipo son requeridos" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "Imagen es requerida" })
    }

    const imagen_url = `/img/${req.file.filename}`

    const [result] = await pool.query("INSERT INTO mision_genfy_sprites (pais_id, tipo, imagen_url) VALUES (?,?,?)", [
      pais_id,
      tipo,
      imagen_url,
    ])

    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange("agregó un nuevo sprite", `Sprite tipo '${tipo}' para ${nombrePais} - Juego Misión Genfy`, usuario)

    res.json({ success: true, mensaje: "Sprite creado", id: result.insertId })
  } catch (error) {
    console.error("Error creating sprite:", error)
    res.status(500).json({ error: "Error del servidor", details: error.message })
  }
})

app.put("/api/sprites/:id", auth(true), upload.single("imagen"), async (req, res) => {
  try {
    const { pais_id, tipo } = req.body
    let imagen_url = req.body.imagen_url // Para mantener la imagen existente si no se sube nueva

    if (req.file) {
      imagen_url = `/img/${req.file.filename}`
    }

    await pool.query("UPDATE mision_genfy_sprites SET pais_id=?, tipo=?, imagen_url=? WHERE id=?", [
      pais_id,
      tipo,
      imagen_url,
      req.params.id,
    ])

    const [paisInfo] = await pool.query("SELECT nombre FROM paises WHERE id=?", [pais_id])
    const nombrePais = paisInfo.length > 0 ? paisInfo[0].nombre : "País desconocido"
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "actualizó un sprite",
      `Sprite tipo '${tipo}' de ${nombrePais} - Juego Misión Genfy - ID: ${req.params.id}`,
      usuario,
    )

    res.json({ success: true, mensaje: "Sprite actualizado" })
  } catch (error) {
    console.error("Error updating sprite:", error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/sprites/:id", auth(true), async (req, res) => {
  try {
    const [spriteInfo] = await pool.query(
      `SELECT s.tipo, pa.nombre as pais_nombre FROM mision_genfy_sprites s LEFT JOIN paises pa ON s.pais_id = pa.id WHERE s.id=?`,
      [req.params.id],
    )

    const infoSprite =
      spriteInfo.length > 0 ? `tipo '${spriteInfo[0].tipo}' de ${spriteInfo[0].pais_nombre}` : "Sprite desconocido"

    await pool.query("DELETE FROM mision_genfy_sprites WHERE id=?", [req.params.id])
    const usuario = await getUserInfo(req.user.id)
    await logChange(
      "eliminó un sprite",
      `Sprite ${infoSprite} eliminado - Juego Misión Genfy - ID: ${req.params.id}`,
      usuario,
    )
    res.json({ mensaje: "Sprite eliminado" })
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor ejecutándose en http://localhost:3000")
  console.log("Panel de administración disponible en http://localhost:3000")
})
