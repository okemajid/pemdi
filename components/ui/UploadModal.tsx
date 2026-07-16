import { useState, useRef } from "react";
import { X, FilePlus2, FileText, Upload, Loader2 } from "lucide-react";
import { KriteriaLevel } from "@/lib/types";
import { MATURITY_COLORS } from "@/lib/mock-data";

export function UploadModal({ kriteria, indikatorNama, onClose, onSuccess }: { kriteria: KriteriaLevel; indikatorNama: string; onClose: () => void; onSuccess?: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingFile, setExistingFile] = useState<string | null>(kriteria.file || null);
  const [dragging, setDragging] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("indikatorId", kriteria.indikatorId || "unknown");

      const res = await fetch(`/api/kriteria/${kriteria.id}/upload`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        alert("Gagal mengupload dokumen");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2E5BA8 100%)" }} className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Upload Bukti Dukung</p>
              <h3 className="text-white font-bold text-sm mt-1 leading-snug">{indikatorNama}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: MATURITY_COLORS[kriteria.level] }}>
                  Level {kriteria.level} — {kriteria.label}
                </span>
                <span className="text-white/60 text-[11px]">Bobot: {(kriteria.bobot * 100).toFixed(0)}%</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 leading-relaxed">
            <p className="font-semibold mb-1">Kriteria Level {kriteria.level}:</p>
            <p>{kriteria.deskripsi}</p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFiles([f]); setExistingFile(null); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFiles([f]); setExistingFile(null); } }} />
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FilePlus2 size={20} className="text-blue-600" />
            </div>
            <p className="font-semibold text-sm text-gray-700">Seret file atau klik untuk memilih</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLSX, JPG, PNG — Maks. 10 MB</p>
          </div>

          {existingFile && files.length === 0 && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
              <FileText size={14} className="text-green-600 flex-shrink-0" />
              <span className="text-xs text-gray-700 flex-1 truncate">Dokumen saat ini: {existingFile.split('/').pop()}</span>
            </div>
          )}

          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
              <FileText size={14} className="text-blue-600 flex-shrink-0" />
              <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
              <button onClick={() => setFiles([])} className="text-gray-300 hover:text-red-400"><X size={13} /></button>
            </div>
          ))}

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Keterangan</label>
            <textarea rows={2} value={catatan} onChange={e => setCatatan(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
              placeholder="Jelaskan relevansi dokumen dengan kriteria penilaian..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={files.length === 0 || submitting} 
              className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2" 
              style={{ background: "linear-gradient(135deg, #1B3A6B, #2E5BA8)" }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
              {submitting ? "Menyimpan..." : "Kirim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
