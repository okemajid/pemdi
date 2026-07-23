import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(
      `SELECT r.id, r.nama, r.deskripsi, r.permissions, COUNT(u.id) as userCount
       FROM roles r
       LEFT JOIN users u ON r.nama = u.role
       GROUP BY r.id, r.nama, r.deskripsi, r.permissions
       ORDER BY r.nama ASC`
    );
    // permissions stored as JSON string in DB
    const formatted = (rows as any[]).map(r => ({
      ...r,
      permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : (r.permissions || []),
      userCount: r.userCount || 0
    }));
    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, deskripsi, permissions } = body;

    if (!nama || !deskripsi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `r_${Date.now()}`;
    await query(
      `INSERT INTO roles (id, nama, deskripsi, permissions) VALUES (?, ?, ?, ?)`,
      [id, nama, deskripsi, JSON.stringify(permissions || [])]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
