import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Basic stats
    const [instansiRes] = await query(
      `SELECT COUNT(DISTINCT instansi) as count FROM users WHERE instansi != '-' AND instansi != ''`
    ) as any[];
    const [indikatorRes] = await query(`SELECT COUNT(id) as count FROM indikator`) as any[];
    const [dokumenRes] = await query(
      `SELECT COUNT(id) as count FROM kriteria WHERE status IN ('uploaded', 'verified')`
    ) as any[];
    const [verifiedRes] = await query(
      `SELECT COUNT(id) as count FROM kriteria WHERE status = 'verified'`
    ) as any[];

    // Index per tahun: agregasi nilai_capaian dan bobot per tahun
    const tahunRows = await query(`SELECT DISTINCT tahun FROM aspek ORDER BY tahun ASC`) as any[];
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
    const tahunTerkini = tahunRows.length > 0 ? tahunRows[tahunRows.length - 1].tahun : 2026;
    const aspekTerkini = await query(
      `SELECT id, no, nama, bobot FROM aspek WHERE tahun = ? ORDER BY no ASC`,
      [tahunTerkini]
    ) as any[];

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
      },
    });
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return NextResponse.json({ error: "Failed to fetch landing stats" }, { status: 500 });
  }
}
