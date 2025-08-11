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

const logChange = async (accion, detalle) => {
  try {
    await pool.query("INSERT INTO logs_cambios (accion, detalle) VALUES (?,?)", [accion, detalle])
  } catch (error) {
    console.error("Error logging change:", error)
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
    await logChange("Insert", `Nuevo usuario: ${nombre} (${correo})`)
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
    await logChange("Update", `Usuario actualizado ID: ${req.params.id}`)
    res.json({ mensaje: "Usuario actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/usuarios/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id=?", [req.params.id])
    await logChange("Delete", `Usuario eliminado ID: ${req.params.id}`)
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
    await logChange("Insert", `Nuevo país: ${nombre}`)
    res.json({ mensaje: "País agregado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/paises/:id", auth(true), async (req, res) => {
  try {
    const { nombre } = req.body
    await pool.query("UPDATE paises SET nombre=? WHERE id=?", [nombre, req.params.id])
    await logChange("Update", `País actualizado ID: ${req.params.id} - ${nombre}`)
    res.json({ mensaje: "País actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/paises/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM paises WHERE id=?", [req.params.id])
    await logChange("Delete", `País eliminado ID: ${req.params.id}`)
    res.json({ mensaje: "País eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/preguntas", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pa.nombre as pais_nombre 
      FROM genfy_pregunta p 
      LEFT JOIN paises pa ON p.pais_id = pa.id 
      ORDER BY pa.nombre, p.pregunta
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/preguntas/pais/:paisId", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT p.*, pa.nombre as pais_nombre 
      FROM genfy_pregunta p 
      LEFT JOIN paises pa ON p.pais_id = pa.id 
      WHERE p.pais_id = ?
    `,
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
    await logChange("Insert", `Nueva pregunta para país ID: ${pais_id}`)
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
    await logChange("Update", `Pregunta actualizada ID: ${req.params.id}`)
    res.json({ mensaje: "Pregunta actualizada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/preguntas/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_pregunta WHERE id=?", [req.params.id])
    await logChange("Delete", `Pregunta eliminada ID: ${req.params.id}`)
    res.json({ mensaje: "Pregunta eliminada" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/escenarios", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, p.nombre as pais_nombre 
      FROM genfy_encuentra_escenarios e 
      LEFT JOIN paises p ON e.pais_id = p.id 
      ORDER BY p.nombre
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/escenarios", auth(true), async (req, res) => {
  try {
    const { pais_id, imagen_fondo, imagen_objetivo } = req.body
    const [result] = await pool.query(
      "INSERT INTO genfy_encuentra_escenarios (pais_id, imagen_fondo, imagen_objetivo) VALUES (?,?,?)",
      [pais_id, imagen_fondo, imagen_objetivo],
    )
    await logChange("Insert", `Nuevo escenario para país ID: ${pais_id}`)
    res.json({ mensaje: "Escenario creado", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.put("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    const { pais_id, imagen_fondo, imagen_objetivo } = req.body
    await pool.query("UPDATE genfy_encuentra_escenarios SET pais_id=?, imagen_fondo=?, imagen_objetivo=? WHERE id=?", [
      pais_id,
      imagen_fondo,
      imagen_objetivo,
      req.params.id,
    ])
    await logChange("Update", `Escenario actualizado ID: ${req.params.id}`)
    res.json({ mensaje: "Escenario actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/escenarios/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM genfy_encuentra_escenarios WHERE id=?", [req.params.id])
    await logChange("Delete", `Escenario eliminado ID: ${req.params.id}`)
    res.json({ mensaje: "Escenario eliminado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.get("/api/colliders/escenario/:escenarioId", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM genfy_encuentra_colliders WHERE escenario_id = ? ORDER BY indice", [
      req.params.escenarioId,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/colliders/batch", auth(true), async (req, res) => {
  try {
    const { escenario_id, points } = req.body

    if (!escenario_id || !points || !Array.isArray(points)) {
      return res.status(400).json({ error: "Datos inválidos" })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      await connection.query("DELETE FROM genfy_encuentra_colliders WHERE escenario_id = ?", [escenario_id])

      for (const point of points) {
        await connection.query(
          "INSERT INTO genfy_encuentra_colliders (escenario_id, punto_x, punto_y, indice) VALUES (?,?,?,?)",
          [escenario_id, point.punto_x, point.punto_y, point.indice],
        )
      }

      await connection.commit()
      await logChange(
        "Insert",
        `Nuevo collider polígono para escenario ID: ${escenario_id} con ${points.length} puntos`,
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

app.get("/api/sprites", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, p.nombre as pais_nombre 
      FROM mision_genfy_sprites s 
      LEFT JOIN paises p ON s.pais_id = p.id 
      ORDER BY p.nombre, s.tipo
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.post("/api/sprites", auth(), async (req, res) => {
  try {
    const { pais_id, tipo, imagen_url } = req.body
    console.log("Creating sprite with data:", { pais_id, tipo, imagen_url })
    const [result] = await pool.query("INSERT INTO mision_genfy_sprites (pais_id, tipo, imagen_url) VALUES (?,?,?)", [
      pais_id,
      tipo,
      imagen_url,
    ])
    await logChange("Insert", `Nuevo sprite tipo ${tipo} para país ID: ${pais_id}`)
    res.json({ mensaje: "Sprite creado", id: result.insertId })
  } catch (error) {
    console.error("Error creating sprite:", error)
    res.status(500).json({ error: "Error del servidor", details: error.message })
  }
})

app.put("/api/sprites/:id", auth(true), async (req, res) => {
  try {
    const { pais_id, tipo, imagen_url } = req.body
    await pool.query("UPDATE mision_genfy_sprites SET pais_id=?, tipo=?, imagen_url=? WHERE id=?", [
      pais_id,
      tipo,
      imagen_url,
      req.params.id,
    ])
    await logChange("Update", `Sprite actualizado ID: ${req.params.id}`)
    res.json({ mensaje: "Sprite actualizado" })
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" })
  }
})

app.delete("/api/sprites/:id", auth(true), async (req, res) => {
  try {
    await pool.query("DELETE FROM mision_genfy_sprites WHERE id=?", [req.params.id])
    await logChange("Delete", `Sprite eliminado ID: ${req.params.id}`)
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

app.listen(3000, () => {
  console.log("Servidor ejecutándose en http://localhost:3000")
  console.log("Panel de administración disponible en http://localhost:3000")
})
