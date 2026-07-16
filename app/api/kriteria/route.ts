import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const indikatorId = searchParams.get("indikatorId");

    if (!indikatorId) {
      return NextResponse.json({ error: "indikatorId is required" }, { status: 400 });
    }

    const kriteria = await query(
      `SELECT id, indikator_id as indikatorId, level, label, bobot, deskripsi, status, file 
       FROM kriteria 
       WHERE indikator_id = ? 
       ORDER BY level ASC`,
      [indikatorId]
    );

    return NextResponse.json(kriteria);
  } catch (error) {
    console.error("Error fetching kriteria:", error);
    return NextResponse.json({ error: "Failed to fetch kriteria" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { indikatorId, level, label, bobot, deskripsi } = body;

    if (!indikatorId || !level || !label || bobot === undefined || !deskripsi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `k_${Date.now()}`;

    await query(
      `INSERT INTO kriteria (id, indikator_id, level, label, bobot, deskripsi, status) VALUES (?, ?, ?, ?, ?, ?, 'empty')`,
      [id, indikatorId, level, label, bobot, deskripsi]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating kriteria:", error);
    return NextResponse.json({ error: "Failed to create kriteria" }, { status: 500 });
  }
}
