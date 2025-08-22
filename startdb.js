import fs from "fs";
import mysql from "mysql2/promise";

// Configuración de la DB
const dbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 48666,
  user: "root",
  password: "bjByHffRRNUhDEQuVeXkjDwSdmKLNYuf",
  database: "railway",
  multipleStatements: true, // ⚠️ necesario para ejecutar varios statements del archivo SQL
};

async function runSQL() {
  let connection;
  try {
    // Leer archivo SQL
    const sqlFile = fs.readFileSync("sql.sql", "utf-8");

    // Crear conexión
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Conectado a Railway MySQL");

    // Ejecutar script
    await connection.query(sqlFile);
    console.log("🎉 Script SQL ejecutado correctamente");

  } catch (err) {
    console.error("❌ Error ejecutando script:", err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSQL();
