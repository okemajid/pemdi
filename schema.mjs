import mysql from "mysql2/promise";
const pool = mysql.createPool({ host: "localhost", user: "root", password: "root123", database: "pemdi" });
async function run() {
  const [res] = await pool.query("DESCRIBE pemdi_users");
  console.log(res);
  process.exit(0);
}
run();
