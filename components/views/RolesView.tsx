import React, { useState, useEffect } from "react";
import { Shield, Edit2, Users, CheckCircle, Plus, X, Loader2, Trash2 } from "lucide-react";

interface RoleItem {
  id: string;
  nama: string;
  deskripsi: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  "Kelola Instansi", "Kelola Pengguna", "Kelola Indikator",
  "Kelola Pengguna OPD", "Input Penilaian", "Upload Dokumen",
  "Lihat Laporan", "Export Data", "Konfigurasi Sistem"
];

const ROLE_USERS: Record<string, number> = {
  "Super Admin": 1, "Admin Instansi": 4, "Operator OPD": 12, "Viewer": 8,
};

export function RolesView() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", deskripsi: "", permissions: [] as string[] });

  useEffect(() => { fetchRoles(); }, []);

  async function fetchRoles() {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleAdd() {
    setEditingId(null);
    setForm({ nama: "", deskripsi: "", permissions: [] });
    setShowModal(true);
  }

  function handleEdit(r: RoleItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(r.id);
    setForm({ nama: r.nama, deskripsi: r.deskripsi, permissions: [...r.permissions] });
    setShowModal(true);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Hapus role ini?")) return;
    const res = await fetch(`/api/roles/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) setRoles(prev => prev.filter(r => r.id !== id));
    else alert("Gagal menghapus role");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/roles/${editingId}` : "/api/roles";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) { await fetchRoles(); setShowModal(false); }
      else alert("Gagal menyimpan role");
    } catch { alert("Terjadi kesalahan"); }
    finally { setSaving(false); }
  }

  function togglePermission(perm: string) {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{roles.length} role tersedia dalam sistem</p>
        <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
          <Plus size={13} /> Tambah Role
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={14} className="text-blue-600" />
                    <h3 className="font-extrabold text-sm text-gray-900">{r.nama}</h3>
                  </div>
                  <p className="text-xs text-gray-400">{r.deskripsi}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-gray-900">{ROLE_USERS[r.nama] || 0}</p>
                  <p className="text-[10px] text-gray-400">pengguna</p>
                </div>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Hak Akses</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.map(p => (
                    <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{p}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={e => handleEdit(r, e)} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <Edit2 size={11} /> Edit Role
                  </button>
                  <button className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    <Users size={11} /> Kelola Pengguna
                  </button>
                  {!["Super Admin", "Admin Instansi", "Operator OPD", "Viewer"].includes(r.nama) && (
                    <button onClick={e => handleDelete(r.id, e)} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={11} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permission Matrix */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-900">Matriks Hak Akses</h3>
          <p className="text-xs text-gray-400 mt-0.5">Perbandingan akses antar role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wide">Hak Akses</th>
                {roles.map(r => <th key={r.id} className="text-center px-4 py-3 font-bold text-gray-500 text-[10px]">{r.nama}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((perm, i) => (
                <tr key={perm} className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-2.5 font-medium text-gray-700 text-[11px]">{perm}</td>
                  {roles.map(r => (
                    <td key={r.id} className="px-4 py-2.5 text-center">
                      {r.permissions.includes(perm)
                        ? <CheckCircle size={14} className="text-emerald-500 mx-auto" />
                        : <span className="text-gray-200">—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#0d1f40,#1B3A6B)" }}>
              <h3 className="text-white font-bold text-sm">{editingId ? "Edit Role" : "Tambah Role Baru"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nama Role</label>
                <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} placeholder="Contoh: Auditor" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Deskripsi</label>
                <textarea required rows={2} value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">Hak Akses</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                      <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="rounded text-blue-600" />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-50">Batal</button>
              <button disabled={saving} type="submit" className="flex-1 py-2.5 text-white text-xs font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                {saving && <Loader2 size={13} className="animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
