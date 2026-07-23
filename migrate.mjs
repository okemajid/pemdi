import 'dotenv/config';
import mysql from "mysql2/promise";

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log("Adding tahun column to aspek table...");
    await connection.query(`ALTER TABLE aspek ADD COLUMN tahun INT NOT NULL DEFAULT 2026;`);
    console.log("Success.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column tahun already exists.");
    } else {
      console.error(err);
    }
  } finally {
    await connection.end();
  }
}

run();
