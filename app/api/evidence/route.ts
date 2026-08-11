import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aspekId = searchParams.get("aspekId");
    const indikatorId = searchParams.get("indikatorId");

    let sql = `
      SELECT 
        k.id, k.indikator_id, k.level, k.label, k.bobot, k.deskripsi, k.status, k.file,
        i.no as indikator_no, i.nama as indikator_nama, i.tipe as indikator_tipe,
        a.no as aspek_no, a.nama as aspek_nama
      FROM kriteria k
      JOIN indikator i ON k.indikator_id = i.id
      JOIN aspek a ON i.aspek_id = a.id
      WHERE k.status IN ('uploaded', 'verified')
        AND k.file IS NOT NULL AND k.file != ''
    `;
    const values: any[] = [];

    if (aspekId) {
      sql += " AND a.id = ?";
      values.push(aspekId);
    }
    if (indikatorId) {
      sql += " AND i.id = ?";
      values.push(indikatorId);
    }

    sql += " ORDER BY a.no ASC, CAST(SUBSTRING_INDEX(i.no, '.', 1) AS UNSIGNED) ASC, CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED) ASC, k.level ASC";

    const rows = await query(sql, values);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
}
