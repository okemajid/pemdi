import React, { useState, useEffect } from "react";
import { Upload, Settings, Eye, Download, Loader2 } from "lucide-react";
import { Indikator, KriteriaLevel } from "@/lib/types";
import { MATURITY_LABELS } from "@/lib/mock-data";
import { UploadModal } from "@/components/ui/UploadModal";

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
    <div className="min-h-full bg-[#1a1d24] text-gray-300 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Info */}
      <div className="bg-[#1a1d24] mb-4 text-xs text-gray-300">
        <div className="flex mb-1">
          <div className="w-24">Indikator</div>
          <div className="w-4 text-center">:</div>
          <div className="flex-1 text-blue-400 font-medium">{indikator.nama}</div>
        </div>
        <div className="flex">
          <div className="w-24">Deskripsi</div>
          <div className="w-4 text-center">:</div>
          <div className="flex-1 leading-relaxed">
            Kemampuan/kapabilitas dari Instansi Pemerintah dalam menyelenggarakan {indikator.nama.toLowerCase()}...
            <a href="#" className="text-blue-500 ml-1">Show All</a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dashed border-gray-600 my-6"></div>

      <div className="bg-[#1a1d24]">
        <h2 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">REKOMENDASI INDIKATOR</h2>
        <p className="text-xs text-gray-500 mb-4">N/A</p>

        <div className="bg-[#242832] rounded border border-gray-700 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 bg-[#2a2f3a] text-gray-400">
                <th className="py-3 px-4 font-normal text-left w-12">No</th>
                <th className="py-3 px-4 font-normal text-left">Data Dukung</th>
                <th className="py-3 px-4 font-normal text-center w-32">Status</th>
                <th className="py-3 px-4 font-normal text-center w-20">Value</th>
                <th className="py-3 px-4 font-normal text-center w-28">#</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((level) => {
                const kriteriaList = kriteriaByLevel[level] || [];
                const levelLabel = MATURITY_LABELS[level as keyof typeof MATURITY_LABELS] || `Level ${level}`;
                
                return (
                  <React.Fragment key={level}>
                    {/* Level Header Row */}
                    <tr className="bg-[#363b47]">
                      <td colSpan={2} className="py-2 px-4 text-[11px] text-gray-300">{levelLabel}</td>
                      <td className="py-2 px-4 text-center text-[11px] text-gray-300">
                        PM : {kriteriaList.filter(k => k.status === 'uploaded').length} / {kriteriaList.length}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                    
                    {/* Data Dukung Rows */}
                    {kriteriaList.map((k, idx) => (
                      <tr key={`${level}-${idx}`} className="border-b border-[#2a2f3a] bg-[#2d323e] hover:bg-[#363c4a] transition-colors">
                        <td className="py-3 px-4 text-center">{idx + 1}</td>
                        <td className="py-3 px-4 leading-relaxed pr-8">{k.deskripsi}</td>
                        <td className="py-3 px-4 text-center">
                          {k.status === 'uploaded' ? (
                            <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded">Selesai</span>
                          ) : (
                            <span className="bg-red-900/60 text-red-400 border border-red-800 text-[10px] px-2 py-1 rounded">Belum Upload</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">{k.bobot}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            {k.status === 'uploaded' && (
                              <>
                                <button onClick={() => window.open(k.file, '_blank')} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded p-1.5 transition-colors" title="Lihat">
                                  <Eye size={12} />
                                </button>
                                <button onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = k.file!;
                                  link.download = k.file!.split('/').pop() || 'dokumen';
                                  link.click();
                                }} className="bg-blue-600 hover:bg-blue-500 text-white rounded p-1.5 transition-colors" title="Download">
                                  <Download size={12} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setUploadKriteria({ k, iNama: indikator.nama })}
                              className="bg-amber-500 hover:bg-amber-400 text-white rounded p-1.5 transition-colors" title={k.status === 'uploaded' ? "Timpa Data Dukung" : "Upload Data Dukung"}
                            >
                              <Upload size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Empty state if no data dukung for this level */}
                    {kriteriaList.length === 0 && (
                      <tr className="border-b border-[#2a2f3a] bg-[#2d323e]">
                        <td colSpan={5} className="py-3 px-4 text-center text-gray-500 italic">Tidak ada kriteria</td>
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
