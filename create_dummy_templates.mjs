import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import env manually for standalone script
import dotenv from 'dotenv';
dotenv.config();

const uploadDir = path.join(__dirname, 'public', 'uploads', 'templates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const dummies = [
  {
    nama: 'Template Surat Tugas',
    deskripsi: 'Format standar untuk pembuatan Surat Tugas di lingkungan Instansi.',
    tipe_dokumen: 'Umum'
  },
  {
    nama: 'Template Surat Edaran',
    deskripsi: 'Format resmi untuk penerbitan Surat Edaran bagi seluruh OPD.',
    tipe_dokumen: 'Surat Edaran'
  },
  {
    nama: 'Template SK Kepala Dinas',
    deskripsi: 'Format Surat Keputusan (SK) Kepala Dinas beserta lampirannya.',
    tipe_dokumen: 'Peraturan'
  },
  {
    nama: 'Template Undangan Rapat',
    deskripsi: 'Contoh draft undangan rapat koordinasi formal antar instansi.',
    tipe_dokumen: 'Umum'
  },
  {
    nama: 'Template Laporan SPPD',
    deskripsi: 'Format laporan hasil perjalanan dinas (SPPD).',
    tipe_dokumen: 'Umum'
  }
];

async function seed() {
  try {
    for (const d of dummies) {
      const id = `dummy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const fileName = `${id}.doc`;
      const filePath = path.join(uploadDir, fileName);
      const dbPath = `/uploads/templates/${fileName}`;

      // Create a dummy simple .doc file (a text file with .doc extension can be opened by Word, but we'll put some simple HTML to make it look decent)
      const dummyContent = `<html><body>
      <h2 style="text-align: center;">${d.nama}</h2>
      <p>Ini adalah dokumen dummy untuk <b>${d.nama}</b>.</p>
      <p>Deskripsi: ${d.deskripsi}</p>
      <br><br>
      <p>Tanda Tangan</p>
      </body></html>`;

      fs.writeFileSync(filePath, dummyContent);

      await db.execute(
        `INSERT INTO surat_template (id, nama, deskripsi, file_path, tipe_dokumen, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, d.nama, d.deskripsi, dbPath, d.tipe_dokumen, 'Admin Dummy']
      );
      
      console.log(`Created dummy: ${d.nama}`);
    }
    
    console.log("5 Dummy templates created successfully!");
  } catch (error) {
    console.error("Error creating dummies:", error);
  } finally {
    await db.end();
  }
}

seed();
