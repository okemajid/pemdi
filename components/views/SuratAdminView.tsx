import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Download, FileText, X, AlertCircle } from "lucide-react";
import { SuratTemplate } from "@/lib/types";

export function SuratAdminView() {
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SuratTemplate | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    tipeDokumen: "Umum",
    file: null as File | null
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/surat-template");
      const result = await res.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template: SuratTemplate | null = null) => {
    setErrorMsg("");
    setEditingTemplate(template);
    if (template) {
      setFormData({
        nama: template.nama,
        deskripsi: template.deskripsi || "",
        tipeDokumen: template.tipeDokumen || "Umum",
        file: null
      });
    } else {
      setFormData({
        nama: "",
        deskripsi: "",
        tipeDokumen: "Umum",
        file: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg("");

    try {
      if (editingTemplate) {
        const data = new FormData();
        data.append("nama", formData.nama);
        data.append("deskripsi", formData.deskripsi);
        data.append("tipeDokumen", formData.tipeDokumen);
        if (formData.file) {
          data.append("file", formData.file);
        }

        const res = await fetch(`/api/surat-template/${editingTemplate.id}`, {
          method: "PATCH",
          body: data,
        });
        const result = await res.json();
        if (result.success) {
          await fetchTemplates();
          handleCloseModal();
        } else {
          setErrorMsg(result.error || "Gagal mengupdate template");
        }
      } else {
        // Create (FormData for file upload)
        if (!formData.file) {
          setErrorMsg("File wajib diunggah untuk template baru");
          setFormLoading(false);
          return;
        }

        const data = new FormData();
        data.append("nama", formData.nama);
        data.append("deskripsi", formData.deskripsi);
        data.append("tipeDokumen", formData.tipeDokumen);
        data.append("file", formData.file);

        const res = await fetch("/api/surat-template", {
          method: "POST",
          body: data,
        });
        
        const result = await res.json();
        if (result.success) {
          await fetchTemplates();
          handleCloseModal();
        } else {
          setErrorMsg(result.error || "Gagal membuat template");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus template ini? File fisik juga akan dihapus.")) {
      try {
        const res = await fetch(`/api/surat-template/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          await fetchTemplates();
        } else {
          alert(result.error || "Gagal menghapus template");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat menghapus");
      }
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.deskripsi && t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Template Surat</h2>
          <p className="text-sm text-gray-500">Kelola dokumen dan template surat yang dapat diunduh publik.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Template
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Nama Template</th>
                <th className="px-6 py-3 font-semibold">Deskripsi</th>
                <th className="px-6 py-3 font-semibold">Tipe</th>
                <th className="px-6 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Tidak ada template ditemukan.</td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{template.nama}</div>
                          <div className="text-xs text-gray-500 truncate w-48" title={template.filePath}>{template.filePath}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {template.deskripsi || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                        {template.tipeDokumen}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <a 
                          href={template.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Unduh/Lihat"
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          onClick={() => handleOpenModal(template)}
                          className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTemplate ? "Edit Template" : "Tambah Template Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-start gap-2 text-sm border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Template *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Contoh: Format Surat Tugas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Deskripsi singkat mengenai template ini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Dokumen</label>
                  <select
                    value={formData.tipeDokumen}
                    onChange={(e) => setFormData({...formData, tipeDokumen: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Peraturan">Peraturan</option>
                    <option value="Surat Edaran">Surat Edaran</option>
                    <option value="Buku Panduan">Buku Panduan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    File Template {editingTemplate ? "(Opsional)" : "*"}
                  </label>
                  <input
                    type="file"
                    required={!editingTemplate}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {editingTemplate 
                      ? "Maks. 5MB. Unggah file baru hanya jika Anda ingin mengganti file yang ada." 
                      : "Maks. 5MB (PDF, DOC, DOCX, XLS, XLSX)"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading ? "Menyimpan..." : "Simpan Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
