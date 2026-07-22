import mysql from "mysql2/promise";
const pool = mysql.createPool({ host: "localhost", user: "root", password: "root123", database: "pemdi" });
async function run() {
  try {
    await pool.query("ALTER TABLE pemdi_users ADD COLUMN password VARCHAR(255) DEFAULT 'password123';");
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
