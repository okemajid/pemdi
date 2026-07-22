import mysql from "mysql2/promise";

const pool = mysql.createPool({ 
  host: "localhost", 
  user: "root", 
  password: "root123", 
  database: "pemdi" 
});

async function run() {
  try {
    const id = 'admin_1';
    const nama = 'Super Admin System';
    const email = 'admin@pemdi.go.id';
    const nip = '198001012005011001';
    const instansi = 'Kementerian Dalam Negeri';
    const role = 'Super Admin';
    const status = 'Aktif';
    const lastLogin = '-';
    const password = 'password123'; // Password admin default

    // Insert or Replace
    await pool.query(
      `REPLACE INTO pemdi_users (id, nama, email, nip, instansi, role, status, last_login, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nama, email, nip, instansi, role, status, lastLogin, password]
    );

    console.log("Akun Admin berhasil dibuat!");
    console.log("Email: " + email);
    console.log("NIP: " + nip);
    console.log("Password: " + password);

  } catch (error) {
    console.error("Gagal membuat akun admin:", error);
  } finally {
    process.exit(0);
  }
}

run();
