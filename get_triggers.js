const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const [triggers] = await connection.query("SHOW TRIGGERS");
  for (let t of triggers) {
     console.log("Trigger:", t.Trigger);
     console.log("Statement:", t.Statement);
  }
  process.exit();
}
run();
