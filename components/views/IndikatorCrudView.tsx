import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, X, Loader2, ChevronDown, ChevronUp, ListChecks, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Aspek {
  id: string;
  no: number;
  nama: string;
  bobot: number;
}

interface Indikator {
  id: string;
  no: string;
  nama: string;
  tipe: "Internal" | "Eksternal";
  bobot: number;
  aspekId: string;
  aksesUsers?: string[];
  nilaiCapaian?: number | null;
}

export function IndikatorCrudView({
  setPage,
  setKriteriaIndikator,
  selectedYear,
}: {
  setPage: (p: import("@/lib/types").Page) => void;
  setKriteriaIndikator: (i: { id: string; nama: string; no: string; tipe: string; nilaiCapaian?: number | null }) => void;
  selectedYear: string;
}) {
  const [search, setSearch] = useState("");
  const [showIndikatorModal, setShowIndikatorModal] = useState(false);
  const [showAspekModal, setShowAspekModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    result?: {
      totalRows: number;
      aspekCreated: number;
      aspekUpdated: number;
      indikatorCreated: number;
      errors: { row: number; message: string }[];
    };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [aspeks, setAspeks] = useState<Aspek[]>([]);
  const [indikators, setIndikators] = useState<Indikator[]>([]);
  
  const [openAspeks, setOpenAspeks] = useState<Record<string, boolean>>({});
  const [editingIndikatorId, setEditingIndikatorId] = useState<string | null>(null);
  const [editingAspekId, setEditingAspekId] = useState<string | null>(null);

  const [formIndikator, setFormIndikator] = useState({
    aspekId: "",
    no: "",
    tipe: "Internal",
    bobot: "",
    nama: "",
    aksesUsers: [] as string[]
  });

  const [dbUsers, setDbUsers] = useState<any[]>([]);

  const [formAspek, setFormAspek] = useState({
    no: "",
    nama: "",
    bobot: ""
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  async function fetchData() {
    setLoading(true);
    try {
      const [resAspek, resIndikator, resUsers] = await Promise.all([
        fetch(`/api/aspek?tahun=${selectedYear}`),
        fetch(`/api/indikator?tahun=${selectedYear}`),
        fetch("/api/users")
      ]);
      
      let fetchedAspeks: Aspek[] = [];
      let fetchedIndikators: Indikator[] = [];
      let fetchedUsers: any[] = [];
      
      if (resAspek.ok) fetchedAspeks = await resAspek.json();
      if (resIndikator.ok) fetchedIndikators = await resIndikator.json();
      if (resUsers.ok) fetchedUsers = await resUsers.json();
      
      setAspeks(fetchedAspeks);
      setIndikators(fetchedIndikators);
      setDbUsers(fetchedUsers);

      // Open all by default
      const initialOpenState: Record<string, boolean> = {};
      fetchedAspeks.forEach(a => { initialOpenState[a.id] = true; });
      setOpenAspeks(initialOpenState);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleAspek(id: string) {
    setOpenAspeks(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // === IMPORT HANDLERS ===
  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const res = await fetch("/api/indikator/template");
      if (!res.ok) throw new Error("Gagal mengunduh template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_import_indikator.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mengunduh template. Coba lagi.");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  function handleOpenImportModal() {
    setImportFile(null);
    setImportResult(null);
    setShowImportModal(true);
  }

  function handleFileSelect(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Format file tidak didukung. Gunakan file .xlsx atau .xls");
      return;
    }
    setImportFile(file);
    setImportResult(null);
  }

  async function handleImportSubmit() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await fetch("/api/indikator/import", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.success) {
        setImportResult({ success: true, message: json.message, result: json.result });
        await fetchData(); // Refresh table
      } else {
        setImportResult({
          success: false,
          message: json.error || "Import gagal",
          result: json.result,
        });
      }
    } catch (err) {
      setImportResult({ success: false, message: "Terjadi kesalahan jaringan. Coba lagi." });
    } finally {
      setImporting(false);
    }
  }

  // === INDIKATOR HANDLERS ===
  function handleEditIndikator(ind: Indikator, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingIndikatorId(ind.id);
    
    // Pastikan super admin selalu punya akses
    const superAdminIds = dbUsers.filter(u => u.role === "Super Admin").map(u => u.id);
    const combinedAkses = Array.from(new Set([...(ind.aksesUsers || []), ...superAdminIds]));

    setFormIndikator({
      aspekId: ind.aspekId,
      no: ind.no,
      tipe: ind.tipe,
      bobot: ind.bobot.toString(),
      nama: ind.nama,
      aksesUsers: combinedAkses
    });
    setShowIndikatorModal(true);
  }

  function handleAddIndikator() {
    setEditingIndikatorId(null);
    
    // Pastikan super admin selalu punya akses saat tambah baru
    const superAdminIds = dbUsers.filter(u => u.role === "Super Admin").map(u => u.id);

    setFormIndikator({
      aspekId: "",
      no: "",
      tipe: "Internal",
      bobot: "",
      nama: "",
      aksesUsers: superAdminIds
    });
    setShowIndikatorModal(true);
  }

  async function handleDeleteIndikator(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus indikator ini?")) return;
    
    try {
      const res = await fetch(`/api/indikator/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIndikators(prev => prev.filter(i => i.id !== id));
      } else {
        alert("Gagal menghapus indikator");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    }
  }

  async function handleSubmitIndikator(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = editingIndikatorId ? `/api/indikator/${editingIndikatorId}` : "/api/indikator";
      const method = editingIndikatorId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formIndikator,
          bobot: Number(formIndikator.bobot),
          aksesUsers: Array.from(new Set([...formIndikator.aksesUsers, ...dbUsers.filter(u => u.role === "Super Admin").map(u => u.id)]))
        })
      });

      if (res.ok) {
        await fetchData(); // Refresh data
        setShowIndikatorModal(false);
      } else {
        alert("Gagal menyimpan indikator");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  }

  function toggleUserAccess(userId: string) {
    setFormIndikator(prev => ({
      ...prev,
      aksesUsers: prev.aksesUsers.includes(userId)
        ? prev.aksesUsers.filter(id => id !== userId)
        : [...prev.aksesUsers, userId]
    }));
  }

  // === ASPEK HANDLERS ===
  function handleEditAspek(a: Aspek, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingAspekId(a.id);
    setFormAspek({
      no: a.no.toString(),
      nama: a.nama,
      bobot: a.bobot.toString()
    });
    setShowAspekModal(true);
  }

  function handleAddAspek() {
    setEditingAspekId(null);
    setFormAspek({
      no: "",
      nama: "",
      bobot: ""
    });
    setShowAspekModal(true);
  }

  async function handleDeleteAspek(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus Aspek ini? Semua Indikator di dalamnya akan ikut terhapus!")) return;
    
    try {
      const res = await fetch(`/api/aspek/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      } else {
        alert("Gagal menghapus aspek");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    }
  }

  async function handleSubmitAspek(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = editingAspekId ? `/api/aspek/${editingAspekId}` : "/api/aspek";
      const method = editingAspekId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formAspek,
          no: Number(formAspek.no),
          bobot: Number(formAspek.bobot)
        })
      });

      if (res.ok) {
        await fetchData(); // Refresh data
        setShowAspekModal(false);
      } else {
        alert("Gagal menyimpan aspek");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  }

  // Data processing
  const filteredIndikators = indikators.filter(i => 
    i.nama.toLowerCase().includes(search.toLowerCase()) || 
    i.no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-gray-900 tracking-wider uppercase">MANAJEMEN INDIKATOR</h2>
          <p className="text-xs text-gray-500 mt-0.5">Kelola data aspek dan indikator penilaian mandiri</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Cari indikator..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-60"
          >
            {downloadingTemplate ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Template Excel
          </button>
          <button
            onClick={handleOpenImportModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-all shadow-sm"
          >
            <Upload size={14} /> Import Excel
          </button>
          <button 
            onClick={handleAddAspek}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm" 
          >
            <Plus size={14} /> Tambah Aspek
          </button>
          <button 
            onClick={handleAddIndikator}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-sm shadow-blue-500/20" 
            style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}
          >
            <Plus size={14} /> Tambah Indikator
          </button>
        </div>
      </div>

      {/* Accordion Table (Penilaian Mandiri Style) */}
      <div className="min-h-[60vh] bg-white text-gray-800 p-6 rounded-xl border border-gray-200 shadow-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                <th className="py-3 px-4 font-normal text-left w-20">No</th>
                <th className="py-3 px-4 font-normal text-left">Nama Indikator</th>
                <th className="py-3 px-4 font-normal text-center w-24">Tipe</th>
                <th className="py-3 px-4 font-normal text-center w-20">Bobot</th>
                <th className="py-3 px-4 font-normal text-center w-28">Hak Akses</th>
                <th className="py-3 px-4 font-normal text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                    <p className="text-gray-400 mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : aspeks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada aspek ditemukan. Silakan tambahkan aspek terlebih dahulu.
                  </td>
                </tr>
              ) : (
                aspeks.map(aspek => {
                  const isOpen = openAspeks[aspek.id];
                  const aspekIndikators = filteredIndikators.filter(i => i.aspekId === aspek.id);
                  
                  // Jika sedang mencari dan tidak ada indikator yang cocok di aspek ini, sembunyikan aspek
                  if (search && aspekIndikators.length === 0 && !aspek.nama.toLowerCase().includes(search.toLowerCase())) {
                    return null;
                  }
                  
                  return (
                    <React.Fragment key={aspek.id}>
                      {/* Aspect Row */}
                      <tr 
                        className="bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 transition-colors border-b border-blue-100"
                        onClick={() => toggleAspek(aspek.id)}
                      >
                        <td colSpan={3} className="py-3 px-4 text-sm text-blue-900 font-semibold">
                          Aspek {aspek.no} {aspek.nama}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-blue-900 font-semibold">
                          {aspek.bobot} %
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOpen ? <ChevronUp size={16} className="mx-auto text-gray-400" /> : <ChevronDown size={16} className="mx-auto text-gray-400" />}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button onClick={(e) => handleEditAspek(aspek, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={(e) => handleDeleteAspek(aspek.id, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Indicator Rows */}
                      {isOpen && aspekIndikators.length === 0 && !search && (
                        <tr className="border-b border-gray-100 bg-white">
                          <td colSpan={6} className="py-4 px-4 text-center text-gray-500 italic">
                            Belum ada indikator di aspek ini
                          </td>
                        </tr>
                      )}
                      
                      {isOpen && aspekIndikators.map((ind) => (
                        <tr key={ind.id} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{ind.no}</td>
                          <td className="py-3.5 px-4 text-gray-800">{ind.nama}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full ${ind.tipe === "Internal" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-purple-50 text-purple-700 border border-purple-100"}`}>
                              {ind.tipe}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-800 font-medium">{ind.bobot} %</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-full">
                              {ind.aksesUsers?.length || 0} User
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setKriteriaIndikator({ id: ind.id, nama: ind.nama, no: ind.no, tipe: ind.tipe, nilaiCapaian: ind.nilaiCapaian });
                                  setPage("kriteria_crud");
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                title="Kelola Kriteria"
                              >
                                <ListChecks size={13} />
                              </button>
                              <button onClick={(e) => handleEditIndikator(ind, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={(e) => handleDeleteIndikator(ind.id, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => { if (!importing) setShowImportModal(false); }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FileSpreadsheet size={16} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Import Indikator dari Excel</h3>
                  <p className="text-[10px] text-gray-400">Upload file .xlsx sesuai template yang tersedia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Download Template CTA */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-blue-700 font-semibold">Belum punya template?</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Download template Excel terlebih dahulu, isi data, lalu upload di sini.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-60"
                >
                  {downloadingTemplate ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  Download
                </button>
              </div>

              {/* Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  isDragOver
                    ? "border-violet-400 bg-violet-50"
                    : importFile
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />
                <div className="flex flex-col items-center gap-3 py-8 px-6">
                  {importFile ? (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileSpreadsheet size={24} className="text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-emerald-700">{importFile.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {(importFile.size / 1024).toFixed(1)} KB — Klik untuk ganti file
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Upload size={22} className="text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600">Seret file ke sini atau klik untuk pilih</p>
                        <p className="text-[11px] text-gray-400 mt-1">Mendukung format .xlsx dan .xls • Maks. 500 baris</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`rounded-xl border p-4 space-y-3 ${
                  importResult.success
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-start gap-2">
                    {importResult.success
                      ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    <p className={`text-xs font-semibold ${
                      importResult.success ? "text-emerald-800" : "text-red-800"
                    }`}>
                      {importResult.message}
                    </p>
                  </div>

                  {importResult.result && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Total Baris", value: importResult.result.totalRows, color: "bg-white border border-gray-200 text-gray-700" },
                        { label: "Indikator Baru", value: importResult.result.indikatorCreated, color: "bg-emerald-100 text-emerald-700" },
                        { label: "Aspek Baru", value: importResult.result.aspekCreated, color: "bg-blue-100 text-blue-700" },
                        { label: "Error", value: importResult.result.errors.length, color: importResult.result.errors.length > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500" },
                      ].map(stat => (
                        <div key={stat.label} className={`rounded-lg p-2 text-center ${stat.color}`}>
                          <p className="text-lg font-bold">{stat.value}</p>
                          <p className="text-[10px] font-medium mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {importResult.result && importResult.result.errors.length > 0 && (
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Detail Error:</p>
                      {importResult.result.errors.map((err, i) => (
                        <div key={i} className="text-[10px] text-red-600 bg-white rounded px-2 py-1 border border-red-100">
                          <span className="font-bold">Baris {err.row}:</span> {err.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
              >
                {importResult?.success ? "Tutup" : "Batal"}
              </button>
              {!importResult?.success && (
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={!importFile || importing}
                  className="px-5 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#5B21B6,#7C3AED)" }}
                >
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {importing ? "Mengimport..." : "Mulai Import"}
                </button>
              )}
              {importResult?.success && (
                <button
                  type="button"
                  onClick={() => { setImportFile(null); setImportResult(null); }}
                  className="px-5 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}
                >
                  <Upload size={14} /> Import Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INDIKATOR MODAL */}
      {showIndikatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowIndikatorModal(false)} />
          
          <form onSubmit={handleSubmitIndikator} className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <h3 className="font-bold text-gray-900">{editingIndikatorId ? "Edit Indikator" : "Tambah Indikator Baru"}</h3>
              <button type="button" onClick={() => setShowIndikatorModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Aspek Terkait</label>
                <select 
                  required
                  value={formIndikator.aspekId}
                  onChange={(e) => setFormIndikator({...formIndikator, aspekId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">Pilih Aspek</option>
                  {aspeks.map(a => (
                    <option key={a.id} value={a.id}>Aspek {a.no} - {a.nama}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="space-y-1.5 w-1/3">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Nomor</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Misal: 1.1" 
                    value={formIndikator.no}
                    onChange={(e) => setFormIndikator({...formIndikator, no: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
                
                <div className="space-y-1.5 w-1/3">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Tipe</label>
                  <select 
                    value={formIndikator.tipe}
                    onChange={(e) => setFormIndikator({...formIndikator, tipe: e.target.value as any})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal</option>
                  </select>
                </div>

                <div className="space-y-1.5 w-1/3">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Bobot (%)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0" 
                    value={formIndikator.bobot}
                    onChange={(e) => setFormIndikator({...formIndikator, bobot: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Nama Indikator</label>
                <textarea 
                  required
                  rows={2} 
                  placeholder="Masukkan deskripsi lengkap indikator..." 
                  value={formIndikator.nama}
                  onChange={(e) => setFormIndikator({...formIndikator, nama: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Hak Akses User */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Beri Hak Akses (User / OPD)</label>
                <p className="text-[10px] text-gray-400 mb-2">Pilih user mana saja yang diizinkan untuk melihat dan mengisi penilaian pada indikator ini.</p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                  {dbUsers.map(user => {
                    const isSuperAdmin = user.role === "Super Admin";
                    const isChecked = isSuperAdmin || formIndikator.aksesUsers.includes(user.id);
                    
                    return (
                      <label key={user.id} className={`flex items-center gap-2 p-2 border border-gray-100 rounded-lg transition-colors ${isSuperAdmin ? "bg-gray-50 opacity-80 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}>
                        <input 
                          type="checkbox" 
                          className={`rounded text-blue-600 focus:ring-blue-500 ${isSuperAdmin ? "cursor-not-allowed" : ""}`}
                          checked={isChecked}
                          disabled={isSuperAdmin}
                          onChange={() => !isSuperAdmin && toggleUserAccess(user.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">{user.nama} {isSuperAdmin && <span className="text-blue-600 ml-1">(Default)</span>}</span>
                          <span className="text-[10px] text-gray-500">{user.instansi} - {user.role}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
              <button type="button" onClick={() => setShowIndikatorModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">
                Batal
              </button>
              <button disabled={saving} type="submit" className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-70" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingIndikatorId ? "Simpan Perubahan" : "Simpan Indikator"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASPEK MODAL */}
      {showAspekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAspekModal(false)} />
          
          <form onSubmit={handleSubmitAspek} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">{editingAspekId ? "Edit Aspek" : "Tambah Aspek Baru"}</h3>
              <button type="button" onClick={() => setShowAspekModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="space-y-1.5 w-1/2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Nomor Aspek</label>
                  <input 
                    required
                    type="number" 
                    placeholder="Misal: 1" 
                    value={formAspek.no}
                    onChange={(e) => setFormAspek({...formAspek, no: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
                
                <div className="space-y-1.5 w-1/2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Bobot Total (%)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="Misal: 25" 
                    value={formAspek.bobot}
                    onChange={(e) => setFormAspek({...formAspek, bobot: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Nama Aspek</label>
                <input 
                  required
                  type="text" 
                  placeholder="Misal: Tata Kelola dan Manajemen" 
                  value={formAspek.nama}
                  onChange={(e) => setFormAspek({...formAspek, nama: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAspekModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">
                Batal
              </button>
              <button disabled={saving} type="submit" className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-70" style={{ background: "linear-gradient(135deg,#1B3A6B,#2E5BA8)" }}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingAspekId ? "Simpan Perubahan" : "Simpan Aspek"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
