import 'dotenv/config';
import mysql from "mysql2/promise";
const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
async function run() {
  const [res] = await pool.query("DESCRIBE users");
  console.log(res);
  process.exit(0);
}
run();
