import mysql from "mysql2/promise";

const dbConfig = {
  host: "127.0.0.1",   // igual que en tu comando
  port: 3306,
  user: "root",
  password: "Kevin2025@BGA",   // 👈 pon aquí la clave que usas en consola
  database: "minijuegos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Probar conexión
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conectado a MySQL en VPS");
    connection.release();
  })
  .catch((error) => {
    console.error("❌ Falló la conexión:", error.message);
  });

// Cierre elegante
process.on("SIGINT", async () => {
  console.log("Cerrando conexiones...");
  await pool.end();
  process.exit(0);
});

export default pool;
