import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log("Running migration: surat_template...");
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS surat_template (
        id VARCHAR(50) PRIMARY KEY,
        indikator_id VARCHAR(50) NULL,
        kriteria_level INT NULL,
        nama VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        file_path VARCHAR(500) NOT NULL,
        tipe_dokumen VARCHAR(100) DEFAULT 'Umum',
        uploaded_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table surat_template created (or already exists).");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();
