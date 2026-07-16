import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { no, nama, bobot } = body;

    if (!id || !no || !nama || !bobot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await query(
      `UPDATE aspek SET no = ?, nama = ?, bobot = ? WHERE id = ?`,
      [no, nama, bobot, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating aspek:", error);
    return NextResponse.json({ error: "Failed to update aspek" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await query(`DELETE FROM aspek WHERE id = ?`, [id]);
    // Note: indikator is deleted automatically if we have ON DELETE CASCADE or similar, 
    // actually let's check schema. We don't have CASCADE on indikator yet? We better make sure.
    // In setup-db.mjs: FOREIGN KEY (aspek_id) REFERENCES aspek(id) ON DELETE CASCADE

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting aspek:", error);
    return NextResponse.json({ error: "Failed to delete aspek" }, { status: 500 });
  }
}
