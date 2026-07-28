import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const nilaiEksternal = parseFloat(body.nilaiEksternal);
    if (isNaN(nilaiEksternal) || nilaiEksternal < 0 || nilaiEksternal > 5) {
      return NextResponse.json(
        { error: "Nilai eksternal harus antara 0 - 5" },
        { status: 400 }
      );
    }

    // Get indikator bobot
    const [indikatorRow] = await query(
      `SELECT bobot, tipe FROM indikator WHERE id = ?`,
      [id]
    ) as any[];

    if (!indikatorRow || indikatorRow.tipe !== "Eksternal") {
      return NextResponse.json(
        { error: "Indikator tidak ditemukan atau bukan tipe Eksternal" },
        { status: 404 }
      );
    }

    const bobot = indikatorRow.bobot;

    // Hitung nilai_capaian final = (nilaiEksternal / 5) * bobot, capped at bobot
    const nilaiCapaian = Math.min((nilaiEksternal / 5) * bobot, bobot);

    // Hitung predikat berdasarkan rasio nilai/bobot
    const ratio = bobot > 0 ? nilaiCapaian / bobot : 0;
    let predikat: string | null = null;
    if (ratio >= 1.0) predikat = "Leading / Pemimpin";
    else if (ratio >= 0.75) predikat = "Embedded / Dapat Baik";
    else if (ratio >= 0.5) predikat = "Berkembang Baik";
    else if (ratio >= 0.25) predikat = "Emerging / Cukup";
    else if (ratio > 0) predikat = "Inisiasi / Rintisan";

    // Simpan nilai_eksternal (raw) dan nilai_capaian (konversi) + predikat
    await query(
      `UPDATE indikator SET nilai_eksternal = ?, nilai_capaian = ?, predikat = ? WHERE id = ?`,
      [nilaiEksternal, nilaiCapaian, predikat, id]
    );

    return NextResponse.json({
      success: true,
      nilaiEksternal,
      nilaiCapaian: Number(nilaiCapaian.toFixed(2)),
      predikat,
    });
  } catch (error) {
    console.error("Error updating nilai eksternal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan nilai eksternal" },
      { status: 500 }
    );
  }
}
