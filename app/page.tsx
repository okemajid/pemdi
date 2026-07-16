"use client";

import { useState } from "react";
import { Page, Aspek, Indikator } from "@/lib/types";
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

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [collapsed, setCollapsed] = useState(false);
  const [detailIndikator, setDetailIndikator] = useState<Indikator | null>(null);
  const [kriteriaIndikator, setKriteriaIndikator] = useState<{ id: string; nama: string; no: string } | null>(null);

  const PAGE_META: Record<Page, { title: string; sub: string }> = {
    landing: { title: "", sub: "" },
    login: { title: "", sub: "" },
    dashboard: { title: "Dashboard", sub: `${SESSION.instansi} · Tahun Penilaian 2025` },
    penilaian: { title: "Penilaian Mandiri Pemerintah Digital", sub: `Kode: ${SESSION.kode} · ${SESSION.instansi}` },
    detail: { title: detailIndikator ? `Tingkat Kematangan Penilaian: ${detailIndikator.nama}` : "Detail Indikator", sub: "Upload dan kelola bukti dukung per level maturitas" },
    users: { title: "Manajemen Pengguna", sub: "Kelola akun ASN yang memiliki akses ke sistem PEMDI" },
    roles: { title: "Manajemen Role & Hak Akses", sub: "Konfigurasi peran dan izin akses pengguna" },
    instansi: { title: "Regulasi & Instansi", sub: "Daftar instansi pemerintah dan regulasi PEMDI" },
    laporan: { title: "Analisis Capaian", sub: "Rekap nilai maturitas dan progres pengisian dokumen" },
    indikator_crud: { title: "Manajemen Indikator", sub: "Kelola aspek dan indikator penilaian mandiri" },
    kriteria_crud: { title: kriteriaIndikator ? `Kelola Kriteria: ${kriteriaIndikator.nama}` : "Kelola Kriteria", sub: "Tambah, edit, dan hapus data dukung per level kematangan" },
    log_activity: { title: "Log Aktivitas", sub: "Pantau aktivitas pengguna di dalam sistem" },
  };

  if (page === "landing") return <LandingPage setPage={setPage} />;
  if (page === "login") return <LoginPage setPage={setPage} />;

  const { title, sub } = PAGE_META[page];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} sub={sub} />

        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <DashboardView setPage={setPage} />}
          {page === "penilaian" && <PenilaianView setPage={setPage} setDetailIndikator={setDetailIndikator} />}
          {page === "detail" && <DetailView indikator={detailIndikator} />}
          {page === "users" && <UsersView />}
          {page === "roles" && <RolesView />}
          {page === "laporan" && <LaporanView />}
          {page === "instansi" && <InstansiView />}
          {page === "indikator_crud" && <IndikatorCrudView setPage={setPage} setKriteriaIndikator={setKriteriaIndikator} />}
          {page === "kriteria_crud" && <KriteriaCrudView indikator={kriteriaIndikator} setPage={setPage} />}
          {page === "log_activity" && <LogActivityView />}
        </main>

        <footer className="border-t border-gray-100 px-5 py-2 bg-white flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] text-gray-300">Sistem PEMDI · Kementerian Dalam Negeri RI · v1.0.0</p>
          <p className="text-[10px] text-gray-300">Tahun Anggaran 2025 · {SESSION.instansi}</p>
        </footer>
      </div>
    </div>
  );
}
