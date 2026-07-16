import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2, ArrowLeft } from "lucide-react";
import { Page } from "@/lib/types";

interface KriteriaItem {
  id: string;
  indikatorId: string;
  level: number;
  label: string;
  bobot: number;
  deskripsi: string;
  status: string;
}

interface IndikatorInfo {
  id: string;
  nama: string;
  no: string;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Inisiasi / Rintisan",
  2: "Emerging / Cukup",
  3: "Berkembang Baik",
  4: "Embedded / Cukup Baik",
  5: "Leading / Pemimpin",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "#EF4444",
  2: "#F97316",
  3: "#EAB308",
  4: "#22C55E",
  5: "#3B82F6",
};

export function KriteriaCrudView({
  indikator,
  setPage,
}: {
  indikator: IndikatorInfo | null;
  setPage: (p: Page) => void;
}) {
  const [kriterias, setKriterias] = useState<KriteriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    level: 1,
    label: LEVEL_LABELS[1],
    bobot: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (indikator) fetchKriteria();
  }, [indikator]);

  async function fetchKriteria() {
    setLoading(true);
    try {
      const res = await fetch(`/api/kriteria?indikatorId=${indikator!.id}`);
      if (res.ok) setKriterias(await res.json());
    } catch (err) {
      console.error("Failed to fetch kriteria", err);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(level: number) {
    setEditingId(null);
    setForm({
      level,
      label: LEVEL_LABELS[level],
      bobot: "",
      deskripsi: "",
    });
    setShowModal(true);
  }

  function handleEdit(k: KriteriaItem) {
    setEditingId(k.id);
    setForm({
      level: k.level,
      label: k.label,
      bobot: k.bobot.toString(),
      deskripsi: k.deskripsi,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data dukung ini?")) return;
    try {
      const res = await fetch(`/api/kriteria/${id}`, { method: "DELETE" });
      if (res.ok) setKriterias((prev) => prev.filter((k) => k.id !== id));
      else alert("Gagal menghapus data dukung");
    } catch {
      alert("Terjadi kesalahan");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `/api/kriteria/${editingId}`
        : "/api/kriteria";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indikatorId: indikator!.id,
          level: form.level,
          label: form.label,
          bobot: Number(form.bobot),
          deskripsi: form.deskripsi,
        }),
      });

      if (res.ok) {
        await fetchKriteria();
        setShowModal(false);
      } else {
        alert("Gagal menyimpan data dukung");
      }
    } catch {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  }

  if (!indikator) {
    return (
      <div className="p-10 text-center text-gray-400">
        Pilih indikator terlebih dahulu dari Manajemen Indikator.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white text-gray-800 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Back button & header */}
      <div className="mb-5">
        <button
          onClick={() => setPage("indikator_crud")}
          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Kembali ke Manajemen Indikator
        </button>
        <div className="bg-gray-50 rounded-xl px-5 py-3.5 border border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Indikator</p>
          <p className="text-sm font-bold text-gray-900">{indikator.no} — {indikator.nama}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Kelola data dukung / kriteria per level kematangan</p>
        </div>
      </div>

      {/* Per-level table */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((level) => {
          const levelKriteria = kriterias.filter((k) => k.level === level);
          return (
            <div key={level} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Level header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                    style={{ background: LEVEL_COLORS[level] }}
                  >
                    {level}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{LEVEL_LABELS[level]}</p>
                    <p className="text-[10px] text-gray-400">PM : {levelKriteria.length} data dukung</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(level)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus size={12} /> Tambah Data Dukung
                </button>
              </div>

              {/* Kriteria rows */}
              {loading ? (
                <div className="py-6 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500" size={20} />
                </div>
              ) : levelKriteria.length === 0 ? (
                <div className="py-4 px-4 text-center text-gray-400 italic text-xs">
                  Belum ada data dukung di level ini
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 bg-gray-50">
                      <th className="py-2 px-4 font-semibold text-left w-10">No</th>
                      <th className="py-2 px-4 font-semibold text-left">Deskripsi Data Dukung</th>
                      <th className="py-2 px-4 font-semibold text-center w-16">Value</th>
                      <th className="py-2 px-4 font-semibold text-center w-16">Status</th>
                      <th className="py-2 px-4 font-semibold text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelKriteria.map((k, idx) => (
                      <tr key={k.id} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 text-gray-700 leading-relaxed pr-4">{k.deskripsi}</td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-800">{k.bobot}</td>
                        <td className="py-3 px-4 text-center">
                          {k.status === "uploaded" ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                              Selesai
                            </span>
                          ) : (
                            <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded-full font-bold">
                              Belum Upload
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(k)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(k.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold"
                  style={{ background: LEVEL_COLORS[form.level] }}
                >
                  {form.level}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingId ? "Edit Data Dukung" : "Tambah Data Dukung"}
                  </h3>
                  <p className="text-[10px] text-gray-500">Level {form.level} — {LEVEL_LABELS[form.level]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Level selector (only when adding new) */}
              {!editingId && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Level Kematangan</label>
                  <select
                    value={form.level}
                    onChange={(e) => {
                      const l = Number(e.target.value);
                      setForm({ ...form, level: l, label: LEVEL_LABELS[l] });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((l) => (
                      <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  Value / Bobot (Contoh: 0.5)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={form.bobot}
                  onChange={(e) => setForm({ ...form, bobot: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  Deskripsi Data Dukung
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan deskripsi atau syarat data dukung untuk level ini..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                disabled={saving}
                type="submit"
                className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Simpan Perubahan" : "Simpan Data Dukung"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
