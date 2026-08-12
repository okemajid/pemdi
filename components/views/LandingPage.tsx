"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ClipboardList, Upload, BarChart3, Shield, ShieldCheck, ArrowRight, BookOpen, FileText, Download, CheckCircle2, Eye, LayoutTemplate, TrendingUp } from "lucide-react";
import { Page, Kematangan, SuratTemplate } from "@/lib/types";
import { MATURITY_COLORS, MATURITY_LABELS } from "@/lib/mock-data";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";

function AnimatedCounter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const startTime = performance.now();
          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}</span>;
}

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface LandingData {
  totalInstansi: number;
  totalIndikator: number;
  totalDokumen: number;
  totalVerified: number;
  avgIndeks: string;
  indexPerTahun: { tahun: number; nilai: number }[];
  capaianAspek: {
    id: string;
    no: number;
    nama: string;
    bobot: number;
    nilai: number;
    pct: number;
    indikators?: {
      no: string;
      nama: string;
      bobot: number;
      nilai: number;
      pct: number;
      tipe: string;
    }[];
  }[];
  tahunTerkini: number;
  trenAspekPerTahun: Record<string, number | string>[];
  aspekKeys: string[];
}

// Palet warna untuk aspek di grafik tren
const ASPEK_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6",
  "#EF4444", "#F97316", "#06B6D4", "#EC4899",
];

