import 'dotenv/config';
import mysql from "mysql2/promise";
const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
async function run() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT 'password123';");
    console.log("Password column added successfully.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Password column already exists.");
    } else {
      console.error(e);
    }
  }
  process.exit(0);
}
run();
