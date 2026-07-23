import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";
// @ts-ignore
import XlsxPopulate from "xlsx-populate";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = parseInt(searchParams.get("tahun") || "2026", 10);
    const userId = searchParams.get("userId");

    // Fetch aspeks filtered by tahun
    let aspeksRows = await query(
      "SELECT * FROM aspek WHERE tahun = ? ORDER BY no ASC",
      [tahun]
    ) as any[];

    if (aspeksRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk tahun yang dipilih." }, { status: 404 });
    }

    const aspekIds = aspeksRows.map((a: any) => a.id);
    const placeholders = aspekIds.map(() => "?").join(",");

    // Fetch indikators only for aspeks of this tahun
    let indikatorsRows: any[];
    if (userId) {
      indikatorsRows = await query(
        `SELECT i.*, a.nama as aspek_nama, a.no as aspek_no
         FROM indikator i
         JOIN aspek a ON i.aspek_id = a.id
         JOIN indikator_akses ia ON i.id = ia.indikator_id
         WHERE i.aspek_id IN (${placeholders}) AND ia.user_id = ?
         ORDER BY CAST(SUBSTRING_INDEX(i.no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED)`,
        [...aspekIds, userId]
      ) as any[];

      // Filter aspeks to only include those that have indicators for this user
      aspeksRows = aspeksRows.filter((a: any) => indikatorsRows.some((ind: any) => ind.aspek_id === a.id));
    } else {
      indikatorsRows = await query(
        `SELECT i.*, a.nama as aspek_nama, a.no as aspek_no
         FROM indikator i
         JOIN aspek a ON i.aspek_id = a.id
         WHERE i.aspek_id IN (${placeholders})
         ORDER BY CAST(SUBSTRING_INDEX(i.no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED)`,
        aspekIds
      ) as any[];
    }

    // Load template
    const templatePath = path.join(process.cwd(), "public", "template_laporan.xlsx");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template file not found." }, { status: 500 });
    }
    
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    
    // Sheet 1: Ringkasan
    const sheet1 = workbook.sheet(0);
    sheet1.cell("B11").value(tahun);
    
    // Populate Aspek Rows (Start at row 14)
    let currentRow1 = 14;
    for (let i = 0; i < aspeksRows.length; i++) {
      const aspek = aspeksRows[i];
      const aspekIndikators = indikatorsRows.filter((ind: any) => ind.aspek_id === aspek.id);
      const withNilai = aspekIndikators.filter((ind: any) => ind.nilai_capaian !== null);
      const avg = withNilai.length > 0
        ? withNilai.reduce((s: number, ind: any) => s + ind.nilai_capaian, 0) / withNilai.length
        : 0;

      sheet1.cell(`A${currentRow1}`).value(aspek.no);
      sheet1.cell(`B${currentRow1}`).value(aspek.nama);
      sheet1.cell(`C${currentRow1}`).value(aspek.bobot);
      sheet1.cell(`D${currentRow1}`).value(Number(avg.toFixed(2)));
      sheet1.cell(`E${currentRow1}`).value(aspekIndikators.length);
      currentRow1++;
    }

    // Sheet 2: Detail Indikator
    const sheet2 = workbook.sheet(1);
    let currentRow2 = 10;
    for (let i = 0; i < indikatorsRows.length; i++) {
      const ind = indikatorsRows[i];
      sheet2.cell(`A${currentRow2}`).value(i + 1);
      sheet2.cell(`B${currentRow2}`).value(ind.aspek_nama);
      sheet2.cell(`C${currentRow2}`).value(ind.nama);
      sheet2.cell(`D${currentRow2}`).value(ind.bobot);
      sheet2.cell(`E${currentRow2}`).value(ind.nilai_capaian !== null ? Number(parseFloat(ind.nilai_capaian).toFixed(2)) : 0);
      
      const nilaiTertimbang = (ind.nilai_capaian || 0) * (ind.bobot || 0) / 100;
      sheet2.cell(`F${currentRow2}`).value(Number(nilaiTertimbang.toFixed(2)));
      currentRow2++;
    }

    // Write to buffer
    const buffer = await workbook.outputAsync();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Laporan_PEMDI_${tahun}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Gagal membuat file Excel" }, { status: 500 });
  }
}
