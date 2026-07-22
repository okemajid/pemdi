import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const rows = await query(
      `SELECT id, nama, email, nip, instansi, role, status FROM pemdi_users WHERE id = ? LIMIT 1`,
      [id]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error during impersonate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
