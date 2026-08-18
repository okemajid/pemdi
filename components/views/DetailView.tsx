import React, { useState, useEffect } from "react";
import { Upload, Eye, Download, Check, X } from "lucide-react";
import { Indikator, KriteriaLevel, UserItem } from "@/lib/types";
import { MATURITY_LABELS, MATURITY_COLORS } from "@/lib/mock-data";
import { UploadModal } from "@/components/ui/UploadModal";
import { Kematangan } from "@/lib/types";

export function DetailView({ indikator, currentUser }: { indikator: Indikator | null, currentUser?: UserItem | null }) {
  const [uploadKriteria, setUploadKriteria] = useState<{ k: KriteriaLevel; iNama: string } | null>(null);
  const [viewingKriteria, setViewingKriteria] = useState<KriteriaLevel | null>(null);
  const [localKriteria, setLocalKriteria] = useState<KriteriaLevel[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nilaiEksternal, setNilaiEksternal] = useState<string>("");
  const [savingEksternal, setSavingEksternal] = useState(false);

  useEffect(() => {
    if (indikator) {
      setLocalKriteria(indikator.kriteria || []);
      fetchKriteria();
      if (indikator.tipe === "Eksternal") {
        setNilaiEksternal(indikator.nilaiCapaian ? (indikator.nilaiCapaian * 20).toFixed(2) : "0");
      }
    }
  }, [indikator]);

  async function fetchKriteria() {
    if (!indikator) return;
    try {
      const res = await fetch(`/api/kriteria?indikatorId=${indikator.id}`);
      if (res.ok) {
        setLocalKriteria(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAction(kriteriaId: string, action: "verify" | "reject" | "cancel") {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/kriteria/${kriteriaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await fetchKriteria();
      } else {
        alert("Gagal memproses dokumen.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSaveEksternal() {
    setSavingEksternal(true);
    try {
      const numVal = parseFloat(nilaiEksternal);
      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        alert("Masukkan nilai antara 0 - 100");
        setSavingEksternal(false);
        return;
      }
      const res = await fetch(`/api/indikator/${indikator!.id}/nilai`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nilaiEksternal: numVal })
      });
      if (res.ok) {
        alert("Nilai berhasil disimpan. Perubahan akan terlihat setelah Anda memuat ulang halaman atau kembali ke menu sebelumnya.");
      } else {
        alert("Gagal menyimpan nilai");
      }
    } catch {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSavingEksternal(false);
    }
  }

  if (!indikator) return <div className="p-10 text-center text-gray-400">Pilih indikator terlebih dahulu</div>;

  const kriteriaByLevel = localKriteria.reduce((acc, k) => {
    if (!acc[k.level]) acc[k.level] = [];
    acc[k.level].push(k);
    return acc;
  }, {} as Record<number, KriteriaLevel[]>);

  return (
    <div className="min-h-full bg-white text-gray-800 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Info */}
      <div className="bg-white mb-4 text-xs text-gray-700">
        <div className="flex mb-1">
          <div className="w-24 text-gray-500">Indikator</div>
          <div className="w-4 text-center text-gray-400">:</div>
          <div className="flex-1 text-blue-600 font-medium">{indikator.nama}</div>
        </div>
        <div className="flex">
          <div className="w-24 text-gray-500">Deskripsi</div>
          <div className="w-4 text-center text-gray-400">:</div>
          <div className="flex-1 leading-relaxed text-gray-600">
            Kemampuan/kapabilitas dari Instansi Pemerintah dalam menyelenggarakan {indikator.nama.toLowerCase()}...
            <a href="#" className="text-blue-500 ml-1">Show All</a>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-200 my-6"></div>

      <div>
        <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">REKOMENDASI INDIKATOR</h2>
        <p className="text-xs text-gray-400 mb-4">N/A</p>

        {indikator.tipe === "Eksternal" ? (
          <div className="bg-[#2a303c] rounded-xl border border-gray-700 shadow-sm overflow-hidden p-5 text-gray-200" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-[#fff8dc] text-yellow-800 p-4 rounded-md mb-6 border border-yellow-200">
              <p className="font-bold text-sm mb-1">Indikator Eksternal!</p>
              <p className="text-xs">Nilai Indikator akan terisi secara otomatis oleh sistem yang terintegrasi.</p>
            </div>

            <div className="space-y-4 max-w-md text-xs">
              <div className="flex items-center">
                <div className="w-40 text-gray-400">Konversi</div>
                <div className="w-10 text-center">:</div>
                <div className="flex-1 font-semibold text-white">100</div>
              </div>
              <div className="flex items-center">
                <div className="w-40 text-gray-400">Nilai Eksternal (0 - 100)</div>
                <div className="w-10 text-center">:</div>
                <div className="flex-1 font-semibold text-white">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={nilaiEksternal}
                    onChange={(e) => setNilaiEksternal(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-40 text-gray-400">Nilai Final (Skala 1 - 5)</div>
                <div className="w-10 text-center">:</div>
                <div className="flex-1 font-bold text-emerald-400">
                  {nilaiEksternal ? (parseFloat(nilaiEksternal) / 20).toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
            {currentUser?.role !== 'Super Admin' && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveEksternal}
                  disabled={savingEksternal}
                  className="px-5 py-2 flex items-center gap-2 text-xs font-bold text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-70 bg-blue-600"
                >
                  {savingEksternal ? "Menyimpan..." : "Simpan Konversi Nilai"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                  <th className="py-3 px-4 font-semibold text-left w-12">No</th>
                  <th className="py-3 px-4 font-semibold text-left">Data Dukung</th>
                  <th className="py-3 px-4 font-semibold text-center w-32">Status</th>
                  <th className="py-3 px-4 font-semibold text-center w-20">Value</th>
                  <th className="py-3 px-4 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((level) => {
                  const kriteriaList = kriteriaByLevel[level] || [];
                  const levelLabel = MATURITY_LABELS[level as Kematangan] || `Level ${level}`;
                  const levelColor = MATURITY_COLORS[level as Kematangan];
                  const verifiedCount = kriteriaList.filter(k => k.status === 'verified').length;
                  const verifiedBobot = kriteriaList.filter(k => k.status === 'verified').reduce((sum, k) => sum + Number(k.bobot), 0);
                  const totalBobot = kriteriaList.reduce((sum, k) => sum + Number(k.bobot), 0);

                  const displayVerified = (Math.round(verifiedBobot * 10) / 10).toFixed(2);
                  const displayTotal = (Math.round(totalBobot * 10) / 10).toFixed(2);

                  return (
                    <React.Fragment key={level}>
                      {/* Level Header Row */}
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td colSpan={2} className="py-2.5 px-4 text-[11px] font-bold text-gray-700 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-[10px] font-extrabold flex-shrink-0" style={{ background: levelColor }}>{level}</span>
                          {levelLabel}
                        </td>
                        <td className="py-2.5 px-4 text-center text-[11px] font-semibold text-gray-500">
                          PM : {displayVerified} / {displayTotal}
                        </td>
                        <td colSpan={2}></td>
                      </tr>

                      {/* Data Dukung Rows */}
                      {kriteriaList.map((k, idx) => (
                        <tr key={`${level}-${idx}`} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-center text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-4 leading-relaxed pr-8 text-gray-700">{k.deskripsi}</td>
                          <td className="py-3 px-4 text-center">
                            {k.status === 'verified' ? (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Terverifikasi</span>
                            ) : k.status === 'rejected' ? (
                              <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Ditolak</span>
                            ) : k.status === 'uploaded' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Selesai</span>
                            ) : (
                              <span className="bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Belum Upload</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-700">{Number(k.bobot).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              {(k.status === 'uploaded' || k.status === 'verified') && (
                                <>
                                  <button
                                    onClick={() => setViewingKriteria(k)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1.5 transition-colors"
                                    title="Lihat Dokumen"
                                  >
                                    <Eye size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = k.file!;
                                      link.download = k.file!.split('/').pop() || 'dokumen';
                                      link.click();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1.5 transition-colors"
                                    title="Unduh Dokumen"
                                  >
                                    <Download size={12} />
                                  </button>
                                </>
                              )}

                              {/* Super Admin Verification Buttons */}
                              {currentUser?.role === 'Super Admin' && (k.status === 'uploaded' || k.status === 'rejected') && (
                                <button
                                  onClick={() => handleAction(k.id!, "verify")}
                                  className="bg-blue-500 hover:bg-blue-600 text-white rounded p-1.5 transition-colors"
                                  title="Verifikasi Dokumen"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              {currentUser?.role === 'Super Admin' && (k.status === 'uploaded' || k.status === 'verified') && (
                                <button
                                  onClick={() => handleAction(k.id!, "reject")}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded p-1.5 transition-colors"
                                  title="Tolak / Revisi Dokumen"
                                >
                                  <X size={12} />
                                </button>
                              )}
                              {currentUser?.role === 'Super Admin' && (k.status === 'verified' || k.status === 'rejected') && (
                                <button
                                  onClick={() => handleAction(k.id!, "cancel")}
                                  className="bg-gray-500 hover:bg-gray-600 text-white rounded p-1.5 transition-colors"
                                  title="Batalkan Aksi (Kembali ke Uploaded)"
                                >
                                  <Upload size={12} />
                                </button>
                              )}

                              {currentUser?.role !== 'Super Admin' && k.status !== 'verified' && (
                                <button
                                  onClick={() => setUploadKriteria({ k, iNama: indikator.nama })}
                                  className="bg-amber-500 hover:bg-amber-600 text-white rounded p-1.5 transition-colors"
                                  title={k.status === 'uploaded' ? "Timpa Data Dukung" : "Upload Data Dukung"}
                                >
                                  <Upload size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Empty state */}
                      {kriteriaList.length === 0 && (
                        <tr className="border-b border-gray-100 bg-white">
                          <td colSpan={5} className="py-3 px-4 text-center text-gray-400 italic">Tidak ada kriteria</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {uploadKriteria && (
        <UploadModal
          kriteria={uploadKriteria.k}
          indikatorNama={uploadKriteria.iNama}
          onClose={() => setUploadKriteria(null)}
          onSuccess={() => {
            setUploadKriteria(null);
            fetchKriteria();
          }}
        />
      )}

      {viewingKriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingKriteria(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2E5BA8 100%)" }}>
              <div className="flex items-center gap-3 text-white">
                <h3 className="font-bold text-sm tracking-wide">Lihat Bukti Dukung</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold border border-white/20">
                  Level {viewingKriteria.level}
                </span>
              </div>
              <button onClick={() => setViewingKriteria(null)} className="text-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="flex-1 bg-gray-100 border-r border-gray-200 overflow-hidden relative min-h-[500px]">
                {viewingKriteria.file ? (
                  viewingKriteria.file.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={viewingKriteria.file} className="w-full h-full border-0 absolute inset-0" title="Dokumen Kriteria"></iframe>
                  ) : viewingKriteria.file.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img src={viewingKriteria.file} className="w-full h-full object-contain absolute inset-0" alt="Dokumen Kriteria" />
                  ) : viewingKriteria.file.match(/\.(doc|docx|xls|xlsx)$/i) ? (
                    <iframe 
                      src={`/api/preview?file=${encodeURIComponent(viewingKriteria.file)}`} 
                      className="w-full h-full border-0 absolute inset-0 bg-white" 
                      title="Dokumen Kriteria"
                    ></iframe>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 p-6 text-center absolute inset-0">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Pratinjau Tidak Tersedia</p>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-6">
                        File dengan format ini tidak dapat ditampilkan langsung di browser.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">File tidak tersedia</div>
                )}
              </div>
              <div className="w-full md:w-80 bg-white p-6 flex flex-col overflow-y-auto">
                <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-4">Informasi Kriteria</h4>

                <div className="space-y-5 flex-1">
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-1 leading-snug">{viewingKriteria.label}</p>
                    <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">{viewingKriteria.deskripsi}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      Keterangan Upload
                    </p>
                    <p className="text-[11px] bg-blue-50/50 p-3 rounded-lg border border-blue-100 italic text-blue-900 leading-relaxed whitespace-pre-wrap">
                      {viewingKriteria.catatan || "Tidak ada keterangan yang diberikan saat upload."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingKriteria.file!;
                      link.download = viewingKriteria.file!.split('/').pop() || 'dokumen';
                      link.click();
                    }}
                    className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-2.5 transition-all font-bold flex items-center justify-center gap-2 text-xs shadow-sm"
                  >
                    <Download size={14} /> Unduh Dokumen Asli
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
