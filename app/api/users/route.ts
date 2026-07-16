import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const users = await query(
      `SELECT id, nama, email, nip, instansi, role, status, last_login as lastLogin FROM pemdi_users ORDER BY nama ASC`
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, nip, instansi, role } = body;

    if (!nama || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `u_${Date.now()}`;
    await query(
      `INSERT INTO pemdi_users (id, nama, email, nip, instansi, role, status, last_login) VALUES (?, ?, ?, ?, ?, ?, 'Aktif', ?)`,
      [id, nama, email, nip || "-", instansi || "-", role, new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })]
    );

    await query(
      `INSERT INTO log_activity (id, user_id, aksi, detail, created_at) VALUES (?, 'u6', 'Tambah User', ?, NOW())`,
      [`l_${Date.now()}`, `User baru: ${nama} (${role})`]
    ).catch(() => {});

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
