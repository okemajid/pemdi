import { useState } from "react";
import { ShieldCheck, Mail, Lock, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Page } from "@/lib/types";

export function LoginPage({ setPage, onLoginSuccess }: { setPage: (p: Page) => void; onLoginSuccess?: (u: any) => void }) {
  const [email, setEmail] = useState("admin@pemdi.go.id");
  const [pass, setPass] = useState("••••••••");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
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
        alert(data.error || "Gagal masuk. Periksa kembali kredensial Anda.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg,#0d1f40 0%,#1B3A6B 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base">PEMDI</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Penilaian Maturitas Digital</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Sistem Penilaian<br />Mandiri Pemerintah<br />Digital Indonesia
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Platform resmi Kemendagri untuk pengukuran dan peningkatan maturitas transformasi digital pemerintah daerah seluruh Indonesia.
          </p>

          <div className="mt-8 space-y-3">
            {[{ n: "514+", l: "Pemerintah Daerah" }, { n: "87", l: "Indikator PEMDI" }, { n: "5", l: "Level Maturitas" }].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-white font-bold text-sm">{s.n}</span>
                <span className="text-white/40 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2026 Pemerintah Kabupaten Ciamis</p>
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

          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Selamat Datang</h2>
          <p className="text-gray-500 text-xs mb-8">Masuk dengan akun instansi Anda</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Email / NIP</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="email@instansi.go.id" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" /> Ingat saya
              </label>
              <a href="#" className="text-xs font-semibold" style={{ color: "#1B3A6B" }}>Lupa kata sandi?</a>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
              {loading ? <><RefreshCw size={14} className="animate-spin" /> Memverifikasi...</> : "Masuk ke Sistem"}
            </button>
          </div>

          {/* <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[10px] text-blue-700 font-semibold mb-1">Demo akun tersedia:</p>
            <p className="text-[10px] text-blue-600">Super Admin: admin@pemdi.go.id</p>
            <p className="text-[10px] text-blue-600">Password: password123</p>
          </div> */}

          <p className="mt-6 text-center text-xs text-gray-400">
            Belum punya akun?{" "}
            <a href="#" className="font-semibold" style={{ color: "#1B3A6B" }}>Hubungi Admin Instansi</a>
          </p>
        </div>
      </div>
    </div>
  );
}
