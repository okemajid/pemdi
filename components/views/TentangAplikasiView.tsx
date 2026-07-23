import React, { useState } from "react";
import { Info, Mail, Phone, MapPin, ShieldCheck, ArrowLeft, Target, Globe, Server, CheckCircle2, ChevronDown, Award, Users } from "lucide-react";
import { Page } from "@/lib/types";

export function TentangAplikasiView({ setPage }: { setPage: (p: Page) => void }) {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const features = [
    {
      title: "Penilaian Transparan & Objektif",
      desc: "Menyediakan instrumen penilaian mandiri yang terstruktur berdasarkan indikator baku nasional, memastikan setiap daerah dievaluasi dengan standar yang sama.",
      icon: Target
    },
    {
      title: "Terintegrasi Secara Nasional",
      desc: "Mendukung ekosistem Sistem Pemerintahan Berbasis Elektronik (SPBE) yang terpusat dan saling terhubung antar instansi daerah dan pusat.",
      icon: Globe
    },
    {
      title: "Keamanan Data Terjamin",
      desc: "Menggunakan standar enkripsi terkini untuk melindungi data dan dokumen bukti dukung yang diunggah oleh setiap Organisasi Perangkat Daerah (OPD).",
      icon: Server
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Navbar/Header */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ background: "rgba(13,31,64,0.95)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setPage("landing")} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              <ShieldCheck size={16} className="text-white" />
            </div>
            <p className="text-white font-extrabold text-sm tracking-widest uppercase">Tentang PEMDI</p>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1f40 0%, #1B3A6B 50%, #1a3a6b 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #E74C3C 0%, transparent 40%), radial-gradient(circle at 20% 80%, #2E86C1 0%, transparent 40%)" }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Sistem Informasi <span style={{ background: "linear-gradient(90deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PEMDI</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Platform Penilaian Mandiri Pemerintah Digital Indonesia. Dirancang khusus untuk memfasilitasi transformasi digital pemerintah daerah secara terukur, transparan, dan terintegrasi.
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold flex items-center gap-2">
              <Award size={16} className="text-blue-400" /> Versi Rilis 1.0.0
            </div>
            <div className="px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold flex items-center gap-2">
              <Users size={16} className="text-emerald-400" /> Diperbarui: Juli 2026
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Vision & Interactive Accordion */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Mengapa PEMDI Diciptakan?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Sistem ini bertujuan untuk memberikan kemudahan bagi setiap Organisasi Perangkat Daerah (OPD) dalam melaporkan bukti dukung secara terstruktur dan terukur. Kami percaya bahwa digitalisasi yang baik berawal dari pengukuran kematangan yang presisi.
              </p>
            </div>

            {/* Interactive Accordion */}
            <div className="space-y-3">
              {features.map((feat, idx) => {
                const isActive = activeAccordion === idx;
                const Icon = feat.icon;
                return (
                  <div 
                    key={idx} 
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'border-blue-500 bg-white shadow-md' : 'border-gray-200 bg-white/50 hover:bg-white'}`}
                  >
                    <button 
                      onClick={() => setActiveAccordion(isActive ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={18} />
                        </div>
                        <span className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{feat.title}</span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isActive ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out`}
                      style={{ maxHeight: isActive ? 150 : 0, opacity: isActive ? 1 : 0 }}
                    >
                      <div className="px-6 pb-5 pt-0 pl-[72px]">
                        <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Contact & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <Info size={18} className="text-blue-600" /> Pusat Bantuan & Kontak
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Dinas Komunikasi dan Informatika</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Pemerintah Kabupaten Ciamis<br/>Jl. Jenderal Sudirman No. 16<br/>Ciamis, Jawa Barat 46211</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Dukungan Teknis / Email</p>
                    <p className="text-sm font-bold text-gray-900">diskominfo@ciamiskab.go.id</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Layanan Telepon</p>
                    <p className="text-sm font-bold text-gray-900">(021) 3450038</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck size={100} />
              </div>
              <div className="relative z-10">
                <h4 className="font-extrabold text-lg mb-2">Akses Cepat</h4>
                <p className="text-white/60 text-xs mb-6 leading-relaxed">Punya pertanyaan seputar cara penggunaan sistem? Pelajari selengkapnya melalui buku panduan interaktif.</p>
                <button onClick={() => setPage("panduan")} className="w-full py-3 bg-white text-blue-900 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                  Buka Panduan Sistem
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">© 2026 Kementerian Dalam Negeri Republik Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <CheckCircle2 size={14} className="text-emerald-500" /> Sistem Berjalan Normal
          </div>
        </div>
      </footer>
    </div>
  );
}
