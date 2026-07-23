const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const [kriteria] = await connection.query("SHOW CREATE TABLE kriteria");
  console.log(kriteria[0]['Create Table']);
  
  try {
    const [bukti_dukung] = await connection.query("SHOW CREATE TABLE bukti_dukung");
    console.log(bukti_dukung[0]['Create Table']);
  } catch(e) {}
  
  const [indikator] = await connection.query("SHOW CREATE TABLE indikator");
  console.log(indikator[0]['Create Table']);
  
  process.exit();
}
run();
