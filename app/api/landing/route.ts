import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Index per tahun: agregasi nilai_capaian dan bobot per tahun
    const tahunRows = await query(`SELECT DISTINCT tahun FROM aspek ORDER BY tahun ASC`) as any[];
    const tahunTerkini = tahunRows.length > 0 ? tahunRows[tahunRows.length - 1].tahun : new Date().getFullYear();

    // Basic stats — hanya dari indikator tahun terkini
    const [instansiRes] = await query(
      `SELECT COUNT(DISTINCT u.instansi) as count FROM users u WHERE u.instansi != '-' AND u.instansi != ''`
    ) as any[];
    const [indikatorRes] = await query(
      `SELECT COUNT(i.id) as count FROM indikator i JOIN aspek a ON i.aspek_id = a.id WHERE a.tahun = ?`,
      [tahunTerkini]
    ) as any[];
    const [dokumenRes] = await query(
      `SELECT COUNT(k.id) as count FROM kriteria k
       JOIN indikator i ON k.indikator_id = i.id
       JOIN aspek a ON i.aspek_id = a.id
       WHERE a.tahun = ? AND k.status IN ('uploaded', 'verified')`,
      [tahunTerkini]
    ) as any[];
    const [verifiedRes] = await query(
      `SELECT COUNT(k.id) as count FROM kriteria k
       JOIN indikator i ON k.indikator_id = i.id
       JOIN aspek a ON i.aspek_id = a.id
       WHERE a.tahun = ? AND k.status = 'verified'`,
      [tahunTerkini]
    ) as any[];

    const indexPerTahun: { tahun: number; nilai: number }[] = [];

    for (const row of tahunRows) {
      const t = row.tahun;
      const aspekRows = await query(
        `SELECT id, bobot FROM aspek WHERE tahun = ?`,
        [t]
      ) as any[];

      let totalNilai = 0;
      let totalBobot = 0;

      for (const aspek of aspekRows) {
        const indRows = await query(
          `SELECT tipe, bobot, nilai_capaian FROM indikator WHERE aspek_id = ?`,
          [aspek.id]
        ) as any[];

        for (const ind of indRows) {
          totalBobot += ind.bobot;
          if (ind.nilai_capaian !== null) {
            if (ind.tipe === "Eksternal") {
              totalNilai += Math.min((ind.nilai_capaian / 5) * ind.bobot, ind.bobot);
            } else {
              totalNilai += Math.min(ind.nilai_capaian, ind.bobot);
            }
          }
        }
      }

      // Skala 5.0
      const nilaiIndeks = totalBobot > 0 ? (5 / 100) * totalNilai : 0;
      indexPerTahun.push({ tahun: t, nilai: parseFloat(nilaiIndeks.toFixed(2)) });
    }

    // Capaian per aspek (tahun terkini)
    const aspekTerkini = await query(
      `SELECT id, no, nama, bobot FROM aspek WHERE tahun = ? ORDER BY no ASC`,
      [tahunTerkini]
    ) as any[];

    // Tren nilai per aspek per tahun (untuk grafik tren)
    // Ambil semua aspek per tahun, hitung nilai per aspek
    const trenAspekMap: Record<string, Record<number, number>> = {}; // aspekNama -> { tahun: nilai }
    const aspekNamaMap: Record<string, string> = {}; // aspekId tahunTerkini -> shortName

    // Kumpulkan shortname dari aspek tahun terkini
    for (const a of aspekTerkini) {
      aspekNamaMap[a.no] = a.nama;
    }

    // Hitung nilai per aspek per tahun
    for (const row of tahunRows) {
      const t = row.tahun;
      const aspekRows = await query(
        `SELECT id, no, nama, bobot FROM aspek WHERE tahun = ? ORDER BY no ASC`,
        [t]
      ) as any[];

      for (const aspek of aspekRows) {
        const indRows = await query(
          `SELECT tipe, bobot, nilai_capaian FROM indikator WHERE aspek_id = ?`,
          [aspek.id]
        ) as any[];

        let nilaiAspek = 0;
        for (const ind of indRows) {
          if (ind.nilai_capaian !== null) {
            if (ind.tipe === "Eksternal") {
              nilaiAspek += Math.min((ind.nilai_capaian / 5) * ind.bobot, ind.bobot);
            } else {
              nilaiAspek += Math.min(ind.nilai_capaian, ind.bobot);
            }
          }
        }

        // Gunakan no+nama sebagai key agar konsisten lintas tahun
        const key = `${aspek.no}. ${aspek.nama}`;
        if (!trenAspekMap[key]) trenAspekMap[key] = {};
        trenAspekMap[key][t] = parseFloat(nilaiAspek.toFixed(2));
      }
    }

    // Format tren aspek: array per tahun dengan semua nilai aspek
    const tahunList = tahunRows.map((r: any) => r.tahun as number);
    const aspekKeys = Object.keys(trenAspekMap).sort();
    const trenAspekPerTahun = tahunList.map((t: number) => {
      const entry: Record<string, number | string> = { tahun: t };
      for (const key of aspekKeys) {
        entry[key] = trenAspekMap[key][t] ?? 0;
      }
      return entry;
    });

    const capaianAspek = await Promise.all(
      aspekTerkini.map(async (a: any) => {
        const indRows = await query(
          `SELECT no, nama, tipe, bobot, nilai_capaian FROM indikator WHERE aspek_id = ? ORDER BY CAST(no AS UNSIGNED) ASC`,
          [a.id]
        ) as any[];
        
        let totalNilai = 0;
        const indikators = indRows.map((ind: any) => {
          let nilaiInd = 0;
          if (ind.nilai_capaian !== null) {
            if (ind.tipe === "Eksternal") {
              nilaiInd = Math.min((ind.nilai_capaian / 5) * ind.bobot, ind.bobot);
            } else {
              nilaiInd = Math.min(ind.nilai_capaian, ind.bobot);
            }
          }
          totalNilai += nilaiInd;
          const pctInd = ind.bobot > 0 ? Math.min(Math.round((nilaiInd / ind.bobot) * 100), 100) : 0;
          return {
            no: ind.no,
            nama: ind.nama,
            bobot: ind.bobot,
            nilai: parseFloat(nilaiInd.toFixed(2)),
            pct: pctInd,
            tipe: ind.tipe,
          };
        });

        const pct = a.bobot > 0 ? Math.min(Math.round((totalNilai / a.bobot) * 100), 100) : 0;
        return {
          id: a.id,
          no: a.no,
          nama: a.nama,
          bobot: a.bobot,
          nilai: parseFloat(totalNilai.toFixed(2)),
          pct,
          indikators,
        };
      })
    );

    // Current indeks (tahun terkini)
    const nilaiSekarang = indexPerTahun.find((x) => x.tahun === tahunTerkini)?.nilai ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        totalInstansi: instansiRes?.count || 0,
        totalIndikator: indikatorRes?.count || 0,
        totalDokumen: dokumenRes?.count || 0,
        totalVerified: verifiedRes?.count || 0,
        avgIndeks: nilaiSekarang.toFixed(2),
        indexPerTahun,
        capaianAspek,
        tahunTerkini,
        trenAspekPerTahun,
        aspekKeys,
      },
    });
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return NextResponse.json({ error: "Failed to fetch landing stats" }, { status: 500 });
  }
}
