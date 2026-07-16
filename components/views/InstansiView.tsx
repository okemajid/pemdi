import { Plus, Edit2, Trash2 } from "lucide-react";
import { MATURITY_COLORS } from "@/lib/mock-data";

export function InstansiView() {
  const list = [
    { kode: "3220301", nama: "Pemerintah Kabupaten Ciamis", kategori: "Kab/Kota", provinsi: "Jawa Barat", status: "Aktif", indeks: 3.42, tahun: 2025 },
    { kode: "3220401", nama: "Pemerintah Kota Tasikmalaya", kategori: "Kab/Kota", provinsi: "Jawa Barat", status: "Aktif", indeks: 3.68, tahun: 2025 },
    { kode: "3220101", nama: "Pemerintah Kabupaten Garut", kategori: "Kab/Kota", provinsi: "Jawa Barat", status: "Aktif", indeks: 2.95, tahun: 2025 },
    { kode: "3200000", nama: "Pemerintah Provinsi Jawa Barat", kategori: "Provinsi", provinsi: "Jawa Barat", status: "Aktif", indeks: 4.12, tahun: 2025 },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Daftar instansi pemerintah dalam sistem PEMDI</p>
        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
          <Plus size={13} /> Tambah Instansi
        </button>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Kode", "Nama Instansi", "Kategori", "Provinsi", "Indeks Maturitas", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((inst, i) => (
              <tr key={inst.kode} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                <td className="px-4 py-3.5 font-mono font-bold text-blue-700">{inst.kode}</td>
                <td className="px-4 py-3.5 font-semibold text-gray-800">{inst.nama}</td>
                <td className="px-4 py-3.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">{inst.kategori}</span></td>
                <td className="px-4 py-3.5 text-gray-500">{inst.provinsi}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(inst.indeks / 5) * 100}%`, background: MATURITY_COLORS[inst.indeks < 2 ? 1 : inst.indeks < 3 ? 2 : inst.indeks < 4 ? 3 : inst.indeks < 4.5 ? 4 : 5] }} />
                    </div>
                    <span className="font-extrabold text-gray-900">{inst.indeks.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{inst.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button className="p-1.5 border border-gray-100 rounded-lg text-gray-300 hover:text-blue-500 transition-colors"><Edit2 size={11} /></button>
                    <button className="p-1.5 border border-gray-100 rounded-lg text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
