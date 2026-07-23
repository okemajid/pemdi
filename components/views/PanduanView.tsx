import React, { useState } from "react";
import { ArrowLeft, BookOpen, Download, Monitor, Shield, Users, FileText, ChevronRight } from "lucide-react";
import { Page } from "@/lib/types";

export function PanduanView({ setPage }: { setPage: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState("login");

  const tabs = [
    { id: "login", label: "Login Sistem", icon: Shield },
    { id: "dashboard", label: "Dashboard", icon: Monitor },
    { id: "penilaian", label: "Penilaian Mandiri", icon: FileText },
    { id: "users", label: "Manajemen Pengguna", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-10 px-4 items-center">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
        <a 
          href="/Panduan_PEMDI.md" 
          download 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Download size={16} /> Unduh PDF Manual
        </a>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen size={18} />
            </div>
            <h2 className="font-bold text-gray-900">Panduan Interaktif</h2>
          </div>
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    {tab.label}
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[75vh]">
          {activeTab === "login" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Cara Login ke Sistem</h2>
              <p className="text-gray-600">Untuk masuk ke dalam sistem PEMDI, Anda harus menggunakan kredensial instansi (Email atau NIP) yang telah didaftarkan.</p>
              
              <div className="bg-gray-100 rounded-xl aspect-video w-full max-w-2xl overflow-hidden border border-gray-200">
                <img src="/ss_login.png" alt="Halaman Login" className="w-full h-full object-cover opacity-80" />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 mb-3">Langkah-langkah:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Buka URL aplikasi PEMDI dari browser Anda.</li>
                  <li>Masukkan <strong>Email</strong> atau <strong>NIP</strong> yang terdaftar.</li>
                  <li>Masukkan <strong>Kata Sandi</strong>. (Klik ikon mata untuk menampilkan teks).</li>
                  <li>Klik tombol <strong>Masuk ke Sistem</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Navigasi Dashboard</h2>
              <p className="text-gray-600">Dashboard memberikan ringkasan informasi dan akses cepat ke berbagai modul aplikasi. Tampilan dashboard akan menyesuaikan dengan Role / Peran Anda.</p>
              
              <div className="bg-gray-100 rounded-xl aspect-video w-full max-w-2xl overflow-hidden border border-gray-200 mt-4 shadow-sm">
                <img src="/ss_dashboard.png" alt="Dashboard" className="w-full h-full object-cover" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-gray-200 rounded-xl p-4">
                  <Monitor className="text-blue-500 mb-2" size={24} />
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Widget Statistik</h4>
                  <p className="text-xs text-gray-500">Menampilkan persentase progress capaian, total indikator, dokumen, dan skor keseluruhan.</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <FileText className="text-green-500 mb-2" size={24} />
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Aktivitas Terbaru</h4>
                  <p className="text-xs text-gray-500">Melihat log history siapa saja yang baru melakukan unggah dokumen atau update penilaian.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "penilaian" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Melakukan Penilaian Mandiri</h2>
              <p className="text-gray-600">Ini adalah fitur inti dari sistem. Operator atau Admin Instansi dapat mengunggah bukti dukung (evidence) untuk mengukur tingkat kematangan.</p>

              <div className="bg-gray-100 rounded-xl aspect-video w-full max-w-2xl overflow-hidden border border-gray-200 mt-4 shadow-sm">
                <img src="/ss_penilaian.png" alt="Penilaian Mandiri" className="w-full h-full object-cover" />
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mt-4">
                <h3 className="font-bold text-orange-900 mb-3">Langkah Pengisian Bukti:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-orange-800">
                  <li>Klik menu <strong>Penilaian Mandiri</strong> di sidebar.</li>
                  <li>Pilih Indikator yang ditugaskan, klik <strong>Lihat Detail</strong>.</li>
                  <li>Pada tabel Level Kematangan (1-5), klik ikon unggah (📤) di baris yang bersangkutan.</li>
                  <li>Pilih file PDF (maks. 5MB) dan tunggu hingga status menjadi <em>Uploaded</em>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Manajemen Pengguna</h2>
              <p className="text-gray-600">Super Admin dan Admin Instansi memiliki akses untuk menambah dan mengelola akun operator di dalam OPD nya.</p>

              <div className="bg-gray-100 rounded-xl aspect-video w-full max-w-2xl overflow-hidden border border-gray-200 mt-4 mb-4 shadow-sm">
                <img src="/ss_users.png" alt="Manajemen Pengguna" className="w-full h-full object-cover" />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Menambah Pengguna Baru:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mb-4">
                  <li>Buka menu <strong>Manajemen Pengguna</strong>.</li>
                  <li>Klik tombol <strong>+ Tambah Pengguna</strong> di pojok kanan atas.</li>
                  <li>Lengkapi form Nama, NIP, Email, Instansi, Role, dan Password.</li>
                  <li>Klik <strong>Simpan</strong>.</li>
                </ol>

                <h3 className="font-bold text-gray-900 text-sm mb-2 mt-6">Reset Password:</h3>
                <p className="text-sm text-gray-600">
                  Klik ikon Edit (pensil) pada baris pengguna, ketikkan password baru di kolom Password, lalu Simpan. (Kosongkan jika tidak ingin mengubah password).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
