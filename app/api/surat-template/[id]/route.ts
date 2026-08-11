import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get the file path before deleting
    const [row] = await query(`SELECT file_path FROM surat_template WHERE id = ?`, [id]) as any[];
    if (!row) {
      return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });
    }

    // Delete the physical file
    const filePath = path.join(process.cwd(), "public", row.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await query(`DELETE FROM surat_template WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting surat template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    
    const updates: string[] = [];
    const values: any[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const nama = formData.get("nama") as string;
      const deskripsi = formData.get("deskripsi") as string;
      const tipeDokumen = formData.get("tipeDokumen") as string;
      const file = formData.get("file") as File | null;
      
      if (nama) { updates.push("nama = ?"); values.push(nama); }
      if (deskripsi !== null && deskripsi !== undefined) { updates.push("deskripsi = ?"); values.push(deskripsi); }
      if (tipeDokumen) { updates.push("tipe_dokumen = ?"); values.push(tipeDokumen); }
      
      if (file && file.size > 0) {
        // Delete old file
        const [row] = await query(`SELECT file_path FROM surat_template WHERE id = ?`, [id]) as any[];
        if (row && row.file_path) {
          const oldFilePath = path.join(process.cwd(), "public", row.file_path);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }
        
        // Save new file
        const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const filePath = path.join(uploadDir, fileName);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        
        const dbFilePath = `/uploads/templates/${fileName}`;
        updates.push("file_path = ?"); values.push(dbFilePath);
      }
    } else {
      const body = await req.json();
      const { nama, deskripsi, tipeDokumen, indikatorId, kriteriaLevel } = body;
      
      if (nama !== undefined) { updates.push("nama = ?"); values.push(nama); }
      if (deskripsi !== undefined) { updates.push("deskripsi = ?"); values.push(deskripsi); }
      if (tipeDokumen !== undefined) { updates.push("tipe_dokumen = ?"); values.push(tipeDokumen); }
      if (indikatorId !== undefined) { updates.push("indikator_id = ?"); values.push(indikatorId || null); }
      if (kriteriaLevel !== undefined) { updates.push("kriteria_level = ?"); values.push(kriteriaLevel || null); }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE surat_template SET ${updates.join(", ")} WHERE id = ?`, values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating surat template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
