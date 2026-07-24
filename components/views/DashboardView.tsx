"use client";

import { useEffect, useState, useCallback } from "react";
import { Layers, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Page, UploadStatus } from "@/lib/types";

interface KriteriaLevelData { level: number; label: string; bobot: number; deskripsi: string; status: UploadStatus; file?: string }
interface IndikatorData { id: number; no: string; nama: string; tipe: string; bobot: number; nilaiCapaian: number | null; predikat: string | null; kriteria: KriteriaLevelData[] }
interface AspekData { id: number; no: number; nama: string; bobot: number; indikators: IndikatorData[] }
interface StatsData { total: number; verified: number; uploaded: number; pending: number; rejected: number; empty: number }
interface SessionData { instansi: string; kode: string; kategori: string }
interface DashboardResponse { session: SessionData; aspeks: AspekData[]; stats: StatsData; }

export function DashboardView({ setPage, selectedYear, currentUser }: { setPage: (p: Page) => void; selectedYear: string; currentUser: any }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = currentUser.role === "Super Admin"
        ? `/api/dashboard?tahun=${selectedYear}`
        : `/api/dashboard?tahun=${selectedYear}&userId=${currentUser.id}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat data dashboard");
      const json: DashboardResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, currentUser.role, currentUser.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-2" size={28} />
        <p className="text-sm">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 text-center text-red-500 text-sm">
        {error ?? "Data tidak ditemukan"}
      </div>
    );
  }

  const { session: SESSION, aspeks, stats } = data;
  const pct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;
  const nilaiRata = aspeks.flatMap(a => a.indikators).filter(i => i.nilaiCapaian !== null).reduce((s, i) => s + (i.nilaiCapaian! * (i.bobot / 100)), 0) || 0;

  const radarData = aspeks.map(a => ({
    domain: a.nama.split(" ").slice(0, 2).join(" "),
    capaian: a.indikators.filter(i => i.nilaiCapaian !== null).reduce((s, i) => s + (i.nilaiCapaian! * (i.bobot / (a.bobot || 1))), 0) || 0,
    target: 5,
  }));

  const pieData = [
    { name: "Terverifikasi", value: stats.verified, color: "#3B82F6" },
    { name: "Terunggah", value: stats.uploaded, color: "#22C55E" },
    // { name: "Review", value: stats.pending, color: "#F59E0B" },
    { name: "Ditolak", value: stats.rejected, color: "#EF4444" },
    { name: "Belum Upload", value: stats.empty, color: "#CBD5E1" },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Header banner */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f40,#1B3A6B)" }}>
        <div className="absolute right-0 bottom-0 opacity-5 text-white" style={{ fontSize: 120, lineHeight: 1, fontWeight: 900, userSelect: "none" }}>PEMDI</div>
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Sistem Penyimpanan Bukti Dukung Pemerintah Digital Kabupaten Ciamis</p>
          {/* <h2 className="text-white font-extrabold text-lg mt-1">{SESSION.instansi}</h2>
          <p className="text-white/40 text-xs mt-0.5">Kode: {SESSION.kode} · {SESSION.kategori}</p> */}
          <h2 className="text-white font-extrabold text-lg mt-1">Pemerintah Kabupaten Ciamis</h2>
          <p className="text-white/40 text-xs mt-0.5">Kode: 3207 . Kab/Kota</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Indeks Kematangan</p>
            <p className="text-3xl font-extrabold text-white">{nilaiRata.toFixed(2)}</p>
            <p className="text-white/40 text-[10px]">dari 5.00</p>
          </div>
          <div className="text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">Dokumen Lengkap</p>
            <p className="text-3xl font-extrabold text-white">{pct}%</p>
            <div className="w-24 h-1.5 bg-white/15 rounded-full mt-1.5">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total Kriteria", v: stats.total, s: "semua aspek", c: "#1B3A6B", i: Layers },
          { l: "Dokumen Lengkap", v: stats.verified, s: `${pct}% terpenuhi`, c: "#22C55E", i: CheckCircle },
          { l: "Menunggu Review", v: stats.uploaded, s: "sedang diverifikasi", c: "#F59E0B", i: Clock },
          { l: "Perlu Tindakan", v: stats.rejected + stats.empty, s: "segera lengkapi", c: "#EF4444", i: AlertCircle },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.c }}>
              <s.i size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{s.l}</p>
              <p className="text-xl font-extrabold text-gray-900">{s.v}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.s}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Capaian per Aspek</h3>
          <p className="text-xs text-gray-400 mb-4">Nilai kematangan rata-rata per domain penilaian</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Radar name="Capaian" dataKey="capaian" fill="#1B3A6B" fillOpacity={0.25} stroke="#1B3A6B" strokeWidth={2} />
              <Radar name="Target" dataKey="target" fill="transparent" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
              <Tooltip formatter={(v: any) => Number(v).toFixed(2)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Status Dokumen</h3>
          <p className="text-xs text-gray-400 mb-3">Distribusi status upload</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[11px] text-gray-500 flex-1">{d.name}</span>
                <span className="text-[11px] font-bold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Aspek progress */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Progres per Aspek</h3>
            <button onClick={() => setPage("penilaian")} className="text-xs font-semibold text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {aspeks.map(a => {
              const total = a.indikators.flatMap(i => i.kriteria).length;
              const done = a.indikators.flatMap(i => i.kriteria).filter(k => k.status === "verified").length;
              const pctAspek = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{a.no}. {a.nama}</span>
                    <span className="text-[11px] text-gray-400">{done}/{total} · {pctAspek}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pctAspek}%`, background: "linear-gradient(90deg,#1B3A6B,#2E5BA8)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}