import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { level, label, bobot, deskripsi } = body;

    if (!id || !level || !label || bobot === undefined || !deskripsi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await query(
      `UPDATE kriteria SET level = ?, label = ?, bobot = ?, deskripsi = ? WHERE id = ?`,
      [level, label, bobot, deskripsi, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating kriteria:", error);
    return NextResponse.json({ error: "Failed to update kriteria" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await query(`DELETE FROM kriteria WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting kriteria:", error);
    return NextResponse.json({ error: "Failed to delete kriteria" }, { status: 500 });
  }
}
