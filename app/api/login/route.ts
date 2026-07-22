import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rows = await query(
      `SELECT id, nama, email, nip, instansi, role, status FROM pemdi_users 
       WHERE (email = ? OR nip = ?) AND password = ? LIMIT 1`,
      [username, username, password]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    if (user.status !== "Aktif") {
      return NextResponse.json({ error: "Akun nonaktif" }, { status: 403 });
    }

    // Fetch role permissions
    let permissions: string[] = [];
    if (user.role === "Super Admin") {
      permissions = [
        "Kelola Instansi", "Kelola Pengguna", "Kelola Indikator",
        "Kelola Pengguna OPD", "Input Penilaian", "Upload Dokumen",
        "Lihat Laporan", "Export Data", "Konfigurasi Sistem"
      ];
    } else {
      const roleRows = await query(
        `SELECT permissions FROM roles WHERE nama = ? LIMIT 1`,
        [user.role]
      ) as any[];
      if (roleRows && roleRows.length > 0) {
        const raw = roleRows[0].permissions;
        permissions = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
      }
    }
    user.permissions = permissions;

    // Update last_login
    await query(
      `UPDATE pemdi_users SET last_login = ? WHERE id = ?`,
      [new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit' }), user.id]
    );

    // Log login activity
    await query(
      `INSERT INTO log_activity (id, user_id, aksi, detail, created_at) VALUES (?, ?, 'Login', ?, NOW())`,
      [`l_${Date.now()}`, user.id, `User login ke sistem`]
    ).catch(() => {});

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
