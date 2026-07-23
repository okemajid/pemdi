import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { UploadStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = parseInt(searchParams.get("tahun") || "2026", 10);
    const userId = searchParams.get("userId");

    const aspeksRows = await query("SELECT * FROM aspek WHERE tahun = ? ORDER BY no ASC", [tahun]) as any[];
    
    let indikatorsRows: any[];
    if (userId) {
      indikatorsRows = await query(`
        SELECT i.* 
        FROM indikator i
        JOIN indikator_akses ia ON i.id = ia.indikator_id
        WHERE ia.user_id = ?
        ORDER BY CAST(SUBSTRING_INDEX(i.no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED)
      `, [userId]) as any[];
    } else {
      indikatorsRows = await query("SELECT * FROM indikator ORDER BY CAST(SUBSTRING_INDEX(no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(no, '.', -1) AS UNSIGNED)") as any[];
    }
    const kriteriaRows = await query(`
      SELECT k.* 
      FROM kriteria k 
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
        status: (k.status || "empty"),
        file: k.file || undefined
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
    })).filter(a => !userId || a.indikators.length > 0);

    // Stats calculation
    let total = 0, uploaded = 0, pending = 0, rejected = 0, empty = 0, verified = 0;
    aspeks.forEach(a => {
      a.indikators.forEach((i: any) => {
        i.kriteria.forEach((k: any) => {
          total++;
          if (k.status === "verified") verified++;
          else if (k.status === "uploaded") uploaded++;
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
      stats: { total, verified, uploaded, pending, rejected, empty }
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
