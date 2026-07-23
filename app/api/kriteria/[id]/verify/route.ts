import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let newStatus = "uploaded";
    if (body.action === "verify") newStatus = "verified";
    else if (body.action === "reject") newStatus = "rejected";
    else if (body.action === "cancel") newStatus = "uploaded"; // back to uploaded state
    else if (typeof body.verify !== 'undefined') { // backwards compatibility
        newStatus = body.verify ? "verified" : "uploaded";
    }

    // Update kriteria status
    await query(
      `UPDATE kriteria SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    // Get indikator_id of this kriteria
    const [kriteria] = await query(`SELECT indikator_id FROM kriteria WHERE id = ?`, [id]) as any[];
    if (kriteria && kriteria.indikator_id) {
      const indikatorId = kriteria.indikator_id;

      // Recalculate nilai_capaian for the indikator based on verified kriteria only
      const verifiedKriteria = await query(
        `SELECT SUM(bobot) as total_bobot FROM kriteria WHERE indikator_id = ? AND status = 'verified'`,
        [indikatorId]
      ) as any[];

      const totalBobot = verifiedKriteria[0]?.total_bobot;

      let predikat = "Belum dinilai";
      if (totalBobot > 0 && totalBobot <= 1) predikat = "Inisiasi / Rintisan";
      else if (totalBobot > 1 && totalBobot <= 2) predikat = "Emerging / Cukup";
      else if (totalBobot > 2 && totalBobot <= 3) predikat = "Berkembang Baik";
      else if (totalBobot > 3 && totalBobot <= 4) predikat = "Embedded / Dapat Baik";
      else if (totalBobot > 4) predikat = "Leading / Pemimpin";
      else if (totalBobot === 0) predikat = "Belum Ada Nilai";

      await query(
        `UPDATE indikator SET nilai_capaian = ?, predikat = ? WHERE id = ?`,
        [totalBobot === null || totalBobot === undefined ? null : totalBobot, totalBobot === null || totalBobot === undefined ? null : predikat, indikatorId]
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Error verifying kriteria:", error);
    return NextResponse.json({ error: "Failed to verify kriteria" }, { status: 500 });
  }
}
