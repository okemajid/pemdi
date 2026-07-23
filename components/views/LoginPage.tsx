import { useState } from "react";
import { ShieldCheck, Mail, Lock, RefreshCw, Eye, EyeOff, ArrowLeft, CheckCircle, Send, AlertCircle } from "lucide-react";
import { Page } from "@/lib/types";
import Image from "next/image";

export function LoginPage({ setPage, onLoginSuccess }: { setPage: (p: Page) => void; onLoginSuccess?: (u: any) => void }) {
  const [email, setEmail] = useState("admin@pemdi.go.id");
  const [pass, setPass] = useState("••••••••");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password state
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pass })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        } else {
          setPage("dashboard");
        }
      } else {
        setError(data.error || "Gagal masuk. Periksa kembali kredensial Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Masukkan alamat email yang terdaftar.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Format email tidak valid.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMode("sent");
      } else {
        setForgotError(data.error || "Gagal mengirim email. Coba lagi nanti.");
      }
    } catch (err) {
      setForgotError("Terjadi kesalahan koneksi. Periksa konfigurasi SMTP di server.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f40 0%,#1B3A6B 100%)" }}>
        {/* Hero image */}
        {/* <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none" style={{ paddingBottom: "100px" }}>
          <Image
            // src="/pemdi_login_hero.png"
            // alt="Kota Ciamis Digital"
            // width={520}
            // height={370}
            // className="object-contain opacity-80"
            // priority
          />
        </div> */}

        {/* Top branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base">PEMDI</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Penilaian Kematangan Digital</p>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Sistem Penilaian<br />Mandiri Pemerintah<br />Digital Indonesia
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Platform resmi Kemendagri untuk pengukuran dan peningkatan kematangan transformasi digital pemerintah daerah seluruh Indonesia.
          </p>

          <div className="mt-8 space-y-3">
            {[{ n: "514+", l: "Pemerintah Daerah" }, { n: "87", l: "Indikator PEMDI" }, { n: "5", l: "Level Kematangan" }].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-white font-bold text-sm">{s.n}</span>
                <span className="text-white/40 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 Pemerintah Kabupaten Ciamis</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-gray-900">PEMDI</span>
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Selamat Datang</h2>
              <p className="text-gray-500 text-xs mb-8">Masuk dengan akun instansi Anda</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Email / NIP</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="email@instansi.go.id"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={pass}
                      onChange={e => { setPass(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded" /> Ingat saya
                  </label>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(""); setForgotError(""); setMode("forgot"); }}
                    className="text-xs font-semibold hover:underline transition-colors"
                    style={{ color: "#1B3A6B" }}
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                <button onClick={handleLogin} disabled={loading}
                  className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Memverifikasi...</> : "Masuk ke Sistem"}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Belum punya akun?{" "}
                <a href="#" className="font-semibold" style={{ color: "#1B3A6B" }}>Hubungi Admin Instansi</a>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <>
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-6 transition-colors"
              >
                <ArrowLeft size={13} /> Kembali ke halaman masuk
              </button>

              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Lupa Kata Sandi?</h2>
              <p className="text-gray-500 text-xs mb-8 leading-relaxed">
                Masukkan alamat email yang terdaftar di sistem. Kami akan mengirimkan tautan untuk mereset kata sandi Anda.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Alamat Email Terdaftar</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setForgotError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleForgotPassword()}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="email@instansi.go.id"
                      autoFocus
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{forgotError}</p>
                  </div>
                )}

                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}
                >
                  {forgotLoading
                    ? <><RefreshCw size={14} className="animate-spin" /> Mengirim...</>
                    : <><Send size={14} /> Kirim Tautan Reset</>
                  }
                </button>
              </div>
            </>
          )}

          {/* EMAIL SENT CONFIRMATION */}
          {mode === "sent" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)" }}>
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Email Dikirim!</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-2">
                Tautan reset kata sandi telah dikirim ke:
              </p>
              <p className="text-sm font-bold text-gray-800 mb-6 break-all">{forgotEmail}</p>
              <p className="text-gray-400 text-[11px] leading-relaxed mb-8">
                Silakan periksa kotak masuk email Anda (termasuk folder <strong>Spam</strong>). Tautan berlaku selama <strong>30 menit</strong>.
              </p>
              <button
                onClick={() => setMode("login")}
                className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}
              >
                Kembali ke Halaman Masuk
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
