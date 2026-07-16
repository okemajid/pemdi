import { LayoutDashboard, ClipboardList, Users, Shield, Building2, LogOut, BarChart3, ShieldCheck, Menu, ListTree, Activity } from "lucide-react";
import { Page } from "@/lib/types";
import { SESSION } from "@/lib/mock-data";

export function Sidebar({ page, setPage, collapsed, setCollapsed }: { page: Page; setPage: (p: Page) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const nav = [
    { key: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { key: "penilaian" as Page, label: "Penilaian Mandiri", icon: ClipboardList },
    { key: "laporan" as Page, label: "Analisis Capaian", icon: BarChart3 },
    { key: "users" as Page, label: "Manajemen Pengguna", icon: Users },
    { key: "roles" as Page, label: "Manajemen Role", icon: Shield },
  ];

  if (SESSION.role === "Super Admin") {
    nav.splice(2, 0, { key: "indikator_crud" as Page, label: "Manajemen Indikator", icon: ListTree });
    nav.push({ key: "log_activity" as Page, label: "Log Aktivitas", icon: Activity });
  }

  return (
    <aside className="flex flex-col h-full flex-shrink-0 transition-all duration-300 border-r" style={{ width: collapsed ? 60 : 228, background: "#0d1f40", borderColor: "rgba(255,255,255,0.07)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
          <ShieldCheck size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-extrabold text-sm leading-none tracking-wide">PEMDI</p>
            <p className="text-white/40 text-[9px] mt-0.5 leading-none font-medium uppercase tracking-wider"> Pemerintahan Digital</p>
          </div>
        )}
      </div>

      {/* OPD info */}
      {!collapsed && (
        <div className="mx-3 my-2.5 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Instansi</p>
          <p className="text-white/90 text-[11px] font-semibold leading-tight mt-0.5 truncate">{SESSION.instansi}</p>
          <p className="text-white/40 text-[9px] mt-0.5">{SESSION.kode} · {SESSION.kategori}</p>
        </div>
      )}

      <nav className="flex-1 py-2 overflow-y-auto">
        {nav.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setPage(key)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 mb-0.5 text-left transition-all relative ${page === key ? "text-white" : "text-white/45 hover:text-white/75"}`}
            style={page === key ? { background: "rgba(255,255,255,0.1)" } : {}}
          >
            {page === key && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-red-400" />}
            <Icon size={15} className="flex-shrink-0" />
            {!collapsed && <span className="text-[12px] font-medium">{label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#C0392B,#E74C3C)" }}>
              {SESSION.nama.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold truncate">{SESSION.nama}</p>
              <p className="text-white/40 text-[9px] truncate">{SESSION.role}</p>
            </div>
            <button onClick={() => setPage("landing")} className="text-white/30 hover:text-white/60 transition-colors"><LogOut size={13} /></button>
          </div>
        ) : (
          <button onClick={() => setPage("landing")} className="w-full flex justify-center text-white/30 hover:text-white/60"><LogOut size={14} /></button>
        )}
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="py-2 border-t flex items-center justify-center text-white/20 hover:text-white/40 transition-colors" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Menu size={14} />
      </button>
    </aside>
  );
}
