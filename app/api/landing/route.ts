import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [instansiRes] = await query(`SELECT COUNT(DISTINCT instansi) as count FROM users WHERE instansi != '-' AND instansi != ''`) as any[];
    const [indikatorRes] = await query(`SELECT COUNT(id) as count FROM indikator`) as any[];
    const [dokumenRes] = await query(`SELECT COUNT(id) as count FROM bukti_dukung WHERE status = 'uploaded'`) as any[];
    const [indeksRes] = await query(`SELECT AVG(nilai_capaian) as avg_val FROM indikator WHERE nilai_capaian IS NOT NULL`) as any[];

    const totalInstansi = instansiRes?.count || 0;
    const totalIndikator = indikatorRes?.count || 0;
    const totalDokumen = dokumenRes?.count || 0;
    const avgIndeks = indeksRes?.avg_val ? parseFloat(indeksRes.avg_val).toFixed(2) : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        totalInstansi,
        totalIndikator,
        totalDokumen,
        avgIndeks
      }
    });
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return NextResponse.json({ error: "Failed to fetch landing stats" }, { status: 500 });
  }
}
