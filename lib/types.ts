export type Page = "landing" | "login" | "dashboard" | "penilaian" | "detail" | "users" | "roles" | "instansi" | "laporan" | "indikator_crud" | "kriteria_crud" | "log_activity" | "tentang" | "panduan";
export type Role = "Super Admin" | "Admin Instansi" | "Operator OPD" | "Viewer";
export type Kematangan = 1 | 2 | 3 | 4 | 5;
export type UploadStatus = "uploaded" | "pending" | "rejected" | "empty" | "verified";

export interface KriteriaLevel {
  id?: string;
  indikatorId?: string;
  level: Kematangan;
  label: string;
  bobot: number;
  deskripsi: string;
  status: UploadStatus;
  file?: string;
}

export interface Indikator {
  id: string;
  no: string;
  nama: string;
  tipe: "Internal" | "Eksternal";
  bobot: number;
  nilaiCapaian: number | null;
  predikat: string | null;
  aspekId: string;
  kriteria: KriteriaLevel[];
}

export interface Aspek {
  id: string;
  no: number;
  nama: string;
  bobot: number;
  indikators: Indikator[];
}

export interface UserItem {
  id: string;
  nama: string;
  email: string;
  nip: string;
  instansi: string;
  role: Role;
  status: "Aktif" | "Nonaktif";
  lastLogin: string;
}
