"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MATURITY_COLORS, MATURITY_LABELS } from "@/lib/mock-data";
import { Kematangan, Aspek } from "@/lib/types";

export function LaporanView() {
  const [aspeks, setAspeks] = useState<Aspek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat data laporan");
        const json = await res.json();
        if (!ignore) {
          setAspeks(json.aspeks || []);
        }
      } catch (e: any) {
        if (!ignore) setError(e.message || "Terjadi kesalahan");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

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

  const barData = aspeks.map(a => ({
    name: `Aspek ${a.no}`,
    nilai: a.indikators.filter(i => i.nilaiCapaian !== null).reduce((s, i, _, arr) => s + (i.nilaiCapaian! / arr.length), 0) || 0,
    target: 5,
  }));

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Nilai Capaian per Aspek</h3>
          <p className="text-xs text-gray-400 mb-4">Perbandingan capaian vs target (5.0)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => Number(v).toFixed(2)} />
              <Bar dataKey="target" fill="#f1f5f9" radius={[3, 3, 0, 0]} />
              <Bar dataKey="nilai" fill="#1B3A6B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Rekap per Aspek</h3>
          <div className="space-y-4">
            {aspeks.map(a => {
              const nilai = a.indikators.filter(i => i.nilaiCapaian !== null).reduce((s, i, _, arr) => s + (i.nilaiCapaian! / arr.length), 0) || 0;
              const pct = (nilai / 5) * 100;
              const level = Math.max(1, Math.min(5, Math.ceil(nilai || 1)));
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-800">{a.no}. {a.nama}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: MATURITY_COLORS[level as Kematangan] }}>
                        {MATURITY_LABELS[level as Kematangan]}
                      </span>
                      <span className="text-xs font-extrabold text-gray-900">{nilai.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: MATURITY_COLORS[level as Kematangan] }} />
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
          <h3 className="text-sm font-bold text-gray-900">Detail Capaian Indikator</h3>
          <button className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline">
            <Download size={12} /> Export Excel
          </button>
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
                const pct = ind.kriteria ? ind.kriteria.filter(k => k.status === "uploaded").length : 0;
                
                return (
                  <tr key={ind.id} className={`border-b border-gray-50 hover:bg-blue-50/20 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]"><span className="truncate block">{ind.nama}</span></td>
                    <td className="px-4 py-3 text-gray-500">{aspeks.find(a => a.id === ind.aspekId)?.nama.split(" ").slice(0, 2).join(" ")}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">{ind.bobot} %</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">{ind.nilaiCapaian?.toFixed(1) ?? "–"}</td>
                    <td className="px-4 py-3 text-gray-500 text-[11px]">{ind.predikat ?? "Belum dinilai"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${totalKriteria > 0 && pct === totalKriteria ? "bg-emerald-50 text-emerald-700 border-emerald-200" : pct > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                        {pct}/{totalKriteria} dokumen
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
                    {aspeks.flatMap(a => a.indikators).reduce((sum, ind) => sum + (ind.nilaiCapaian || 0), 0).toFixed(1)}
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
