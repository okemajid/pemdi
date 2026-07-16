import React, { useState, useEffect } from "react";
import { Loader2, Search, Activity, Filter, RefreshCw } from "lucide-react";

interface LogItem {
  id: string;
  user_id: string;
  userName: string;
  aksi: string;
  detail: string;
  createdAt: string;
}

const AKSI_COLORS: Record<string, string> = {
  "Login": "bg-blue-50 text-blue-700 border-blue-100",
  "Upload Dokumen": "bg-purple-50 text-purple-700 border-purple-100",
  "Input Penilaian": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Tambah Indikator": "bg-green-50 text-green-700 border-green-100",
  "Edit Indikator": "bg-orange-50 text-orange-700 border-orange-100",
  "Hapus Indikator": "bg-red-50 text-red-700 border-red-100",
  "Tambah User": "bg-teal-50 text-teal-700 border-teal-100",
};

export function LogActivityView() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAksi, setFilterAksi] = useState("semua");

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/log");
      if (res.ok) setLogs(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const allAksi = ["semua", ...Array.from(new Set(logs.map(l => l.aksi).filter(Boolean)))];
  
  const filtered = logs.filter(l => {
    const matchSearch = !search || 
      l.userName?.toLowerCase().includes(search.toLowerCase()) ||
      l.aksi?.toLowerCase().includes(search.toLowerCase()) ||
      l.detail?.toLowerCase().includes(search.toLowerCase());
    const matchAksi = filterAksi === "semua" || l.aksi === filterAksi;
    return matchSearch && matchAksi;
  });

  function formatDate(dt: string) {
    if (!dt) return "–";
    try {
      return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dt; }
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari log..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-gray-400" />
            <select
              value={filterAksi}
              onChange={e => setFilterAksi(e.target.value)}
              className="text-xs bg-white border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {allAksi.map(a => <option key={a} value={a}>{a === "semua" ? "Semua Aktivitas" : a}</option>)}
            </select>
          </div>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors border border-gray-200 px-3 py-2 rounded-xl bg-white">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Activity size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-gray-800">Log Aktivitas Sistem</span>
          <span className="ml-auto text-[10px] text-gray-400">{filtered.length} entri</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400">
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wide text-[10px]">Waktu</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[10px]">Pengguna</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[10px]">Aktivitas</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[10px]">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={22} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">Tidak ada log ditemukan</td></tr>
              ) : filtered.map((log, i) => (
                <tr key={log.id} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                        {(log.userName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold text-gray-800">{log.userName || log.user_id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AKSI_COLORS[log.aksi] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {log.aksi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
