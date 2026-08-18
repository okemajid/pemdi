import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const indikatorId = searchParams.get("indikatorId");
    const tipeDokumen = searchParams.get("tipe");

    let sql = `
      SELECT st.*, i.no as indikator_no, i.nama as indikator_nama
      FROM surat_template st
      LEFT JOIN indikator i ON st.indikator_id = i.id
    `;
    const conditions: string[] = [];
    const values: any[] = [];

    if (indikatorId) {
      conditions.push("st.indikator_id = ?");
      values.push(indikatorId);
    }
    if (tipeDokumen && tipeDokumen !== "Semua") {
      conditions.push("st.tipe_dokumen = ?");
      values.push(tipeDokumen);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY st.created_at DESC";

    const rows = (await query(sql, values)) as any[];
    const mappedRows = rows.map((row: any) => ({
      id: row.id,
      indikatorId: row.indikator_id,
      kriteriaLevel: row.kriteria_level,
      nama: row.nama,
      deskripsi: row.deskripsi,
      filePath: row.file_path,
      tipeDokumen: row.tipe_dokumen,
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      indikatorNo: row.indikator_no,
      indikatorNama: row.indikator_nama
    }));
    return NextResponse.json({ success: true, data: mappedRows });
  } catch (error) {
    console.error("Error fetching surat templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const nama = formData.get("nama") as string;
    const deskripsi = (formData.get("deskripsi") as string) || "";
    const tipeDokumen = (formData.get("tipeDokumen") as string) || "Umum";
    const indikatorId = (formData.get("indikatorId") as string) || null;
    const kriteriaLevel = formData.get("kriteriaLevel") ? parseInt(formData.get("kriteriaLevel") as string) : null;
    const uploadedBy = (formData.get("uploadedBy") as string) || "Super Admin";

    if (!file || !nama) {
      return NextResponse.json({ error: "File dan nama wajib diisi" }, { status: 400 });
    }

    // Save file to public/uploads/templates/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const dbFilePath = `/uploads/templates/${fileName}`;
    const id = `st_${Date.now()}`;

    await query(
      `INSERT INTO surat_template (id, indikator_id, kriteria_level, nama, deskripsi, file_path, tipe_dokumen, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, indikatorId, kriteriaLevel, nama, deskripsi, dbFilePath, tipeDokumen, uploadedBy]
    );

    return NextResponse.json({ success: true, id, file_path: dbFilePath });
  } catch (error) {
    console.error("Error creating surat template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
