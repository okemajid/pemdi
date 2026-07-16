import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { UploadStatus } from "@/lib/types";

export async function GET() {
  try {
    const aspeksRows = await query("SELECT * FROM aspek ORDER BY no ASC") as any[];
    const indikatorsRows = await query("SELECT * FROM indikator ORDER BY CAST(SUBSTRING_INDEX(no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(no, '.', -1) AS UNSIGNED)") as any[];
    const kriteriaRows = await query(`
      SELECT k.*, b.status as upload_status, b.file_name 
      FROM kriteria k 
      LEFT JOIN bukti_dukung b ON k.id = b.kriteria_id 
      ORDER BY k.level ASC
    `) as any[];

    const kriteriaMap = new Map();
    kriteriaRows.forEach(k => {
      if (!kriteriaMap.has(k.indikator_id)) {
        kriteriaMap.set(k.indikator_id, []);
      }
      kriteriaMap.get(k.indikator_id).push({
        id: k.id,
        level: k.level,
        label: k.label,
        bobot: k.bobot,
        deskripsi: k.deskripsi,
        status: (k.upload_status || "empty") as UploadStatus,
        file: k.file_name || undefined
      });
    });

    const indikatorMap = new Map();
    indikatorsRows.forEach(ind => {
      if (!indikatorMap.has(ind.aspek_id)) {
        indikatorMap.set(ind.aspek_id, []);
      }
      indikatorMap.get(ind.aspek_id).push({
        id: ind.id,
        no: ind.no,
        nama: ind.nama,
        tipe: ind.tipe,
        bobot: ind.bobot,
        nilaiCapaian: ind.nilai_capaian,
        predikat: ind.predikat,
        kriteria: kriteriaMap.get(ind.id) || []
      });
    });

    const aspeks = aspeksRows.map(a => ({
      id: a.id,
      no: a.no,
      nama: a.nama,
      bobot: a.bobot,
      indikators: indikatorMap.get(a.id) || []
    }));

    // Stats calculation
    let total = 0, uploaded = 0, pending = 0, rejected = 0, empty = 0;
    aspeks.forEach(a => {
      a.indikators.forEach((i: any) => {
        i.kriteria.forEach((k: any) => {
          total++;
          if (k.status === "uploaded") uploaded++;
          else if (k.status === "pending") pending++;
          else if (k.status === "rejected") rejected++;
          else empty++;
        });
      });
    });

    // Simulated Session
    const session = {
      instansi: "Pemerintah Kabupaten Ciamis",
      kode: "3207",
      kategori: "Kab/Kota"
    };

    return NextResponse.json({
      session,
      aspeks,
      stats: { total, uploaded, pending, rejected, empty }
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
