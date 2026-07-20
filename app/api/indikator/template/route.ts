import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

const COLS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"];

export async function GET() {
  try {
    // Fetch all existing data from DB
    const aspeksRaw = await query(`SELECT id, no, nama, bobot FROM aspek ORDER BY no ASC`) as any[];
    const indikatorsRaw = await query(`
      SELECT id, no, nama, tipe, bobot, aspek_id
      FROM indikator
      ORDER BY CAST(SUBSTRING_INDEX(no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(no, '.', -1) AS UNSIGNED)
    `) as any[];
    const kriteriaRaw = await query(`
      SELECT indikator_id, level, bobot, deskripsi FROM kriteria ORDER BY level ASC
    `) as any[];

    // Build lookup: indikatorId -> { [level]: { bobot, deskripsi } }
    const kriteriaMap = new Map<string, Record<number, { bobot: number; deskripsi: string }>>();
    kriteriaRaw.forEach((k: any) => {
      if (!kriteriaMap.has(k.indikator_id)) kriteriaMap.set(k.indikator_id, {});
      kriteriaMap.get(k.indikator_id)![k.level] = { bobot: k.bobot, deskripsi: k.deskripsi };
    });

    // Build rows from DB data
    const dbRows: any[][] = [];
    indikatorsRaw.forEach((ind: any, idx: number) => {
      const aspek = aspeksRaw.find((a: any) => a.id === ind.aspek_id);
      if (!aspek) return;
      const kmap = kriteriaMap.get(ind.id) || {};
      dbRows.push([
        idx + 1,
        aspek.no, aspek.nama, aspek.bobot,
        ind.no, ind.nama, ind.tipe, ind.bobot,
        kmap[1]?.bobot ?? "", kmap[1]?.deskripsi ?? "",
        kmap[2]?.bobot ?? "", kmap[2]?.deskripsi ?? "",
        kmap[3]?.bobot ?? "", kmap[3]?.deskripsi ?? "",
        kmap[4]?.bobot ?? "", kmap[4]?.deskripsi ?? "",
        kmap[5]?.bobot ?? "", kmap[5]?.deskripsi ?? "",
      ]);
    });

    // Fallback contoh jika DB kosong
    const exampleRows: any[][] = [
      [1, 1, "Tata Kelola dan Manajemen", 10, "1.1", "Tingkat Kematangan Tata Kelola Pemerintah Digital", "Internal", 5, 0.2, "SK Tim", 0.4, "Dokumen Program", 0.6, "Sistem Terpadu", 0.8, "Review Tahunan", 1.0, "Evaluasi Berkelanjutan"],
      [2, 1, "Tata Kelola dan Manajemen", 10, "1.2", "Tingkat Kematangan Manajemen Layanan Digital Pemerintah", "Internal", 5, 0.2, "Rancangan Layanan", 0.4, "Layanan Aktif", 0.6, "Terintegrasi", 0.8, "Dimonitoring", 1.0, "Dievaluasi"],
      [3, 2, "Pengembangan", 24, "2.1", "Layanan Digital Publik yang Tersedia", "Eksternal", 8, 0.2, "Inisiasi", 0.4, "Berjalan", 0.6, "Terintegrasi", 0.8, "Sangat Baik", 1.0, "Optimized"],
    ];

    const hasDbData = dbRows.length > 0;
    const dataRows = hasDbData ? dbRows : exampleRows;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMDI System";
    workbook.created = new Date();

    // =====================
    // Sheet 1: Template Indikator
    // =====================
    const sheet = workbook.addWorksheet("Template Indikator", {
      pageSetup: { fitToPage: true, orientation: "landscape" },
    });

    sheet.columns = [
      { header: "", key: "no_baris", width: 6 },
      { header: "no_aspek", key: "no_aspek", width: 14 },
      { header: "nama_aspek", key: "nama_aspek", width: 38 },
      { header: "bobot_aspek", key: "bobot_aspek", width: 14 },
      { header: "no_indikator", key: "no_indikator", width: 16 },
      { header: "nama_indikator", key: "nama_indikator", width: 60 },
      { header: "tipe", key: "tipe", width: 14 },
      { header: "bobot_indikator", key: "bobot_indikator", width: 16 },
      { header: "bobot_l1", key: "bobot_l1", width: 10 },
      { header: "desc_l1", key: "desc_l1", width: 40 },
      { header: "bobot_l2", key: "bobot_l2", width: 10 },
      { header: "desc_l2", key: "desc_l2", width: 40 },
      { header: "bobot_l3", key: "bobot_l3", width: 10 },
      { header: "desc_l3", key: "desc_l3", width: 40 },
      { header: "bobot_l4", key: "bobot_l4", width: 10 },
      { header: "desc_l4", key: "desc_l4", width: 40 },
      { header: "bobot_l5", key: "bobot_l5", width: 10 },
      { header: "desc_l5", key: "desc_l5", width: 40 },
    ];

    // Title block
    sheet.mergeCells("A1:R1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = hasDbData
      ? `EXPORT DATA INDIKATOR — PEMDI (${indikatorsRaw.length} Indikator, ${aspeksRaw.length} Aspek)`
      : "TEMPLATE IMPORT INDIKATOR — PEMDI";
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hasDbData ? "FF065F46" : "FF1B3A6B" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:R2");
    const subTitleCell = sheet.getCell("A2");
    subTitleCell.value = hasDbData
      ? "Data ini diambil dari database. Anda dapat mengubah, menambah, atau menghapus baris lalu import kembali. Nomor aspek dan no indikator digunakan sebagai kunci—jangan ubah kecuali ingin membuat data baru."
      : "Isi data pada baris ke-6 ke bawah. Kolom yang diberi tanda * wajib diisi. Hapus baris contoh sebelum mengimpor.";
    subTitleCell.font = { italic: true, size: 9, color: { argb: "FF555555" } };
    subTitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hasDbData ? "FFECFDF5" : "FFEEF2FF" } };
    subTitleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(2).height = 22;

    // Empty spacer
    sheet.getRow(3).height = 6;

    // Header row (row 4)
    const headers = [
      { label: "No", col: "A", desc: "Nomor urut (otomatis)" },
      { label: "No Aspek *", col: "B", desc: "Nomor aspek (angka)" },
      { label: "Nama Aspek *", col: "C", desc: "Nama aspek terkait" },
      { label: "Bobot Aspek (%) *", col: "D", desc: "Bobot total aspek" },
      { label: "No Indikator *", col: "E", desc: "Misal: 1.1, 1.2 (JANGAN ubah jika sudah ada)" },
      { label: "Nama Indikator *", col: "F", desc: "Deskripsi lengkap indikator" },
      { label: "Tipe *", col: "G", desc: "Internal / Eksternal" },
      { label: "Bobot Indikator (%) *", col: "H", desc: "Bobot indikator" },
      { label: "Bobot L1", col: "I", desc: "Value Level 1" },
      { label: "Deskripsi L1", col: "J", desc: "Deskripsi Level 1 (Inisiasi)" },
      { label: "Bobot L2", col: "K", desc: "Value Level 2" },
      { label: "Deskripsi L2", col: "L", desc: "Deskripsi Level 2 (Emerging)" },
      { label: "Bobot L3", col: "M", desc: "Value Level 3" },
      { label: "Deskripsi L3", col: "N", desc: "Deskripsi Level 3 (Berkembang)" },
      { label: "Bobot L4", col: "O", desc: "Value Level 4" },
      { label: "Deskripsi L4", col: "P", desc: "Deskripsi Level 4 (Embedded)" },
      { label: "Bobot L5", col: "Q", desc: "Value Level 5" },
      { label: "Deskripsi L5", col: "R", desc: "Deskripsi Level 5 (Leading)" },
    ];

    const headerRow = sheet.getRow(4);
    const descRow = sheet.getRow(5);
    headers.forEach(({ label, col, desc }) => {
      const hCell = sheet.getCell(`${col}4`);
      hCell.value = label;
      hCell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
      hCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5BA8" } };
      hCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      hCell.border = {
        top: { style: "thin", color: { argb: "FF1B3A6B" } },
        left: { style: "thin", color: { argb: "FF1B3A6B" } },
        bottom: { style: "thin", color: { argb: "FF1B3A6B" } },
        right: { style: "thin", color: { argb: "FF1B3A6B" } },
      };

      const dCell = sheet.getCell(`${col}5`);
      dCell.value = desc;
      dCell.font = { italic: true, size: 8, color: { argb: "FF666666" } };
      dCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F7FF" } };
      dCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      dCell.border = {
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "medium", color: { argb: "FF2E5BA8" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
    });
    headerRow.height = 28;
    descRow.height = 36;

    // Write data rows starting from row 6
    dataRows.forEach((row, i) => {
      const r = sheet.getRow(6 + i);
      r.values = ["", ...row];

      const isDbRow = hasDbData;
      r.eachCell({ includeEmpty: false }, (cell, colNum) => {
        if (colNum === 1) return;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: isDbRow
              ? (i % 2 === 0 ? "FFECFDF5" : "FFD1FAE5")
              : (i % 2 === 0 ? "FFFAFBFF" : "FFF0F4FF"),
          },
        };
        cell.font = {
          size: 9,
          italic: !isDbRow,
          color: { argb: isDbRow ? "FF065F46" : "FF888888" },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          left: { style: "hair", color: { argb: "FFDDDDDD" } },
          bottom: { style: "hair", color: { argb: "FFDDDDDD" } },
          right: { style: "hair", color: { argb: "FFDDDDDD" } },
        };
      });

      // No column
      const noCell = sheet.getCell(`A${6 + i}`);
      noCell.value = i + 1;
      noCell.font = { size: 9, bold: isDbRow, color: { argb: isDbRow ? "FF065F46" : "FFAAAAAA" } };
      noCell.alignment = { horizontal: "center", vertical: "middle" };

      // Tipe dropdown validation
      const tipeCell = sheet.getCell(`G${6 + i}`);
      tipeCell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"Internal,Eksternal"'],
        showErrorMessage: true,
        errorTitle: "Nilai Tidak Valid",
        error: "Pilih salah satu: Internal atau Eksternal",
      };

      r.height = 22;
    });

    // Hint row
    const nextRow = 6 + dataRows.length;
    sheet.mergeCells(`A${nextRow}:R${nextRow}`);
    const hintCell = sheet.getCell(`A${nextRow}`);
    hintCell.value = hasDbData
      ? `⬆ ${dataRows.length} baris data aktif dari database. Tambah baris baru di bawah, ubah atau hapus baris di atas, lalu import kembali.`
      : "⬆ Hapus 3 baris contoh di atas sebelum import. Mulai isi data Anda dari baris ke-6.";
    hintCell.font = { bold: true, size: 9, color: { argb: hasDbData ? "FF065F46" : "FFB45309" } };
    hintCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hasDbData ? "FFDCFCE7" : "FFFEF3C7" } };
    hintCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(nextRow).height = 20;

    // Blank rows for new input
    const blankStart = nextRow + 1;
    const blankEnd = blankStart + 100;
    for (let r = blankStart; r <= blankEnd; r++) {
      const row = sheet.getRow(r);
      row.height = 20;

      // No column formula
      const noCell = sheet.getCell(`A${r}`);
      noCell.value = { formula: `=IF(B${r}<>"",ROW()-${nextRow},"")` };
      noCell.font = { size: 9, color: { argb: "FFAAAAAA" } };
      noCell.alignment = { horizontal: "center", vertical: "middle" };

      // Tipe dropdown
      const tipeCell = sheet.getCell(`G${r}`);
      tipeCell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Internal,Eksternal"'],
        showErrorMessage: true,
        errorTitle: "Nilai Tidak Valid",
        error: "Pilih salah satu: Internal atau Eksternal",
      };

      // Alternate row shading for blank rows
      ["B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"].forEach((col) => {
        const cell = sheet.getCell(`${col}${r}`);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: r % 2 === 0 ? "FFFFFFFF" : "FAFCFF" },
        };
        cell.border = {
          left: { style: "hair", color: { argb: "FFEEEEEE" } },
          bottom: { style: "hair", color: { argb: "FFEEEEEE" } },
          right: { style: "hair", color: { argb: "FFEEEEEE" } },
        };
        cell.font = { size: 9 };
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    }

    // Freeze first 5 rows and column A
    sheet.views = [{ state: "frozen", xSplit: 1, ySplit: 5, activeCell: "B6" }];

    // =====================
    // Sheet 2: Referensi Aspek
    // =====================
    const aspekSheet = workbook.addWorksheet("Referensi Aspek");
    aspekSheet.columns = [
      { header: "No Aspek", key: "no", width: 12 },
      { header: "Nama Aspek", key: "nama", width: 40 },
      { header: "Bobot (%)", key: "bobot", width: 12 },
    ];

    const aspekHeader = aspekSheet.getRow(1);
    aspekHeader.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B3A6B" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    aspekHeader.height = 24;

    if (aspeksRaw.length > 0) {
      aspeksRaw.forEach((a: any, i: number) => {
        const row = aspekSheet.addRow({ no: a.no, nama: a.nama, bobot: a.bobot });
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF5F7FF" },
          };
          cell.font = { size: 9 };
          cell.border = {
            bottom: { style: "hair", color: { argb: "FFDDDDDD" } },
            right: { style: "hair", color: { argb: "FFDDDDDD" } },
          };
        });
        row.height = 18;
      });
    } else {
      aspekSheet.addRow({ no: "-", nama: "Belum ada aspek. Tambahkan via form import.", bobot: "" });
    }

    // =====================
    // Sheet 3: Petunjuk
    // =====================
    const guideSheet = workbook.addWorksheet("Petunjuk Pengisian");
    guideSheet.getColumn(1).width = 8;
    guideSheet.getColumn(2).width = 25;
    guideSheet.getColumn(3).width = 70;

    const guideTitle = guideSheet.getCell("A1");
    guideSheet.mergeCells("A1:C1");
    guideTitle.value = "PETUNJUK PENGISIAN TEMPLATE IMPORT INDIKATOR";
    guideTitle.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    guideTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B3A6B" } };
    guideTitle.alignment = { horizontal: "center", vertical: "middle" };
    guideSheet.getRow(1).height = 30;

    const guides = [
      ["No", "Kolom", "Keterangan"],
      ["1", "no_aspek *", "Nomor urut aspek (angka bulat). Misal: 1, 2, 3"],
      ["2", "nama_aspek *", "Nama lengkap aspek. Misal: Tata Kelola dan Manajemen"],
      ["3", "bobot_aspek (%) *", "Bobot total aspek dalam persen (angka). Misal: 10"],
      ["4", "no_indikator *", "Nomor indikator dalam format X.Y. Misal: 1.1, 1.2, 2.1"],
      ["5", "nama_indikator *", "Deskripsi lengkap indikator penilaian mandiri"],
      ["6", "tipe *", "Pilih salah satu: Internal atau Eksternal (sensitif huruf besar)"],
      ["7", "bobot_indikator (%) *", "Bobot indikator dalam persen (angka desimal OK). Misal: 5, 7.5"],
      ["8", "bobot & deskripsi L1-L5", "Isi nilai bobot dan deskripsi kriteria untuk masing-masing level (1 sampai 5)"],
      ["", "", ""],
      ["⚠", "UPSERT", "Saat import, sistem akan UPDATE data yang sudah ada (berdasarkan no_aspek + no_indikator) dan INSERT data baru. Tidak ada duplikasi."],
      ["⚠", "PENTING", "Jangan ubah kolom No Aspek dan No Indikator jika ingin memperbarui data yang sudah ada."],
      ["⚠", "DATA BARU", "Untuk menambah indikator baru, tambahkan baris baru dengan no_indikator yang belum ada."],
      ["✓", "FORMAT", "Simpan file dalam format .xlsx sebelum diupload"],
      ["✓", "BATAS", "Maksimum 500 baris data per sekali import"],
    ];

    guides.forEach((row, i) => {
      const r = guideSheet.getRow(i + 2);
      r.values = ["", ...row];
      r.height = 22;
      if (i === 0) {
        r.eachCell((cell) => {
          cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5BA8" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      } else {
        r.eachCell((cell) => {
          cell.font = { size: 9, color: { argb: row[0] === "⚠" ? "FFB45309" : "FF333333" } };
          cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: {
              argb: row[0] === "⚠" ? "FFFEF3C7" : row[0] === "✓" ? "FFF0FFF4" : i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF",
            },
          };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="template_import_indikator.xlsx"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json({ error: "Gagal membuat template Excel" }, { status: 500 });
  }
}
