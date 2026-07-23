"use client";

import { useState, useEffect } from "react";
import { Page, Indikator } from "@/lib/types";
import { SESSION } from "@/lib/mock-data";

import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { LandingPage } from "@/components/views/LandingPage";
import { LoginPage } from "@/components/views/LoginPage";
import { DashboardView } from "@/components/views/DashboardView";
import { PenilaianView } from "@/components/views/PenilaianView";
import { DetailView } from "@/components/views/DetailView";
import { UsersView } from "@/components/views/UsersView";
import { RolesView } from "@/components/views/RolesView";
import { LaporanView } from "@/components/views/LaporanView";
import { InstansiView } from "@/components/views/InstansiView";
import { IndikatorCrudView } from "@/components/views/IndikatorCrudView";
import { KriteriaCrudView } from "@/components/views/KriteriaCrudView";
import { LogActivityView } from "@/components/views/LogActivityView";
import { TentangAplikasiView } from "@/components/views/TentangAplikasiView";

import { PanduanView } from "@/components/views/PanduanView";

const SESSION_KEY = "pemdi_session";
const SESSION_TTL_MS = 60 * 60 * 1000; // 60 menit

function getStoredPage(): Page {
  if (typeof window === "undefined") return "landing";
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return "landing";
    const { page, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("logged_in_user");
      sessionStorage.removeItem("original_admin_user");
      return "login";
    }
    // Update timestamp on reload
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ page, timestamp: Date.now() }));
    return page as Page;
  } catch {
    return "landing";
  }
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [page, setPageState] = useState<Page>("landing");
  const [collapsed, setCollapsed] = useState(false);
  const [detailIndikator, setDetailIndikator] = useState<Indikator | null>(null);
  const [kriteriaIndikator, setKriteriaIndikator] = useState<{ id: string; nama: string; no: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(SESSION);
  const [originalAdminUser, setOriginalAdminUser] = useState<any>(null);

  // Restore session on first render (client-side only)
  useEffect(() => {
    setMounted(true);
    const stored = getStoredPage();
    if (stored !== "landing") {
      setPageState(stored);
    }
    const storedUser = sessionStorage.getItem("logged_in_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    const storedAdmin = sessionStorage.getItem("original_admin_user");
    if (storedAdmin) {
      try {
        setOriginalAdminUser(JSON.parse(storedAdmin));
      } catch (e) {}
    }

  }, []);

  // Wrapper setPage yang juga menyimpan ke sessionStorage
  function setPage(p: Page) {
    setPageState(p);
    if (p !== "landing" && p !== "login") {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ page: p, timestamp: Date.now() }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      if (p === "landing" || p === "login") {
        sessionStorage.removeItem("logged_in_user");
        sessionStorage.removeItem("original_admin_user");
        setCurrentUser(SESSION);
        setOriginalAdminUser(null);
      }
    }
  }

  function handleLoginSuccess(user: any) {
    sessionStorage.setItem("logged_in_user", JSON.stringify(user));
    sessionStorage.removeItem("original_admin_user");
    setCurrentUser(user);
    setOriginalAdminUser(null);
    setPage("dashboard");
  }

  function handleImpersonate(targetUser: any) {
    sessionStorage.setItem("original_admin_user", JSON.stringify(currentUser));
    sessionStorage.setItem("logged_in_user", JSON.stringify(targetUser));
    setOriginalAdminUser(currentUser);
    setCurrentUser(targetUser);
    setPage("dashboard");
  }

  function handleStopImpersonate() {
    if (originalAdminUser) {
      sessionStorage.setItem("logged_in_user", JSON.stringify(originalAdminUser));
      sessionStorage.removeItem("original_admin_user");
      setCurrentUser(originalAdminUser);
      setOriginalAdminUser(null);
      setPage("users");
    }
  }

  const PAGE_META: Record<Page, { title: string; sub: string }> = {
    landing: { title: "", sub: "" },
    login: { title: "", sub: "" },
    dashboard: { title: "Dashboard", sub: `${currentUser.instansi} · Tahun Penilaian 2026` },
    penilaian: { title: "Penilaian Mandiri Pemerintah Digital", sub: `Kode: ${currentUser.kode || '-'} · ${currentUser.instansi}` },
    detail: { title: detailIndikator ? `Tingkat Kematangan Penilaian: ${detailIndikator.nama}` : "Detail Indikator", sub: "Upload dan kelola bukti dukung per level kematangan" },
    users: { title: "Manajemen Pengguna", sub: "Kelola akun ASN yang memiliki akses ke sistem PEMDI" },
    roles: { title: "Manajemen Role & Hak Akses", sub: "Konfigurasi peran dan izin akses pengguna" },
    instansi: { title: "Regulasi & Instansi", sub: "Daftar instansi pemerintah dan regulasi PEMDI" },
    laporan: { title: "Analisis Capaian", sub: "Rekap nilai kematangan dan progres pengisian dokumen" },
    indikator_crud: { title: "Manajemen Indikator", sub: "Kelola aspek dan indikator penilaian mandiri" },
    kriteria_crud: { title: kriteriaIndikator ? `Kelola Kriteria: ${kriteriaIndikator.nama}` : "Kelola Kriteria", sub: "Tambah, edit, dan hapus data dukung per level kematangan" },
    log_activity: { title: "Log Aktivitas", sub: "Pantau aktivitas pengguna di dalam sistem" },
    tentang: { title: "Tentang Aplikasi", sub: "Informasi sistem PEMDI, versi rilis, dan pusat bantuan" },
    panduan: { title: "Panduan Penggunaan", sub: "Petunjuk interaktif menggunakan aplikasi PEMDI" },
  };

  if (!mounted) return null;

  if (page === "landing") return <LandingPage setPage={setPage} />;
  if (page === "login") return <LoginPage setPage={setPage} onLoginSuccess={handleLoginSuccess} />;
  if (page === "tentang") return <TentangAplikasiView setPage={setPage} />;
  if (page === "panduan") return <PanduanView setPage={setPage} />;

  const { title, sub } = PAGE_META[page];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {originalAdminUser && (
        <div className="bg-orange-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold z-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Anda sedang mengakses sistem sebagai <strong>{currentUser.nama}</strong> ({currentUser.role}).</span>
          </div>
          <button 
            onClick={handleStopImpersonate}
            className="bg-white text-orange-600 px-3 py-1 rounded-md hover:bg-orange-50 transition-colors shadow-sm"
          >
            Kembali ke Akun Admin
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} currentUser={currentUser} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} sub={sub} />

        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <DashboardView setPage={setPage} />}
          {page === "penilaian" && <PenilaianView setPage={setPage} setDetailIndikator={setDetailIndikator} currentUser={currentUser} />}
          {page === "detail" && <DetailView indikator={detailIndikator} />}
          {page === "users" && <UsersView currentUser={currentUser} onImpersonate={handleImpersonate} />}
          {page === "roles" && <RolesView />}
          {page === "laporan" && <LaporanView />}
          {page === "instansi" && <InstansiView />}
          {page === "indikator_crud" && <IndikatorCrudView setPage={setPage} setKriteriaIndikator={setKriteriaIndikator} />}
          {page === "kriteria_crud" && <KriteriaCrudView indikator={kriteriaIndikator} setPage={setPage} />}
          {page === "log_activity" && <LogActivityView />}
        </main>

        <footer className="border-t border-gray-100 px-5 py-2 bg-white flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] text-gray-300">Sistem PEMDI · Kementerian Dalam Negeri RI · v1.0.0</p>
          <p className="text-[10px] text-gray-300">Tahun Anggaran 2026 · {currentUser.instansi}</p>
        </footer>
      </div>
      </div>
    </div>
  );
}
