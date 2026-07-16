import React, { useState, useEffect } from "react";
import { Upload, Eye, Download } from "lucide-react";
import { Indikator, KriteriaLevel } from "@/lib/types";
import { MATURITY_LABELS, MATURITY_COLORS } from "@/lib/mock-data";
import { UploadModal } from "@/components/ui/UploadModal";
import { Maturitas } from "@/lib/types";

export function DetailView({ indikator }: { indikator: Indikator | null }) {
  const [uploadKriteria, setUploadKriteria] = useState<{ k: KriteriaLevel; iNama: string } | null>(null);
  const [localKriteria, setLocalKriteria] = useState<KriteriaLevel[]>([]);

  useEffect(() => {
    if (indikator) {
      setLocalKriteria(indikator.kriteria || []);
      fetchKriteria();
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
                const levelLabel = MATURITY_LABELS[level as Maturitas] || `Level ${level}`;
                const levelColor = MATURITY_COLORS[level as Maturitas];
                const uploaded = kriteriaList.filter(k => k.status === 'uploaded').length;

                return (
                  <React.Fragment key={level}>
                    {/* Level Header Row */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={2} className="py-2.5 px-4 text-[11px] font-bold text-gray-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-[10px] font-extrabold flex-shrink-0" style={{ background: levelColor }}>{level}</span>
                        {levelLabel}
                      </td>
                      <td className="py-2.5 px-4 text-center text-[11px] font-semibold text-gray-500">
                        PM : {uploaded} / {kriteriaList.length}
                      </td>
                      <td colSpan={2}></td>
                    </tr>

                    {/* Data Dukung Rows */}
                    {kriteriaList.map((k, idx) => (
                      <tr key={`${level}-${idx}`} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4 leading-relaxed pr-8 text-gray-700">{k.deskripsi}</td>
                        <td className="py-3 px-4 text-center">
                          {k.status === 'uploaded' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Selesai</span>
                          ) : (
                            <span className="bg-red-50 text-red-500 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full">Belum Upload</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700">{k.bobot}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            {k.status === 'uploaded' && (
                              <>
                                <button
                                  onClick={() => window.open(k.file, '_blank')}
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
                            <button
                              onClick={() => setUploadKriteria({ k, iNama: indikator.nama })}
                              className="bg-amber-500 hover:bg-amber-600 text-white rounded p-1.5 transition-colors"
                              title={k.status === 'uploaded' ? "Timpa Data Dukung" : "Upload Data Dukung"}
                            >
                              <Upload size={12} />
                            </button>
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
    </div>
  );
}
