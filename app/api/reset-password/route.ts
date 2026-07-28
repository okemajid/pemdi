import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });
    }

    // Check if token exists and is valid (within 30 mins)
    const rows = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE email = ? AND token = ? AND created_at >= NOW() - INTERVAL 30 MINUTE 
       LIMIT 1`,
      [email, token]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    // Verify user exists and get user details for log
    const userRows = await query(
      `SELECT id, nama FROM users WHERE email = ? LIMIT 1`,
      [email]
    ) as any[];

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const user = userRows[0];

    // Update password in users table
    // (Note: In a real production app, this should be hashed, e.g. bcrypt. 
    // Here we are following the existing app's plaintext password pattern as seen in login API)
    await query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [password, email]
    );

    // Delete token to prevent reuse
    await query(
      `DELETE FROM password_reset_tokens WHERE email = ?`,
      [email]
    );

    // Log activity
    await query(
      `INSERT INTO log_activity (id, user_id, aksi, detail, created_at) VALUES (?, ?, 'Reset Password', ?, NOW())`,
      [`l_${Date.now()}`, user.nama, `Berhasil mereset kata sandi untuk ${email}`]
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
