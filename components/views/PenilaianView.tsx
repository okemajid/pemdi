import React, { useState, useEffect } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Page, Indikator, Aspek } from "@/lib/types";

export function PenilaianView({ setPage, setDetailIndikator, currentUser }: { setPage: (p: Page) => void; setDetailIndikator: (i: Indikator) => void; currentUser: any }) {
  const [openAspeks, setOpenAspeks] = useState<Record<string, boolean>>({});
  const [aspeksData, setAspeksData] = useState<Aspek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = currentUser.role === "Super Admin" ? "/api/indikator" : `/api/indikator?userId=${currentUser.id}`;
        
        const [resAspek, resIndikator] = await Promise.all([
          fetch("/api/aspek"),
          fetch(url)
        ]);

        if (resAspek.ok && resIndikator.ok) {
          const aspeks: Aspek[] = await resAspek.json();
          const indikators: Indikator[] = await resIndikator.json();
          
          // Group indikators by aspect
          aspeks.forEach(a => {
            a.indikators = indikators.filter(i => i.aspekId === a.id).map(i => ({
              ...i,
              kriteria: (i as any).kriteria || []
            }));
          });

          // Only keep aspects that have indicators (or keep all if Super Admin)
          const filteredAspeks = aspeks.filter(a => a.indikators.length > 0 || currentUser.role === "Super Admin");
          setAspeksData(filteredAspeks);

          // Open all by default
          const initialOpenState: Record<string, boolean> = {};
          filteredAspeks.forEach(a => { initialOpenState[a.id] = true; });
          setOpenAspeks(initialOpenState);
        }
      } catch (error) {
        console.error("Failed to fetch penilaian data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function toggleAspek(id: string) {
    setOpenAspeks(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleDetail(indikator: Indikator) {
    setDetailIndikator(indikator);
    setPage("detail");
  }

  if (loading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white text-gray-800 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-gray-50 rounded-t border-b-2 border-blue-600">
        <div className="flex px-4 py-3 text-xs font-bold text-gray-700">
          <div className="w-1/4">Instansi</div>
          <div className="w-1/2">: {currentUser.instansi}</div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 border-t-0 shadow-sm rounded-b-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-800">ASPEK PENILAIAN</h2>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
              <th className="py-3 px-4 font-normal text-left w-16">No</th>
              <th className="py-3 px-4 font-normal text-left">Indikator</th>
              <th className="py-3 px-4 font-normal text-center w-24">Tipe</th>
              <th className="py-3 px-4 font-normal text-center w-20">Bobot</th>
              <th className="py-3 px-4 font-normal text-center w-40">Progres Upload</th>
              <th className="py-3 px-4 font-normal text-center w-40">#</th>
            </tr>
          </thead>
          <tbody>
            {aspeksData.map(aspek => {
              const isOpen = openAspeks[aspek.id];
              
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
                    <td colSpan={2} className="py-3 px-4 text-right">
                    </td>
                  </tr>

                  {/* Indicator Rows */}
                  {isOpen && aspek.indikators.length === 0 && (
                    <tr className="border-b border-gray-100 bg-white">
                      <td colSpan={6} className="py-4 px-4 text-center text-gray-500 italic">
                        Anda tidak memiliki hak akses ke indikator manapun di aspek ini.
                      </td>
                    </tr>
                  )}
                  {isOpen && aspek.indikators.map((ind, idx) => {
                    const totalDataDukung = ind.kriteria?.length || 0;
                    const doneDataDukung = ind.kriteria?.filter(k => k.status === "uploaded").length || 0;
                    
                    return (
                      <tr key={ind.id} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-gray-600">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-800">{ind.nama}</td>
                        <td className="py-3.5 px-4 text-center text-gray-600">{ind.tipe}</td>
                        <td className="py-3.5 px-4 text-center text-gray-800 font-medium">{ind.bobot} %</td>
                        <td className="py-3.5 px-4 text-center text-gray-600">
                          {doneDataDukung} / {totalDataDukung} Data Dukung
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDetail(ind)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1.5 flex items-center justify-center gap-1 mx-auto transition-colors"
                            title="Tingkat Kematangan"
                          >
                            <Settings size={12} />
                            <span className="text-[10px] border-l border-white/30 pl-1 ml-0.5">5 | TK</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
            
            {aspeksData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center text-gray-500">
                  Tidak ada data penilaian yang tersedia untuk Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
