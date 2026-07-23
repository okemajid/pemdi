import { Search, Bell } from "lucide-react";
import { SESSION } from "@/lib/mock-data";

export function TopBar({ title, sub, selectedYear, setSelectedYear }: { title: string; sub: string; selectedYear?: string; setSelectedYear?: (y: string) => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
      <div>
        <h1 className="text-sm font-bold text-gray-900">{title}</h1>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        {selectedYear && setSelectedYear && (
          <div className="flex items-center gap-2 border-r border-gray-100 pr-3">
            <span className="text-[10px] font-semibold text-gray-500 uppercase">Tahun</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs border border-gray-200 bg-gray-50 rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Cari..." className="pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
        <button className="relative w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-gray-700">
          <Bell size={13} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-100">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
            {SESSION.nama.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <span className="text-xs font-semibold text-gray-700">{SESSION.nama.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}
