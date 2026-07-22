import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const logs = await query(
      `SELECT l.id, l.user_id, u.nama as userName, l.aksi, l.detail, DATE_FORMAT(l.created_at, '%Y-%m-%dT%H:%i:%s') as createdAt
       FROM log_activity l
       LEFT JOIN pemdi_users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT 200`
    );
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, aksi, detail } = body;

    if (!userId || !aksi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `l_${Date.now()}`;
    await query(
      `INSERT INTO log_activity (id, user_id, aksi, detail, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [id, userId, aksi, detail || ""]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
