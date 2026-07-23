import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const logs = await query(
      `SELECT id, user_id as userName, aksi, detail, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') as createdAt
       FROM log_activity
       ORDER BY created_at DESC
       LIMIT 500`
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
    // userId here stores the user's name (not their database ID)
    const { userId, aksi, detail } = body;

    if (!userId || !aksi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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
