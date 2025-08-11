import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "minijuegos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
export const pool = mysql.createPool(dbConfig)

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully")
    connection.release()
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message)
    console.log("Please check your database configuration and ensure MySQL is running")
  })

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connections...")
  await pool.end()
  process.exit(0)
})

export default pool
