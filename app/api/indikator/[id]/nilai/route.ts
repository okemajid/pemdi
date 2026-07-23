import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nilaiEksternal } = body;

    if (nilaiEksternal === undefined || nilaiEksternal === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const nilaiCapaian = (nilaiEksternal / 20) || 0;

    let predikat = "Belum dinilai";
    if (nilaiCapaian > 0 && nilaiCapaian <= 1) predikat = "Inisiasi / Rintisan";
    else if (nilaiCapaian > 1 && nilaiCapaian <= 2) predikat = "Emerging / Cukup";
    else if (nilaiCapaian > 2 && nilaiCapaian <= 3) predikat = "Berkembang Baik";
    else if (nilaiCapaian > 3 && nilaiCapaian <= 4) predikat = "Embedded / Dapat Baik";
    else if (nilaiCapaian > 4) predikat = "Leading / Pemimpin";
    else if (nilaiCapaian === 0) predikat = "Belum Ada Nilai";

    await query(
      `UPDATE indikator SET nilai_capaian = ?, predikat = ? WHERE id = ?`,
      [nilaiCapaian, predikat, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating indikator nilai:", error);
    return NextResponse.json({ error: "Failed to update indikator nilai" }, { status: 500 });
  }
}
