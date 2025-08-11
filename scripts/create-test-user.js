// Script para crear un usuario de prueba con bcrypt
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

async function createTestUser() {
  try {
    // Generar hash para la contraseña "admin123"
    const password = 'admin123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('Generated hash:', hash);
    
    // Eliminar usuario existente
    await pool.query('DELETE FROM usuarios WHERE correo = ?', ['admin@minijuegos.com']);
    
    // Crear nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena_hash, es_admin) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@minijuegos.com', hash, 1]
    );
    
    console.log('User created with ID:', result.insertId);
    
    // Verificar que se puede hacer login
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', ['admin@minijuegos.com']);
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.contrasena_hash);
      console.log('Password verification:', match ? 'SUCCESS' : 'FAILED');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
