import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Loader2, Eye, EyeOff, ChevronLeft, Key, UserCheck } from "lucide-react";

interface UserItem {
  id: string;
  nama: string;
  email: string;
  nip: string;
  instansi: string;
  role: string;
  status: "Aktif" | "Nonaktif";
  lastLogin: string;
}

interface IndikatorAkses {
  id: string;
  no: string;
  nama: string;
  tipe: string;
  bobot: number;
  aspekNama: string;
  aspekNo: number;
}

const ROLES = ["Super Admin", "Admin Instansi", "Operator OPD", "Viewer"];
const roleBadge: Record<string, string> = {
  "Super Admin": "bg-red-50 text-red-700 border-red-200",
  "Admin Instansi": "bg-blue-50 text-blue-700 border-blue-200",
  "Operator OPD": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Viewer": "bg-gray-50 text-gray-600 border-gray-200",
};

interface CurrentUserProp {
  id: string;
  nama: string;
  role: string;
  instansi?: string;
  permissions?: string[];
}

export function UsersView({ currentUser, onImpersonate }: { currentUser?: CurrentUserProp, onImpersonate?: (user: any) => void }) {
  const isSuperAdmin = currentUser?.role === "Super Admin";
  const perms = currentUser?.permissions || [];
  const hasKelolaPengguna = isSuperAdmin || perms.includes("Kelola Pengguna");
  const hasKelolaPenggunaOPD = perms.includes("Kelola Pengguna OPD");
  const isAdmin = hasKelolaPengguna || hasKelolaPenggunaOPD;

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<UserItem | null>(null);
  const [detailIndikators, setDetailIndikators] = useState<IndikatorAkses[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [selfEditMode, setSelfEditMode] = useState(false);

  const [form, setForm] = useState({
    nama: "", email: "", nip: "", instansi: "", role: "Operator OPD", status: "Aktif" as "Aktif" | "Nonaktif", password: ""
  });

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(user: UserItem) {
    setShowDetail(user);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) setDetailIndikators(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  }

  function handleAdd() {
    setEditingId(null);
    setSelfEditMode(false);
    const defaultInstansi = (!hasKelolaPengguna && hasKelolaPenggunaOPD && currentUser?.instansi) ? currentUser.instansi : "";
    setForm({ nama: "", email: "", nip: "", instansi: defaultInstansi, role: "Operator OPD", status: "Aktif", password: "" });
    setShowPass(false);
    setShowModal(true);
  }

  function handleSelfEdit() {
    if (!currentUser) return;
    const me = users.find(u => u.id === currentUser.id);
    if (!me) return;
    setEditingId(me.id);
    setSelfEditMode(true);
    setForm({ nama: me.nama, email: me.email, nip: me.nip, instansi: me.instansi, role: me.role, status: me.status, password: "" });
    setShowPass(false);
    setShowModal(true);
  }

  function handleEdit(u: UserItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(u.id);
    setSelfEditMode(false);
    setForm({ nama: u.nama, email: u.email, nip: u.nip, instansi: u.instansi, role: u.role, status: u.status, password: "" });
    setShowPass(false);
    setShowModal(true);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Hapus pengguna ini?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    else alert("Gagal menghapus");
  }

  async function handleResetPassword(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Reset password pengguna ini ke default ('password123')?")) return;
    try {
      const u = users.find(user => user.id === id);
      if (!u) return;
      // We pass the existing user data but with password set to "password123"
      const res = await fetch(`/api/users/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...u, password: "password123" })
      });
      if (res.ok) alert("Password berhasil direset ke default: password123");
      else alert("Gagal mereset password");
    } catch { alert("Terjadi kesalahan"); }
  }

  async function handleImpersonateClick(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Login sebagai pengguna ini (Impersonate)?")) return;
    try {
      const res = await fetch(`/api/users/${id}/impersonate`);
      const data = await res.json();
      if (res.ok && data.success && onImpersonate) {
        onImpersonate(data.user);
      } else {
        alert(data.error || "Gagal melakukan impersonate");
      }
    } catch {
      alert("Terjadi kesalahan saat memproses impersonate");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) { await fetchUsers(); setShowModal(false); }
      else alert("Gagal menyimpan pengguna");
    } catch { alert("Terjadi kesalahan"); }
    finally { setSaving(false); }
  }

  const filtered = users.filter(u => {
    // If user only has Kelola Pengguna OPD, they can only see their own instansi
    if (!hasKelolaPengguna && hasKelolaPenggunaOPD && currentUser && u.instansi !== currentUser.instansi) {
      return false;
    }
    return u.nama?.toLowerCase().includes(search.toLowerCase()) ||
           u.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (showDetail) {
    return (
      <div className="p-5 space-y-4">
        <button onClick={() => setShowDetail(null)} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
          <ChevronLeft size={14} /> Kembali ke Daftar Pengguna
        </button>

        {/* User card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
            {showDetail.nama.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900">{showDetail.nama}</p>
            <p className="text-xs text-gray-500">{showDetail.email} · {showDetail.instansi}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge[showDetail.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{showDetail.role}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${showDetail.status === "Aktif" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>{showDetail.status}</span>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p className="text-[10px]">NIP</p>
            <p className="font-mono font-bold text-gray-700">{showDetail.nip}</p>
          </div>
        </div>

        {/* Indikator Akses */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">Hak Akses Indikator Penilaian</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Daftar indikator yang dapat diisi oleh pengguna ini</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
              {detailIndikators.length} Indikator
            </span>
          </div>
          {loadingDetail ? (
            <div className="py-10 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={22} /></div>
          ) : detailIndikators.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              <p className="text-2xl mb-2">🔒</p>
              <p className="font-medium">Belum ada indikator yang diizinkan</p>
              <p className="text-[10px] mt-1">Kelola hak akses melalui halaman Manajemen Indikator</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400">
                  <th className="text-left px-5 py-3 font-bold uppercase tracking-wide text-[10px] w-20">No</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[10px]">Nama Indikator</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[10px]">Aspek</th>
                  <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[10px] w-20">Tipe</th>
                  <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[10px] w-20">Bobot</th>
                </tr>
              </thead>
              <tbody>
                {detailIndikators.map((ind, i) => (
                  <tr key={ind.id} className={`border-b border-gray-50 hover:bg-blue-50/20 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-5 py-3 font-mono font-bold text-blue-700">{ind.no}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{ind.nama}</td>
                    <td className="px-4 py-3 text-gray-500">Aspek {ind.aspekNo}: {ind.aspekNama}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.tipe === "Internal" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{ind.tipe}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">{ind.bobot}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
        {isAdmin ? (
          <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
            <Plus size={13} /> Tambah Pengguna
          </button>
        ) : (
          <button onClick={handleSelfEdit} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
            <Edit2 size={13} /> Edit Profil Saya
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Nama / NIP", "Email", "Instansi", "Role", "Status", "Login Terakhir", "Aksi"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold text-gray-400 uppercase tracking-wide text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={22} /></td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} onClick={() => openDetail(u)} className={`border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                        {u.nama?.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{u.nama}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{u.nip}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[150px]"><span className="truncate block">{u.instansi}</span></td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge[u.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "Aktif" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap text-[10px]">{u.lastLogin}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={e => openDetail(u)} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors" title="Lihat Akses"><Eye size={13} /></button>
                      {hasKelolaPengguna && <button onClick={e => handleImpersonateClick(u.id, e)} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors" title="Login sbg User (Impersonate)"><UserCheck size={13} /></button>}
                      {isAdmin && <button onClick={e => handleEdit(u, e)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit"><Edit2 size={13} /></button>}
                      {isAdmin && <button onClick={e => handleResetPassword(u.id, e)} className="p-1.5 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-700 rounded-lg transition-colors" title="Reset Password"><Key size={13} /></button>}
                      {hasKelolaPengguna && <button onClick={e => handleDelete(u.id, e)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Hapus"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">{filtered.length} dari {(!hasKelolaPengguna && hasKelolaPenggunaOPD && currentUser) ? users.filter(u => u.instansi === currentUser.instansi).length : users.length} pengguna</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#0d1f40,#1B3A6B)" }}>
              <h3 className="text-white font-bold text-sm">{selfEditMode ? "Edit Profil Saya" : editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-3">
              {/* Self-edit mode: only NIP, Email, Password */}
              {selfEditMode ? (
                <>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">NIP</label>
                    <input value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} placeholder="18 digit NIP ASN" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Email Instansi</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nama@instansi.go.id" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Password <span className="text-gray-400 font-normal normal-case">(Biarkan kosong jika tidak ingin diubah)</span></label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ketik password baru untuk mengubah" className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nama Lengkap</label>
                    <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">NIP</label>
                    <input value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} placeholder="18 digit NIP ASN" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Email Instansi</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nama@instansi.go.id" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Instansi / OPD</label>
                    <input disabled={!hasKelolaPengguna && hasKelolaPenggunaOPD} value={form.instansi} onChange={e => setForm({...form, instansi: e.target.value})} placeholder="Nama Instansi" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Password {editingId && <span className="text-gray-400 font-normal normal-case">(Biarkan kosong jika tidak ingin diubah)</span>}</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? "Ketik password baru untuk mengubah" : "Default: password123"} className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1"><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Role</label>
                      <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50">
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select></div>
                    {editingId && <div className="flex-1"><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50">
                        <option>Aktif</option><option>Nonaktif</option>
                      </select></div>}
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-50">Batal</button>
                <button disabled={saving} type="submit" className="flex-1 py-2.5 text-white text-xs font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editingId ? "Simpan" : "Tambah"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
