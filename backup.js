import mysql from "mysql2/promise";
import fs from "fs";

const dbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 48666,
  user: "root",
  password: "bjByHffRRNUhDEQuVeXkjDwSdmKLNYuf",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function dumpDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  console.log("✅ Conectado a Railway MySQL");

  // Obtener todas las tablas
  const [tables] = await connection.query("SHOW TABLES");
  const tableNames = tables.map((row) => Object.values(row)[0]);

  let dump = `-- Backup generado desde Node.js\n-- Base de datos: ${dbConfig.database}\n\n`;

  for (const table of tableNames) {
    console.log(`📥 Exportando tabla: ${table}`);

    // Esquema
    const [createTable] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
    dump += `\n-- Estructura de tabla \`${table}\`\n`;
    dump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    dump += `${createTable[0]["Create Table"]};\n\n`;

    // Datos
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      dump += `-- Datos de la tabla \`${table}\`\n`;
      for (const row of rows) {
        const values = Object.values(row).map((val) =>
          val === null ? "NULL" : connection.escape(val)
        );
        dump += `INSERT INTO \`${table}\` VALUES (${values.join(",")});\n`;
      }
      dump += "\n";
    }
  }

  // Guardar en archivo
  fs.writeFileSync("backup.sql", dump);
  console.log("✅ Backup completado en backup.sql");

  await connection.end();
}

dumpDatabase().catch((err) => {
  console.error("❌ Error en el backup:", err.message);
});
