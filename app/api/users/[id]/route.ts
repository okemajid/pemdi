import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await query(
      `SELECT i.id, i.no, i.nama, i.tipe, i.bobot, a.nama as aspekNama, a.no as aspekNo
       FROM indikator_akses ia
       JOIN indikator i ON ia.indikator_id = i.id
       JOIN aspek a ON i.aspek_id = a.id
       WHERE ia.user_id = ?
       ORDER BY a.no, CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED)`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching user indikators:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, email, nip, instansi, role, status, password } = body;

    if (password) {
      await query(
        `UPDATE pemdi_users SET nama=?, email=?, nip=?, instansi=?, role=?, status=?, password=? WHERE id=?`,
        [nama, email, nip, instansi, role, status, password, id]
      );
    } else {
      await query(
        `UPDATE pemdi_users SET nama=?, email=?, nip=?, instansi=?, role=?, status=? WHERE id=?`,
        [nama, email, nip, instansi, role, status, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await query(`DELETE FROM pemdi_users WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
