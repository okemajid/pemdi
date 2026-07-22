import React from "react";
import { Info, Mail, Phone, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import { Page } from "@/lib/types";

export function TentangAplikasiView({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl mb-4">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      </div>
      <div className="w-full max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PEMDI</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-6">Sistem Penilaian Mandiri Pemerintah Digital Indonesia</p>
          
          <p className="text-gray-600 leading-relaxed mb-8">
            PEMDI adalah platform resmi yang dikembangkan untuk memfasilitasi instansi pemerintah daerah di seluruh Indonesia dalam mengukur, mengevaluasi, dan meningkatkan maturitas penyelenggaraan pemerintahan digital secara mandiri.
          </p>

          <div className="flex gap-4 mb-8">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">Versi 1.0.0</span>
            <span className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-full border border-gray-200">Rilis: Juli 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={16} className="text-blue-600" /> Visi & Misi
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Sistem ini bertujuan untuk memberikan kemudahan bagi setiap Organisasi Perangkat Daerah (OPD) dalam melaporkan bukti dukung secara terstruktur dan terukur.
          </p>
          <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li>Meningkatkan transparansi penilaian.</li>
            <li>Mempercepat transformasi digital daerah.</li>
            <li>Mendukung integrasi Sistem Pemerintahan Berbasis Elektronik (SPBE).</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={16} className="text-blue-600" /> Informasi Kontak
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Kementerian Dalam Negeri RI</p>
                <p className="text-xs text-gray-500">Jl. Medan Merdeka Utara No. 7, Jakarta Pusat 10110</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">pusdatin@kemendagri.go.id</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">(021) 3450038</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pb-8">
        <p className="text-xs text-gray-400">
          Hak Cipta © 2026 Kementerian Dalam Negeri Republik Indonesia.<br />Seluruh hak cipta dilindungi undang-undang.
        </p>
      </div>
      </div>
    </div>
  );
}
