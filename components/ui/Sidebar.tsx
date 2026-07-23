import { LayoutDashboard, ClipboardList, Users, Shield, LogOut, BarChart3, ShieldCheck, Menu, ListTree, Activity, Info } from "lucide-react";
import { Page } from "@/lib/types";

interface CurrentUser {
  nama: string;
  role: string;
  instansi: string;
  kode?: string;
  kategori?: string;
  permissions?: string[];
}

export function Sidebar({ page, setPage, collapsed, setCollapsed, currentUser }: { page: Page; setPage: (p: Page) => void; collapsed: boolean; setCollapsed: (v: boolean) => void; currentUser: CurrentUser }) {
  function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
      setPage("login");
    }
  }

  const isSuperAdmin = currentUser.role === "Super Admin";
  const perms = currentUser.permissions || [];
  const has = (p: string) => isSuperAdmin || perms.includes(p);

  const nav: { key: Page; label: string; icon: any }[] = [
    { key: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  ];

  // Penilaian - visible if user has Input Penilaian or Upload Dokumen
  if (has("Input Penilaian") || has("Upload Dokumen")) {
    nav.push({ key: "penilaian" as Page, label: "Penilaian Mandiri", icon: ClipboardList });
  }

  // Manajemen Indikator - only Super Admin or Kelola Indikator
  if (has("Kelola Indikator")) {
    nav.push({ key: "indikator_crud" as Page, label: "Manajemen Indikator", icon: ListTree });
  }

  // Laporan - visible if user has Lihat Laporan
  if (has("Lihat Laporan")) {
    nav.push({ key: "laporan" as Page, label: "Analisis Capaian", icon: BarChart3 });
  }

  // Manajemen Pengguna - only Super Admin or Kelola Pengguna or Kelola Pengguna OPD
  if (has("Kelola Pengguna") || has("Kelola Pengguna OPD")) {
    nav.push({ key: "users" as Page, label: "Manajemen Pengguna", icon: Users });
  }

  // Manajemen Role - only Super Admin or Konfigurasi Sistem
  if (has("Konfigurasi Sistem")) {
    nav.push({ key: "roles" as Page, label: "Manajemen Role", icon: Shield });
  }

  // Log Aktivitas - only Super Admin
  if (isSuperAdmin) {
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
          <p className="text-white/90 text-[11px] font-semibold leading-tight mt-0.5 truncate">{currentUser.instansi}</p>
          <p className="text-white/40 text-[9px] mt-0.5">{currentUser.role}</p>
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
              {currentUser.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold truncate">{currentUser.nama}</p>
              <p className="text-white/40 text-[9px] truncate">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"><LogOut size={13} /></button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-white/40 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"><LogOut size={14} /></button>
        )}
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="py-2 border-t flex items-center justify-center text-white/20 hover:text-white/40 transition-colors" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Menu size={14} />
      </button>
    </aside>
  );
}
