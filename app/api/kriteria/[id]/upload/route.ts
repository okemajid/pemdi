import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const indikatorId = formData.get("indikatorId") as string;

    if (!id || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "indikator", indikatorId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const dbFilePath = `/uploads/indikator/${indikatorId}/${fileName}`;

    await query(
      `UPDATE kriteria SET status = 'uploaded', file = ? WHERE id = ?`,
      [dbFilePath, id]
    );

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

    return NextResponse.json({ success: true, file: dbFilePath });
  } catch (error) {
    console.error("Error uploading kriteria:", error);
    return NextResponse.json({ error: "Failed to upload kriteria" }, { status: 500 });
  }
}
