import mysql from "mysql2/promise";

async function setup() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS pemdi;`);
    await connection.query(`USE pemdi;`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS aspek (
        id VARCHAR(50) PRIMARY KEY,
        no INT NOT NULL,
        nama VARCHAR(255) NOT NULL,
        bobot INT NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS indikator (
        id VARCHAR(50) PRIMARY KEY,
        no VARCHAR(50) NOT NULL,
        nama VARCHAR(255) NOT NULL,
        tipe VARCHAR(50) NOT NULL,
        bobot INT NOT NULL,
        nilai_capaian FLOAT,
        predikat VARCHAR(100),
        aspek_id VARCHAR(50),
        FOREIGN KEY (aspek_id) REFERENCES aspek(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS kriteria (
        id VARCHAR(50) PRIMARY KEY,
        indikator_id VARCHAR(50),
        level INT NOT NULL,
        label VARCHAR(100) NOT NULL,
        bobot FLOAT NOT NULL,
        deskripsi TEXT NOT NULL,
        FOREIGN KEY (indikator_id) REFERENCES indikator(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bukti_dukung (
        id VARCHAR(50) PRIMARY KEY,
        kriteria_id VARCHAR(50),
        file_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        catatan TEXT,
        FOREIGN KEY (kriteria_id) REFERENCES kriteria(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS indikator_akses (
        indikator_id VARCHAR(50),
        user_id VARCHAR(50),
        PRIMARY KEY (indikator_id, user_id),
        FOREIGN KEY (indikator_id) REFERENCES indikator(id) ON DELETE CASCADE
      );
    `);

    console.log("Database and tables created successfully.");

    // Seed some initial data for testing if aspects are empty
    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM aspek`);
    if (rows[0].count === 0) {
      console.log("Seeding initial data...");
      await connection.query(`INSERT INTO aspek (id, no, nama, bobot) VALUES ('a1', 1, 'Tata Kelola dan Manajemen', 31)`);
      await connection.query(`INSERT INTO aspek (id, no, nama, bobot) VALUES ('a2', 2, 'Pengembangan', 24)`);
      
      await connection.query(`INSERT INTO indikator (id, no, nama, tipe, bobot, nilai_capaian, predikat, aspek_id) VALUES ('i1', '1.1', 'Tingkat Ketersediaan Data Kinerja Pemerintah Digital', 'Internal', 6, 3.5, 'Berkembang Baik', 'a1')`);
      
      await connection.query(`INSERT INTO kriteria (id, indikator_id, level, label, bobot, deskripsi) VALUES ('k1_1', 'i1', 1, 'Inisiasi / Rintisan', 0.10, 'Pemerintah Daerah telah memiliki dokumen perencanaan...')`);
      await connection.query(`INSERT INTO kriteria (id, indikator_id, level, label, bobot, deskripsi) VALUES ('k1_2', 'i1', 2, 'Emerging / Cukup', 0.15, 'Pemerintah Daerah telah memiliki dokumen perencanaan Pemerintah Digital yang lebih spesifik...')`);
      await connection.query(`INSERT INTO kriteria (id, indikator_id, level, label, bobot, deskripsi) VALUES ('k1_3', 'i1', 3, 'Berkembang Baik', 0.25, 'Pemerintah Daerah telah memiliki data kinerja Pemerintah Digital...')`);
      
      await connection.query(`INSERT INTO bukti_dukung (id, kriteria_id, file_name, status) VALUES ('b1', 'k1_1', 'SK_Kebijakan_2024.pdf', 'uploaded')`);
      
      // Seed indikator_akses
      await connection.query(`INSERT IGNORE INTO indikator_akses (indikator_id, user_id) VALUES ('i1', 'u1')`);
      await connection.query(`INSERT IGNORE INTO indikator_akses (indikator_id, user_id) VALUES ('i1', 'u6')`); // Admin
    }

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await connection.end();
  }
}

setup();
