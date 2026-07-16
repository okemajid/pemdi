import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { aspekId, no, tipe, bobot, nama, aksesUsers } = body;

    if (!id || !aspekId || !no || !tipe || !bobot || !nama) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await query(
      `UPDATE indikator SET no = ?, nama = ?, tipe = ?, bobot = ?, aspek_id = ? WHERE id = ?`,
      [no, nama, tipe, bobot, aspekId, id]
    );

    // Update access: delete old and insert new
    await query(`DELETE FROM indikator_akses WHERE indikator_id = ?`, [id]);
    
    if (Array.isArray(aksesUsers) && aksesUsers.length > 0) {
      for (const uId of aksesUsers) {
        await query(`INSERT INTO indikator_akses (indikator_id, user_id) VALUES (?, ?)`, [id, uId]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating indikator:", error);
    return NextResponse.json({ error: "Failed to update indikator" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await query(`DELETE FROM indikator WHERE id = ?`, [id]);
    // Note: indikator_akses is deleted automatically via ON DELETE CASCADE

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting indikator:", error);
    return NextResponse.json({ error: "Failed to delete indikator" }, { status: 500 });
  }
}
