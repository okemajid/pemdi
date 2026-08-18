import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import os from "os";
import crypto from "crypto";

const execPromise = util.promisify(exec);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("file");
    if (!fileUrl) {
      return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
    }

    // Convert URL path to absolute local path
    const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(absolutePath).toLowerCase();

    // If it's a Word or Excel document, convert to PDF using LibreOffice for perfect layout
    if ([".docx", ".doc", ".xlsx", ".xls"].includes(ext)) {
      const pdfPath = absolutePath + ".pdf";
      const outDir = path.dirname(absolutePath);

      // Convert to PDF if it doesn't exist or if the original file is newer
      let needsConversion = true;
      if (fs.existsSync(pdfPath)) {
        const originalStat = fs.statSync(absolutePath);
        const pdfStat = fs.statSync(pdfPath);
        if (pdfStat.mtime > originalStat.mtime) {
          needsConversion = false;
        }
      }

      if (needsConversion) {
        // Use a unique temp user profile dir per conversion to avoid LibreOffice lock conflicts
        const uid = crypto.randomBytes(6).toString("hex");
        const loUserDir = path.join(os.tmpdir(), `lo_profile_${uid}`);
        fs.mkdirSync(loUserDir, { recursive: true });

        // Force delete cached PDF so we start fresh
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }

        try {
          // -env:UserInstallation ensures LibreOffice uses a clean, isolated profile
          // --writer flag specifically targets the Writer rendering engine for DOCX for better fidelity
          const loCommand = [
            `soffice`,
            `--headless`,
            `--norestore`,
            `--nofirststartwizard`,
            `"-env:UserInstallation=file://${loUserDir}"`,
            `--convert-to pdf:writer_pdf_Export`,
            `"${absolutePath}"`,
            `--outdir "${outDir}"`
          ].join(" ");

          await execPromise(loCommand, { timeout: 30000 });

          // LibreOffice names the output file after the original basename
          const baseName = path.basename(absolutePath, ext);
          const generatedPdf = path.join(outDir, baseName + ".pdf");

          if (fs.existsSync(generatedPdf)) {
            fs.renameSync(generatedPdf, pdfPath);
          } else {
            throw new Error("Gagal mengonversi dokumen: file PDF tidak ditemukan setelah konversi.");
          }
        } catch (err: any) {
          // Cleanup temp profile
          try { fs.rmSync(loUserDir, { recursive: true, force: true }); } catch {}
          return new NextResponse(
            `<html><body style="font-family: sans-serif; padding: 20px; color: #b91c1c; background:#fef2f2; border-radius:8px; margin:20px;">
              <h3>⚠️ Gagal Memuat Pratinjau Dokumen</h3>
              <p style="color:#7f1d1d; font-size:13px;">${err.message}</p>
              <p style="color:#64748b; font-size:12px; margin-top:20px;">Silakan gunakan tombol <b>Unduh</b> untuk membuka dokumen secara langsung.</p>
            </body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        }

        // Cleanup temp profile
        try { fs.rmSync(loUserDir, { recursive: true, force: true }); } catch {}
      }

      // Serve the converted PDF with inline display header
      if (fs.existsSync(pdfPath)) {
        const fileBuffer = fs.readFileSync(pdfPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    return NextResponse.json({ error: "Unsupported file type for internal preview" }, { status: 400 });

  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
