import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Fetch existing aspeks for the dropdown hint in the template
    const aspeks = await query(`SELECT id, no, nama FROM aspek ORDER BY no ASC`) as any[];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMDI System";
    workbook.created = new Date();

    // =====================
    // Sheet 1: Template Indikator
    // =====================
    const sheet = workbook.addWorksheet("Template Indikator", {
      pageSetup: { fitToPage: true, orientation: "landscape" },
    });

    // Column definitions
    sheet.columns = [
      { header: "", key: "no_baris", width: 6 },
      { header: "no_aspek", key: "no_aspek", width: 14 },
      { header: "nama_aspek", key: "nama_aspek", width: 38 },
      { header: "bobot_aspek", key: "bobot_aspek", width: 14 },
      { header: "no_indikator", key: "no_indikator", width: 16 },
      { header: "nama_indikator", key: "nama_indikator", width: 60 },
      { header: "tipe", key: "tipe", width: 14 },
      { header: "bobot_indikator", key: "bobot_indikator", width: 16 },
    ];

    // Title block
    sheet.mergeCells("A1:H1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "TEMPLATE IMPORT INDIKATOR — PEMDI";
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B3A6B" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:H2");
    const subTitleCell = sheet.getCell("A2");
    subTitleCell.value =
      "Isi data pada baris ke-6 ke bawah. Kolom yang diberi tanda * wajib diisi. Hapus baris contoh sebelum mengimpor.";
    subTitleCell.font = { italic: true, size: 9, color: { argb: "FF555555" } };
    subTitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF2FF" } };
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
      { label: "No Indikator *", col: "E", desc: "Misal: 1.1, 1.2" },
      { label: "Nama Indikator *", col: "F", desc: "Deskripsi lengkap indikator" },
      { label: "Tipe *", col: "G", desc: "Internal / Eksternal" },
      { label: "Bobot Indikator (%) *", col: "H", desc: "Bobot indikator" },
    ];

    const headerRow = sheet.getRow(4);
    const descRow = sheet.getRow(5);
    headers.forEach(({ label, col, desc }, i) => {
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

    // Example data rows (rows 6–8)
    const examples = [
      [1, 1, "Tata Kelola dan Manajemen", 10, "1.1", "Tingkat Kematangan Tata Kelola Pemerintah Digital", "Internal", 5],
      [2, 1, "Tata Kelola dan Manajemen", 10, "1.2", "Tingkat Kematangan Manajemen Layanan Digital Pemerintah", "Internal", 5],
      [3, 2, "Pengembangan", 24, "2.1", "Layanan Digital Publik yang Tersedia", "Eksternal", 8],
    ];

    examples.forEach((row, i) => {
      const r = sheet.getRow(6 + i);
      r.values = ["", ...row];
      r.eachCell({ includeEmpty: false }, (cell, colNum) => {
        if (colNum === 1) return;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFFAFBFF" : "FFF0F4FF" },
        };
        cell.font = { size: 9, italic: true, color: { argb: "FF888888" } };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          left: { style: "hair", color: { argb: "FFDDDDDD" } },
          bottom: { style: "hair", color: { argb: "FFDDDDDD" } },
          right: { style: "hair", color: { argb: "FFDDDDDD" } },
        };
      });

      // No column auto-fill via formula
      const noCell = sheet.getCell(`A${6 + i}`);
      noCell.value = i + 1;
      noCell.font = { size: 9, color: { argb: "FFAAAAAA" } };
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

    // Hint row after examples
    const hintRow = sheet.getRow(9);
    sheet.mergeCells("A9:H9");
    const hintCell = sheet.getCell("A9");
    hintCell.value =
      "⬆ Hapus 3 baris contoh di atas sebelum import. Mulai isi data Anda dari baris ke-6.";
    hintCell.font = { bold: true, size: 9, color: { argb: "FFB45309" } };
    hintCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
    hintCell.alignment = { horizontal: "center", vertical: "middle" };
    hintRow.height = 20;

    // Prepare blank data rows (10–110) with dropdown validation
    for (let r = 10; r <= 110; r++) {
      const row = sheet.getRow(r);
      row.height = 20;

      // No column formula
      const noCell = sheet.getCell(`A${r}`);
      noCell.value = { formula: `=IF(B${r}<>"",ROW()-9,"")` };
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

      // Alternate row shading
      ["B", "C", "D", "E", "F", "G", "H"].forEach((col) => {
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
    // Sheet 2: Daftar Aspek (reference)
    // =====================
    const aspekSheet = workbook.addWorksheet("Referensi Aspek");
    aspekSheet.columns = [
      { header: "No Aspek", key: "no", width: 12 },
      { header: "Nama Aspek", key: "nama", width: 40 },
    ];

    const aspekHeader = aspekSheet.getRow(1);
    aspekHeader.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B3A6B" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    aspekHeader.height = 24;

    if (aspeks.length > 0) {
      aspeks.forEach((a, i) => {
        const row = aspekSheet.addRow({ no: a.no, nama: a.nama });
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
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
      aspekSheet.addRow({ no: "-", nama: "Belum ada aspek. Anda bisa membuat aspek baru via form import." });
    }

    // =====================
    // Sheet 3: Petunjuk
    // =====================
    const guideSheet = workbook.addWorksheet("Petunjuk Pengisian");
    guideSheet.getColumn(1).width = 8;
    guideSheet.getColumn(2).width = 25;
    guideSheet.getColumn(3).width = 60;

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
      ["", "", ""],
      ["⚠", "PENTING", "Hapus 3 baris contoh (berwarna abu) sebelum import"],
      ["⚠", "DUPLIKASI", "Jika aspek dengan nomor yang sama sudah ada di database, data aspek akan DIPERBARUI (no, nama, bobot)"],
      ["⚠", "INDIKATOR", "Sistem akan membuatkan ID unik untuk setiap indikator baru secara otomatis"],
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
        r.eachCell((cell, col) => {
          cell.font = { size: 9, color: { argb: row[0] === "⚠" ? "FFB45309" : "FF333333" } };
          cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: {
              argb: row[0] === "⚠"
                ? "FFFEF3C7"
                : row[0] === "✓"
                ? "FFF0FFF4"
                : i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF",
            },
          };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
      }
    });

    // Serialize to buffer
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
