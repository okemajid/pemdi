import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = parseInt(searchParams.get("tahun") || "2026", 10);
    const aspeks = await query("SELECT id, no, nama, bobot, tahun FROM aspek WHERE tahun = ? ORDER BY no ASC", [tahun]);
    return NextResponse.json(aspeks);
  } catch (error) {
    console.error("Error fetching aspek:", error);
    return NextResponse.json({ error: "Failed to fetch aspek" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { no, nama, bobot, tahun } = body;

    if (!no || !nama || !bobot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tahunVal = tahun ? parseInt(tahun, 10) : 2026;
    const id = `a_${Date.now()}`;

    await query(
      `INSERT INTO aspek (id, no, nama, bobot, tahun) VALUES (?, ?, ?, ?, ?)`,
      [id, no, nama, bobot, tahunVal]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating aspek:", error);
    return NextResponse.json({ error: "Failed to create aspek" }, { status: 500 });
  }
}
