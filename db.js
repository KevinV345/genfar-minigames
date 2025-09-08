import mysql from "mysql2/promise"

// const dbConfig = {
//   host: "nozomi.proxy.rlwy.net",
//   port: 48666,
//   user: "root",
//   password: "bjByHffRRNUhDEQuVeXkjDwSdmKLNYuf",
//   database: "railway",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// }


const dbConfig = {
  host: "localhost",
  port: 3306 ,
  user: "root",
  password: "",
  database: "minijuegos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}




// Pool de conexiones
export const pool = mysql.createPool(dbConfig)

// Probar conexión
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conectado a Railway MySQL")
    connection.release()
  })
  .catch((error) => {
    console.error("❌ Falló la conexión:", error.message)
  })

// Cierre elegante
process.on("SIGINT", async () => {
  console.log("Cerrando conexiones...")
  await pool.end()
  process.exit(0)
})

export default pool
