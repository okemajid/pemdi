"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MATURITY_COLORS, MATURITY_LABELS } from "@/lib/mock-data";
import { Kematangan, Aspek } from "@/lib/types";

export function LaporanView({ selectedYear, currentUser }: { selectedYear: string, currentUser: any }) {
  const [aspeks, setAspeks] = useState<Aspek[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const exportUrl = currentUser.role === "Super Admin" 
        ? `/api/export?tahun=${selectedYear}` 
        : `/api/export?tahun=${selectedYear}&userId=${currentUser.id}`;
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error("Gagal mengunduh file");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_PEMDI_${selectedYear}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Gagal mengunduh file Excel. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  }


  useEffect(() => {
    let ignore = false;

    // Show full-screen loader only on first load; show small indicator on year change
    if (aspeks.length > 0) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    (async () => {
      try {
        const url = currentUser.role === "Super Admin" 
          ? `/api/dashboard?tahun=${selectedYear}` 
          : `/api/dashboard?tahun=${selectedYear}&userId=${currentUser.id}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat data laporan");
        const json = await res.json();
        if (!ignore) {
          setAspeks(json.aspeks || []);
        }
      } catch (e: any) {
        if (!ignore) setError(e.message || "Terjadi kesalahan");
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-2" size={28} />
        <p className="text-sm">Memuat analisis capaian...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  // Ranking predikat untuk agregasi aspek
  const PREDIKAT_RANK: Record<string, number> = {
    "Inisiasi / Rintisan": 1, "Emerging / Cukup": 2, "Berkembang Baik": 3,
    "Embedded / Dapat Baik": 4, "Leading / Pemimpin": 5,
  };
  const RANK_PREDIKAT: Record<number, string> = {
    1: "Inisiasi / Rintisan", 2: "Emerging / Cukup", 3: "Berkembang Baik",
    4: "Embedded / Dapat Baik", 5: "Leading / Pemimpin",
  };
  const PREDIKAT_COLOR: Record<string, string> = {
    "Inisiasi / Rintisan": "#EF4444", "Emerging / Cukup": "#F97316",
    "Berkembang Baik": "#EAB308", "Embedded / Dapat Baik": "#22C55E",
    "Leading / Pemimpin": "#3B82F6",
  };

  // Helper: apakah semua kriteria indikator sudah verified?
  // Helper: konversi nilai capaian ke skala bobot indikator
  function convertedNilai(ind: any): number | null {
    if (ind.nilaiCapaian === null || ind.nilaiCapaian === undefined) return null;
    if (ind.tipe === 'Eksternal') {
      return Math.min((ind.nilaiCapaian / 5) * ind.bobot, ind.bobot);
    }
    return Math.min(ind.nilaiCapaian, ind.bobot);
  }

  // Helper: predikat berdasarkan rasio nilai/bobot
  function predikatFromNilai(nilai: number | null, bobot: number): string | null {
    if (nilai === null || nilai <= 0 || bobot <= 0) return null;
    const ratio = nilai / bobot;
    if (ratio >= 1.0) return "Leading / Pemimpin";
    if (ratio >= 0.75) return "Embedded / Dapat Baik";
    if (ratio >= 0.5) return "Berkembang Baik";
    if (ratio >= 0.25) return "Emerging / Cukup";
    return "Inisiasi / Rintisan";
  }

  // barData: nilai = SUM nilaiCapaian indikator (max = bobot aspek)
  const barData = aspeks.map(a => ({
    name: `Aspek ${a.no}`,
    nilai: a.indikators.reduce((s: number, i: any) => s + (convertedNilai(i) || 0), 0),
    target: a.bobot,
  }));

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Nilai Capaian per Aspek</h3>
          <p className="text-xs text-gray-400 mb-4">Perbandingan capaian vs target (bobot aspek)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, Math.max(...aspeks.map(a => a.bobot), 1)]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => Number(Number(v).toFixed(1))} />
              <Bar dataKey="target" fill="#f1f5f9" radius={[3, 3, 0, 0]} />
              <Bar dataKey="nilai" fill="#1B3A6B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Rekap per Aspek</h3>
          <div className="space-y-4">
            {aspeks.map(a => {
              const nilaiAspek = a.indikators.reduce((s: number, i: any) => s + (convertedNilai(i) || 0), 0);
              // Progress bar: full (100%) saat semua indikator fully verified
              const pct = a.bobot > 0 ? Math.min((nilaiAspek / a.bobot) * 100, 100) : 0;
              // Predikat: weighted average dari predikat indikator (berdasarkan bobot)
              const indWithPredikat = a.indikators.filter((i: any) => i.predikat && PREDIKAT_RANK[i.predikat]);
              const totalBobotPred = indWithPredikat.reduce((s: number, i: any) => s + i.bobot, 0);
              const weightedRank = totalBobotPred > 0
                ? indWithPredikat.reduce((s: number, i: any) => s + (PREDIKAT_RANK[i.predikat] * i.bobot), 0) / totalBobotPred
                : 0;
              const predikatAspek = weightedRank >= 4.5 ? "Leading / Pemimpin"
                : weightedRank >= 3.5 ? "Embedded / Dapat Baik"
                : weightedRank >= 2.5 ? "Berkembang Baik"
                : weightedRank >= 1.5 ? "Emerging / Cukup"
                : weightedRank > 0 ? "Inisiasi / Rintisan"
                : null;
              const barColor = predikatAspek ? PREDIKAT_COLOR[predikatAspek] : "#CBD5E1";
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-800">{a.no}. {a.nama}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: barColor }}>
                        {predikatAspek ?? "Belum dinilai"}
                      </span>
                      <span className="text-xs font-extrabold text-gray-900">{Number(nilaiAspek.toFixed(1))}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            Detail Capaian Indikator
            <span className="ml-2 text-xs font-normal text-gray-400">Tahun {selectedYear}</span>
          </h3>
          <div className="flex items-center gap-3">
            {refreshing && (
              <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                <Loader2 size={12} className="animate-spin" />
                <span>Memuat data...</span>
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              {exporting ? `Mengunduh ${selectedYear}...` : `Export Excel ${selectedYear}`}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Kode", "Indikator", "Aspek", "Bobot", "Nilai", "Predikat", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aspeks.flatMap(a => a.indikators).map((ind, i) => {
                const totalKriteria = ind.kriteria ? ind.kriteria.length : 0;
                const verifiedCount = ind.kriteria ? ind.kriteria.filter((k: any) => k.status === "verified").length : 0;
                const uploadedCount = ind.kriteria ? ind.kriteria.filter((k: any) => k.status === "uploaded" || k.status === "verified").length : 0;
                const allVerified = totalKriteria > 0 && verifiedCount === totalKriteria;
                const nilaiDisplay = convertedNilai(ind);
                const hasNilai = nilaiDisplay !== null;
                const predikatDisplay = predikatFromNilai(nilaiDisplay, ind.bobot);

                return (
                  <tr key={ind.id} className={`border-b border-gray-50 hover:bg-blue-50/20 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]"><span className="truncate block">{ind.nama}</span></td>
                    <td className="px-4 py-3 text-gray-500">{aspeks.find(a => a.id === ind.aspekId)?.nama.split(" ").slice(0, 2).join(" ")}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">{ind.bobot} %</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">
                      {hasNilai ? Number((nilaiDisplay as number).toFixed(1)) : "–"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[11px]">{predikatDisplay ?? "Belum dinilai"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        allVerified ? "bg-blue-50 text-blue-700 border-blue-200" :
                        uploadedCount === totalKriteria && totalKriteria > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        uploadedCount > 0 ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-gray-50 text-gray-400 border-gray-200"
                      }`}>
                        {uploadedCount}/{totalKriteria} dokumen
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {aspeks.flatMap(a => a.indikators).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Tidak ada data indikator
                  </td>
                </tr>
              )}
            </tbody>
            {aspeks.flatMap(a => a.indikators).length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700 uppercase text-[10px] tracking-wide">
                    Total
                  </td>
                  <td className="px-4 py-3 font-extrabold text-blue-800">
                    {aspeks.flatMap(a => a.indikators).reduce((sum, ind) => sum + (ind.bobot || 0), 0)} %
                  </td>
                  <td className="px-4 py-3 font-extrabold text-blue-800">
                    {Number(aspeks.flatMap(a => a.indikators).reduce((sum, ind) => sum + (convertedNilai(ind) || 0), 0).toFixed(1))}
                  </td>
                  <td colSpan={2} className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
