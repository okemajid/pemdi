import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { query } from "@/lib/db";

interface ImportKriteria {
  level: number;
  bobot: number;
  deskripsi: string;
}

interface ImportRow {
  no_aspek: number;
  nama_aspek: string;
  bobot_aspek: number;
  no_indikator: string;
  nama_indikator: string;
  tipe: string;
  bobot_indikator: number;
  kriteria: ImportKriteria[];
}

interface ImportResult {
  totalRows: number;
  aspekCreated: number;
  aspekUpdated: number;
  indikatorCreated: number;
  indikatorUpdated: number;
  errors: { row: number; message: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan file .xlsx atau .xls" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Find the "Template Indikator" sheet or fallback to first sheet
    let sheetName = workbook.SheetNames.find(
      (n) => n.toLowerCase().includes("template") || n.toLowerCase().includes("indikator")
    );
    if (!sheetName) sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return NextResponse.json({ error: "Sheet tidak ditemukan dalam file Excel" }, { status: 400 });
    }

    // Convert to JSON, starting from row 6 (index 5, header at row 4)
    // We use defval: "" to fill empty cells and header: 1 (array mode)
    // Then manually parse starting from the correct row
    const allData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    }) as any[][];

    // Find header row (row 4 in the template = index 3)
    // Col order: [ignored, no_aspek, nama_aspek, bobot_aspek, no_indikator, nama_indikator, tipe, bobot_indikator]
    // Data starts at row 6 = index 5 (after header at 3 and desc at 4)

    // Detect if user is using our template (has header row)
    // We'll be flexible: accept any sheet where the first non-empty row has expected-ish headers
    // and data starting after that.

    // Strategy: skip rows until we find one that looks like a data row (col B is a number = no_aspek)
    let dataStartIndex = -1;
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      // Col B (index 1) should be no_aspek (number), col E (index 4) should be no_indikator (string like "1.1")
      const colB = row[1];
      const colE = row[4];
      if (
        colB !== "" &&
        colB !== "no_aspek" &&
        colB !== "No Aspek *" &&
        !isNaN(Number(colB)) &&
        Number(colB) > 0
      ) {
        dataStartIndex = i;
        break;
      }
    }

    if (dataStartIndex === -1) {
      return NextResponse.json(
        {
          error:
            "Tidak ditemukan baris data yang valid. Pastikan file menggunakan template yang benar dan kolom B berisi nomor aspek.",
        },
        { status: 400 }
      );
    }

    const dataRows = allData.slice(dataStartIndex);

    if (dataRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diimport" }, { status: 400 });
    }

    if (dataRows.length > 500) {
      return NextResponse.json(
        { error: "Terlalu banyak baris. Maksimum 500 baris per sekali import." },
        { status: 400 }
      );
    }

    // Parse rows
    const rows: { data: ImportRow; rowNum: number }[] = [];
    const parseErrors: { row: number; message: string }[] = [];

    dataRows.forEach((row, idx) => {
      const excelRow = dataStartIndex + idx + 1; // 1-indexed for display

      // Skip empty rows
      if (!row[1] && !row[4]) return;

      const no_aspek = Number(row[1]);
      const nama_aspek = String(row[2] || "").trim();
      const bobot_aspek = Number(row[3]);
      const no_indikator = String(row[4] || "").trim();
      const nama_indikator = String(row[5] || "").trim();
      const tipe = String(row[6] || "").trim();
      const bobot_indikator = Number(row[7]);

      const kriteria: ImportKriteria[] = [];
      for (let i = 0; i < 5; i++) {
        const bobotCol = 8 + i * 2;
        const descCol = 9 + i * 2;
        if (row[descCol]) {
          kriteria.push({
            level: i + 1,
            bobot: Number(row[bobotCol]) || 0,
            deskripsi: String(row[descCol]).trim()
          });
        }
      }

      // Validate
      const errs: string[] = [];
      if (isNaN(no_aspek) || no_aspek <= 0) errs.push("no_aspek tidak valid");
      if (!nama_aspek) errs.push("nama_aspek kosong");
      if (isNaN(bobot_aspek) || bobot_aspek < 0) errs.push("bobot_aspek tidak valid");
      if (!no_indikator) errs.push("no_indikator kosong");
      if (!nama_indikator) errs.push("nama_indikator kosong");
      if (!["Internal", "Eksternal"].includes(tipe))
        errs.push(`tipe tidak valid ("${tipe}"), harus Internal atau Eksternal`);
      if (isNaN(bobot_indikator) || bobot_indikator < 0) errs.push("bobot_indikator tidak valid");

      if (errs.length > 0) {
        parseErrors.push({ row: excelRow, message: errs.join("; ") });
        return;
      }

      rows.push({
        data: { no_aspek, nama_aspek, bobot_aspek, no_indikator, nama_indikator, tipe, bobot_indikator, kriteria },
        rowNum: excelRow,
      });
    });

    if (rows.length === 0 && parseErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Semua baris mengandung error. Periksa data Anda.",
          details: parseErrors,
        },
        { status: 422 }
      );
    }

    // =====================
    // Process import (upsert aspek, insert indikator)
    // =====================
    const result: ImportResult = {
      totalRows: rows.length,
      aspekCreated: 0,
      aspekUpdated: 0,
      indikatorCreated: 0,
      indikatorUpdated: 0,
      errors: [...parseErrors],
    };

    // Cache aspek map: no_aspek -> id
    const aspekMap: Record<number, string> = {};

    // Load existing aspeks
    const existingAspeks = (await query(`SELECT id, no FROM aspek`)) as { id: string; no: number }[];
    existingAspeks.forEach((a) => {
      aspekMap[a.no] = a.id;
    });

    for (const { data, rowNum } of rows) {
      try {
        // Upsert aspek
        if (!aspekMap[data.no_aspek]) {
          // Create new aspek
          const aspekId = `a_${Date.now()}_${data.no_aspek}`;
          await query(
            `INSERT INTO aspek (id, no, nama, bobot) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE nama = VALUES(nama), bobot = VALUES(bobot)`,
            [aspekId, data.no_aspek, data.nama_aspek, data.bobot_aspek]
          );
          aspekMap[data.no_aspek] = aspekId;
          result.aspekCreated++;
        } else {
          // Update existing aspek
          await query(`UPDATE aspek SET nama = ?, bobot = ? WHERE no = ?`, [
            data.nama_aspek,
            data.bobot_aspek,
            data.no_aspek,
          ]);
          result.aspekUpdated++;
        }

        // Insert or Update indikator
        const aspekId = aspekMap[data.no_aspek];
        const existingInd = await query(
          `SELECT id FROM indikator WHERE no = ? AND aspek_id = ?`,
          [data.no_indikator, aspekId]
        ) as any[];

        let indId;
        if (existingInd && existingInd.length > 0) {
          indId = existingInd[0].id;
          await query(
            `UPDATE indikator SET nama = ?, tipe = ?, bobot = ? WHERE id = ?`,
            [data.nama_indikator, data.tipe, data.bobot_indikator, indId]
          );
          result.indikatorUpdated++;
        } else {
          indId = `i_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          await query(
            `INSERT INTO indikator (id, no, nama, tipe, bobot, aspek_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [indId, data.no_indikator, data.nama_indikator, data.tipe, data.bobot_indikator, aspekId]
          );
          result.indikatorCreated++;
        }

        const LEVEL_LABELS: Record<number, string> = {
          1: "Inisiasi / Rintisan",
          2: "Emerging / Cukup",
          3: "Berkembang Baik",
          4: "Embedded / Cukup Baik",
          5: "Leading / Pemimpin",
        };

        for (const k of data.kriteria) {
          const existingKriteria = await query(
            `SELECT id FROM kriteria WHERE indikator_id = ? AND level = ?`,
            [indId, k.level]
          ) as any[];

          if (existingKriteria && existingKriteria.length > 0) {
            await query(
              `UPDATE kriteria SET bobot = ?, deskripsi = ? WHERE id = ?`,
              [k.bobot, k.deskripsi, existingKriteria[0].id]
            );
          } else {
            const kId = `k_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            await query(
              `INSERT INTO kriteria (id, indikator_id, level, label, bobot, deskripsi, status) VALUES (?, ?, ?, ?, ?, ?, 'empty')`,
              [kId, indId, k.level, LEVEL_LABELS[k.level] || `Level ${k.level}`, k.bobot, k.deskripsi]
            );
          }
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNum,
          message: err?.message || "Gagal menyimpan ke database",
        });
      }
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Import selesai: ${result.indikatorCreated} indikator baru, ${result.indikatorUpdated} indikator diperbarui, ${result.aspekCreated} aspek baru, ${result.aspekUpdated} aspek diperbarui.${result.errors.length > 0 ? ` ${result.errors.length} baris mengalami error.` : ""}`,
    });
  } catch (error: any) {
    console.error("Error importing Excel:", error);
    return NextResponse.json(
      { error: `Gagal memproses file: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