export function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  const [data, setData] = useState<LandingData | null>(null);
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const resStats = await fetch("/api/landing");
        if (resStats.ok) {
          const json = await resStats.json();
          if (json.success) setData(json.data);
        }

        const resTemplates = await fetch("/api/surat-template");
        if (resTemplates.ok) {
          const jsonTpl = await resTemplates.json();
          if (jsonTpl.success) setTemplates(jsonTpl.data);
        }
      } catch (error) {
        console.error("Failed to fetch landing data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const features = [
    { icon: ClipboardList, title: "Penilaian Mandiri", desc: "Lakukan penilaian kematangan digital secara mandiri berdasarkan indikator PEMDI yang komprehensif.", color: "#3B82F6" },
    { icon: Upload, title: "Upload Bukti Dukung", desc: "Unggah dokumen pendukung untuk setiap kriteria dan level kematangan yang diampu OPD Anda.", color: "#22C55E" },
    { icon: BarChart3, title: "Analisis Capaian", desc: "Pantau progres dan analisis capaian kematangan digital pemerintah daerah secara real-time.", color: "#F59E0B" },
    { icon: Shield, title: "Keamanan Data", desc: "Sistem keamanan berlapis dengan enkripsi data dan manajemen akses berbasis peran (RBAC).", color: "#8B5CF6" },
  ];

  const stats = data ? [
    { label: "OPD Terdaftar", value: data.totalInstansi, sub: "Pemerintah Kab. Ciamis", decimals: 0 },
    { label: "Indikator Penilaian", value: data.totalIndikator, sub: "terverifikasi", decimals: 0 },
    { label: "Dokumen Terunggah", value: data.totalDokumen, sub: "bukti dukung", decimals: 0 },
    { label: "Indeks Kematangan", value: parseFloat(data.avgIndeks), sub: "dari skala 5.0", decimals: 2 },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur-xl" style={{ background: "rgba(13,31,64,0.92)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage("landing")}>
            <Image src="/ciamis2.png" alt="Logo Ciamis" width={36} height={36} className="h-9 w-auto object-contain drop-shadow-md" />
            <div>
              <p className="text-white font-extrabold text-sm leading-none">PEMDI</p>
              <p className="text-white/40 text-[9px] leading-none mt-0.5 uppercase tracking-wide hidden sm:block">Pemerintah Digital Kabupaten Ciamis</p>
            </div>
          </div>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => setPage("panduan")} className="text-white/60 text-xs hover:text-white transition-colors">Panduan</button>
            <button onClick={() => setPage("tentang")} className="text-white/60 text-xs hover:text-white transition-colors">Tentang</button>
            <button onClick={() => setPage("login")} className="px-5 py-2 text-xs font-bold text-white rounded-xl transition-all hover:scale-105 shadow-lg" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              Masuk
            </button>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden text-white/70 hover:text-white p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 px-4 py-3 space-y-2" style={{ background: "rgba(13,31,64,0.98)" }}>
            <button onClick={() => { setPage("panduan"); setMobileMenuOpen(false); }} className="block w-full text-left text-white/70 text-sm py-2 hover:text-white">Panduan</button>
            <button onClick={() => { setPage("tentang"); setMobileMenuOpen(false); }} className="block w-full text-left text-white/70 text-sm py-2 hover:text-white">Tentang</button>
            <button onClick={() => { setPage("login"); setMobileMenuOpen(false); }} className="w-full py-2.5 text-sm font-bold text-white rounded-xl mt-2" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>Masuk</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1f40 0%, #1B3A6B 50%, #1a3a6b 100%)" }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-20 -left-20 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #C0392B, transparent 70%)" }} />
          <div className="absolute w-80 h-80 top-1/2 -right-10 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }} />
          <div className="absolute w-64 h-64 bottom-0 left-1/3 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">

          <FadeInSection delay={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Penilaian Mandiri<br />
              <span style={{ background: "linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pemerintah Digital Ciamis</span>
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-white/55 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10">
              Platform terpadu untuk mengukur, memantau, dan meningkatkan kematangan transformasi digital di lingkungan Pemerintah Kabupaten Ciamis berdasarkan standar PEMDI.
            </p>
          </FadeInSection>
          <FadeInSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setPage("login")} className="flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:scale-105 shadow-xl shadow-red-900/30" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
                Mulai Penilaian <ArrowRight size={15} />
              </button>
              <button onClick={() => setPage("panduan")} className="flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white/80 rounded-xl border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                <BookOpen size={15} /> Lihat Panduan
              </button>
            </div>
          </FadeInSection>
        </div>

        {/* Stats band */}
        <FadeInSection className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-16" delay={400}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4 sm:p-5 rounded-2xl border backdrop-blur-sm group hover:scale-[1.02] transition-transform" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  <AnimatedCounter target={s.value} decimals={s.decimals} />
                </p>
                <p className="text-xs text-white/50 mt-1 font-medium">{s.label}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Capaian per Aspek (Radar Chart) */}
      {data && data.capaianAspek && data.capaianAspek.length > 0 && (
        <section className="py-14 sm:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <FadeInSection>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hasil Implementasi Penilaian</h2>
                <p className="text-gray-500 text-sm mt-2">Nilai Target dan Capaian per Domain Penilaian — Tahun {data.tahunTerkini}</p>
              </div>
            </FadeInSection>

            {/* Layout: Radar Chart + Bar Chart per Aspek */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <FadeInSection delay={100}>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-8 shadow-sm h-full">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Peta Radar Capaian</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart
                      data={data.capaianAspek.map(a => ({
                        domain: a.nama.split(" ").slice(0, 3).join(" "),
                        capaian: a.nilai,
                        target: 1.7,
                        fullNama: a.nama
                      }))}
                      margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                    >
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="domain" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} />
                      <Radar
                        name="Target Nasional"
                        dataKey="target"
                        fill="#3B82F6"
                        fillOpacity={0.45}
                        stroke="#3B82F6"
                        strokeWidth={2}
                      />
                      <Radar
                        name="Nilai Capaian"
                        dataKey="capaian"
                        fill="#F43F5E"
                        fillOpacity={0.45}
                        stroke="#F43F5E"
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}`, name || ""]}
                        labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.fullNama || _label}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </FadeInSection>

              {/* Bar Chart Capaian per Aspek */}
              <FadeInSection delay={200}>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-8 shadow-sm h-full">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Nilai Capaian per Aspek</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.capaianAspek.map(a => ({
                        nama: a.nama.length > 12 ? a.nama.substring(0, 12) + "…" : a.nama,
                        fullNama: a.nama,
                        capaian: a.nilai,
                        bobot: a.bobot,
                        pct: a.pct,
                      }))}
                      margin={{ top: 10, right: 10, bottom: 40, left: -10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="nama" tick={{ fontSize: 9, fill: "#64748b" }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[0, 'dataMax']} />
                      <Tooltip
                        formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}`, name === "capaian" ? "Nilai Capaian" : "Bobot"]}
                        labelFormatter={(_l: any, payload: any) => payload?.[0]?.payload?.fullNama || _l}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="bobot" name="Bobot Target" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="capaian" name="Nilai Capaian" radius={[4, 4, 0, 0]}>
                        {data.capaianAspek.map((_a, idx) => (
                          <Cell key={idx} fill={ASPEK_COLORS[idx % ASPEK_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>
      )}

      {/* Tren Nilai Per Tahun */}
      {data && data.indexPerTahun && data.indexPerTahun.length > 0 && (
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <FadeInSection>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                  <TrendingUp size={13} />
                  Analisis Tren Multi-Tahun
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Tren Capaian Nilai PEMDI</h2>
                <p className="text-gray-500 text-sm mt-2">Perkembangan indeks kematangan dan nilai per aspek dari tahun ke tahun</p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 gap-6">
              {/* Line Chart: Tren Indeks Keseluruhan */}
              <FadeInSection delay={100}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tren Indeks Kematangan Digital Keseluruhan (Skala 0–5)</p>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.indexPerTahun} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 5]} />
                      <Tooltip
                        formatter={(value: any) => [`${Number(value).toFixed(2)}`, "Indeks Kematangan"]}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="nilai"
                        name="Indeks Kematangan"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </FadeInSection>

              {/* Bar Chart: Tren Nilai per Aspek per Tahun */}
              {data.trenAspekPerTahun && data.trenAspekPerTahun.length > 0 && data.aspekKeys && data.aspekKeys.length > 0 && (
                <FadeInSection delay={200}>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tren Nilai Capaian per Aspek per Tahun</p>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.trenAspekPerTahun} margin={{ top: 5, right: 20, bottom: 80, left: -10 }} barCategoryGap="25%" barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <Tooltip
                          formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}`, name]}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '10px', paddingTop: '16px' }}
                          formatter={(value: string) => <span style={{ color: '#64748b' }}>{value}</span>}
                        />
                        {data.aspekKeys.map((key, idx) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            name={key}
                            fill={ASPEK_COLORS[idx % ASPEK_COLORS.length]}
                            radius={[3, 3, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </FadeInSection>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Fitur Unggulan</h2>
              <p className="text-gray-500 text-sm mt-2">Solusi lengkap untuk manajemen penilaian kematangan digital pemerintah</p>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}dd)` }}>
                    <f.icon size={19} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1.5">{f.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Kematangan levels */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-2">Model Kematangan 5 Level</h2>
            <p className="text-gray-500 text-sm text-center mb-10">Pengukuran bertahap dari inisiasi hingga pemimpin digital nasional</p>
          </FadeInSection>
          <div className="flex flex-col sm:flex-row gap-3">
            {([1, 2, 3, 4, 5] as Kematangan[]).map((l, i) => (
              <FadeInSection key={l} className="flex-1" delay={i * 80}>
                <div className="rounded-2xl p-5 border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" style={{ borderColor: MATURITY_COLORS[l], background: `${MATURITY_COLORS[l]}08` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white text-sm font-extrabold shadow-md" style={{ background: MATURITY_COLORS[l] }}>{l}</div>
                  <p className="font-bold text-xs text-gray-800 leading-snug">{MATURITY_LABELS[l]}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Templates List */}
      <section className="py-14 sm:py-20 bg-gray-50" id="templates">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Template Surat & Dokumen</h2>
              <p className="text-gray-500 text-sm mt-2">Unduh format resmi yang dapat digunakan untuk keperluan Anda</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-10 text-center text-gray-500">Memuat template...</div>
            ) : templates.length === 0 ? (
              <div className="col-span-full py-10 text-center text-gray-500">Belum ada template surat yang tersedia.</div>
            ) : (
              templates.map((tpl, i) => (
                <FadeInSection key={tpl.id} delay={i * 50}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />

                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <LayoutTemplate size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight mb-1">{tpl.nama}</h3>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold mb-2">
                          {tpl.tipeDokumen}
                        </span>
                        <p className="text-xs text-gray-500 line-clamp-2">{tpl.deskripsi}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-5 relative z-10">
                      <a
                        href={tpl.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Download size={16} /> Unduh
                      </a>
                    </div>
                  </div>
                </FadeInSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16" style={{ background: "linear-gradient(135deg,#0d1f40,#1B3A6B)" }}>
        <FadeInSection>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Mulai Penilaian Sekarang</h2>
            <p className="text-white/55 text-sm mb-8">Gunakan akun instansi Anda untuk mengakses sistem penilaian mandiri PEMDI</p>
            <button onClick={() => setPage("login")} className="inline-flex items-center gap-2 px-8 py-3.5 font-bold text-white rounded-xl transition-all hover:scale-105 shadow-xl shadow-red-900/30" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              Login ke Sistem <ArrowRight size={15} />
            </button>
          </div>
        </FadeInSection>
      </section>

      <footer className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/ciamis2.png" alt="Logo Ciamis" width={28} height={28} className="h-7 w-auto object-contain grayscale opacity-80" />
            <div>
              <p className="text-white/70 text-xs font-bold">PEMDI Ciamis</p>
              <p className="text-white/30 text-[10px]">Pemerintah Digital</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Pemerintah Kabupaten Ciamis — Sistem PEMDI v1.0</p>
            <p className="text-gray-600 text-[10px] mt-0.5">Dinas Komunikasi dan Informatika Kabupaten Ciamis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
