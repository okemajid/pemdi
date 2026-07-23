import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, deskripsi, permissions } = body;

    if (!nama || !deskripsi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await query(
      `UPDATE roles SET nama=?, deskripsi=?, permissions=? WHERE id=?`,
      [nama, deskripsi, JSON.stringify(permissions || []), id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if role is in use
    const rows = await query(`SELECT role FROM users WHERE role = (SELECT nama FROM roles WHERE id = ?) LIMIT 1`, [id]) as any[];
    if (rows && rows.length > 0) {
      return NextResponse.json({ error: "Cannot delete role because it is in use by one or more users" }, { status: 400 });
    }

    await query(`DELETE FROM roles WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
