import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pemdi',
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS surat_template (
      id VARCHAR(50) PRIMARY KEY,
      indikator_id VARCHAR(50) NULL,
      kriteria_level INT NULL,
      nama VARCHAR(255) NOT NULL,
      deskripsi TEXT NULL,
      file_path VARCHAR(500) NULL,
      tipe_dokumen VARCHAR(50) DEFAULT 'Umum',
      uploaded_by VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await connection.execute(sql);
    console.log("Tabel surat_template berhasil dibuat!");
  } catch (error) {
    console.error("Gagal membuat tabel:", error);
  } finally {
    await connection.end();
  }
}

run();
