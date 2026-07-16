import { ClipboardList, Upload, BarChart3, Shield, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { Page, Maturitas } from "@/lib/types";
import { MATURITY_COLORS, MATURITY_LABELS } from "@/lib/mock-data";

export function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  const features = [
    { icon: ClipboardList, title: "Penilaian Mandiri", desc: "Lakukan penilaian maturitas digital secara mandiri berdasarkan indikator PEMDI yang komprehensif." },
    { icon: Upload, title: "Upload Bukti Dukung", desc: "Unggah dokumen pendukung untuk setiap kriteria dan level maturitas yang diampu OPD Anda." },
    { icon: BarChart3, title: "Analisis Capaian", desc: "Pantau progres dan analisis capaian maturitas digital pemerintah daerah secara real-time." },
    { icon: Shield, title: "Keamanan Data", desc: "Sistem keamanan berlapis dengan enkripsi data dan manajemen akses berbasis peran (RBAC)." },
  ];

  const stats = [
    { label: "Pemerintah Daerah", value: "514+", sub: "terdaftar" },
    { label: "Indikator Penilaian", value: "87", sub: "terverifikasi" },
    { label: "Dokumen Terunggah", value: "24.6K", sub: "tahun 2025" },
    { label: "Rata-rata Indeks", value: "3.42", sub: "skala 5.0" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ background: "rgba(13,31,64,0.95)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none">PEMDI</p>
              <p className="text-white/40 text-[9px] leading-none mt-0.5 uppercase tracking-wide">Penilaian Maturitas Digital Indonesia</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-white/60 text-xs hover:text-white transition-colors">Panduan</a>
            <a href="#" className="text-white/60 text-xs hover:text-white transition-colors">Tentang</a>
            <button onClick={() => setPage("login")} className="px-4 py-1.5 text-xs font-bold text-white rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
              Masuk
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1f40 0%, #1B3A6B 50%, #1a3a6b 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #C0392B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2E86C1 0%, transparent 50%)" }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Sistem Resmi Kemendagri — Tahun Anggaran 2025
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Penilaian Mandiri<br />
            <span style={{ background: "linear-gradient(90deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pemerintah Digital</span>
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Platform terpadu untuk mengukur, memantau, dan meningkatkan maturitas transformasi digital pemerintah daerah di seluruh Indonesia berdasarkan standar PEMDI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => setPage("login")} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              Mulai Penilaian <ArrowRight size={15} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white/80 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
              <BookOpen size={15} /> Unduh Panduan
            </button>
          </div>
        </div>

        {/* Stats band */}
        <div className="relative max-w-5xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4 rounded-xl border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900">Fitur Unggulan</h2>
            <p className="text-gray-500 text-sm mt-2">Solusi lengkap untuk manajemen penilaian maturitas digital pemerintah</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                  <f.icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maturitas levels */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Model Maturitas 5 Level</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Pengukuran bertahap dari inisiasi hingga pemimpin digital nasional</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {([1, 2, 3, 4, 5] as Maturitas[]).map(l => (
              <div key={l} className="flex-1 rounded-xl p-4 border-2" style={{ borderColor: MATURITY_COLORS[l], background: `${MATURITY_COLORS[l]}08` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-white text-sm font-extrabold" style={{ background: MATURITY_COLORS[l] }}>{l}</div>
                <p className="font-bold text-xs text-gray-800 leading-snug">{MATURITY_LABELS[l]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14" style={{ background: "linear-gradient(135deg,#0d1f40,#1B3A6B)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Mulai Penilaian Sekarang</h2>
          <p className="text-white/60 text-sm mb-7">Gunakan akun instansi Anda untuk mengakses sistem penilaian mandiri PEMDI</p>
          <button onClick={() => setPage("login")} className="inline-flex items-center gap-2 px-8 py-3 font-bold text-white rounded-xl transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
            Login ke Sistem <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">© 2025 Kementerian Dalam Negeri RI — Sistem PEMDI v1.0</p>
          <p className="text-gray-600 text-xs">Direktorat Jenderal Bina Administrasi Kewilayahan</p>
        </div>
      </footer>
    </div>
  );
}
