import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
    }

    // Check if user with this email exists
    const rows = await query(
      `SELECT id, nama, email FROM users WHERE email = ? AND status = 'Aktif' LIMIT 1`,
      [email]
    ) as any[];

    // Always return success to prevent email enumeration attack
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const user = rows[0];

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store token in password_reset_tokens table
    await query(
      `INSERT INTO password_reset_tokens (email, token, created_at) 
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE token = VALUES(token), created_at = VALUES(created_at)`,
      [email, token]
    );

    // Build reset link
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Configure SMTP transporter from .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send reset email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"PEMDI Ciamis" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Kata Sandi - PEMDI Kabupaten Ciamis",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0d1f40 0%, #1B3A6B 100%); padding: 32px 40px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #C0392B, #E74C3C); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🛡️</div>
              <span style="color: white; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">PEMDI</span>
            </div>
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Penilaian Kematangan Digital</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Halo, <strong>${user.nama}</strong></p>
            <h2 style="color: #111827; font-size: 22px; font-weight: 800; margin: 0 0 16px;">Reset Kata Sandi</h2>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
              Kami menerima permintaan untuk mereset kata sandi akun PEMDI Anda. Klik tombol di bawah untuk membuat kata sandi baru. Tautan ini hanya berlaku selama <strong>30 menit</strong>.
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #1B3A6B, #2E5BA8); color: white; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;">
                Reset Kata Sandi
              </a>
            </div>
            
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px;">Atau salin tautan ini ke browser:</p>
              <p style="color: #1B3A6B; font-size: 11px; word-break: break-all; margin: 0;">${resetLink}</p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Jika Anda tidak meminta reset kata sandi, abaikan email ini. Kata sandi Anda tidak akan berubah.</p>
          </div>
          
          <div style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2026 PEMDI · Kabupaten Ciamis · Jawa Barat</p>
          </div>
        </div>
      `,
    });

    // Log activity
    await query(
      `INSERT INTO log_activity (id, user_id, aksi, detail, created_at) VALUES (?, ?, 'Lupa Password', ?, NOW())`,
      [`l_${Date.now()}`, user.nama, `Permintaan reset password untuk ${email}`]
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Gagal mengirim email. Periksa konfigurasi SMTP." }, { status: 500 });
  }
}
