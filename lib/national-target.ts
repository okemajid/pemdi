/**
 * national-target.ts
 * Single source of truth — Baseline Target Nasional PEMDI
 * Target Kumulatif Agregat: 1.70 (skala 1.00–5.00)
 */

// ─── Konstanta ────────────────────────────────────────────────────────────────
export const TARGET_KUMULATIF = 1.70;

export const STATUS_THRESHOLD = {
  KURANG: 1.80,   // < 1.80
  CUKUP: 2.50,    // 1.80 – 2.50
  // BAIK: > 2.50
};

// ─── Tipe Lokal ───────────────────────────────────────────────────────────────
export interface NationalTargetIndikator {
  no: string;
  nama: string;
  bobot: number;  // % dari total 100
  target: number; // skala 1–5
}

export interface NationalTargetAspek {
  aspekNo: number;
  nama: string;
  bobotAspek: number;  // % dari total 100
  targetAspek: number; // skala 1–5 (rata-rata tertimbang indikator)
  indikators: NationalTargetIndikator[];
}

// ─── Data Baseline Nasional ───────────────────────────────────────────────────
export const NATIONAL_BASELINE: NationalTargetAspek[] = [
  {
    aspekNo: 1,
    nama: "Kebijakan & Tata Kelola",
    bobotAspek: 13,
    targetAspek: 2.00,
    indikators: [
      { no: "1",  nama: "Kebijakan Internal Pemdi",   bobot: 3.25, target: 2.00 },
      { no: "2",  nama: "Kelembagaan & Tim Kerja",    bobot: 3.25, target: 2.00 },
      { no: "3",  nama: "Arsitektur & Peta Rencana",  bobot: 3.25, target: 2.00 },
      { no: "4",  nama: "Pemantauan & Evaluasi",      bobot: 3.25, target: 2.00 },
    ],
  },
  {
    aspekNo: 2,
    nama: "Teknologi & Infrastruktur",
    bobotAspek: 25,
    targetAspek: 1.50,
    indikators: [
      { no: "5",  nama: "Pusat Data / Cloud",             bobot: 6.25, target: 1.50 },
      { no: "6",  nama: "Jaringan Intranet/Internet",      bobot: 6.25, target: 2.00 },
      { no: "7",  nama: "Sistem Penghubung Layanan",       bobot: 6.25, target: 1.00 },
      { no: "8",  nama: "Aplikasi / Perangkat Lunak",      bobot: 6.25, target: 1.50 },
    ],
  },
  {
    aspekNo: 3,
    nama: "Pengelolaan Data",
    bobotAspek: 15,
    targetAspek: 1.60,
    indikators: [
      { no: "9",  nama: "Kebijakan Tata Kelola Data/SDI",  bobot: 3.75, target: 2.00 },
      { no: "10", nama: "Interoperabilitas Data",           bobot: 3.75, target: 1.00 },
      { no: "11", nama: "Portal Data Terbuka / Catalog",    bobot: 3.75, target: 2.00 },
      { no: "12", nama: "Penggunaan Data Keputusan",        bobot: 3.75, target: 1.50 },
    ],
  },
  {
    aspekNo: 4,
    nama: "Keamanan Digital",
    bobotAspek: 12,
    targetAspek: 1.50,
    indikators: [
      { no: "13", nama: "Kebijakan Keamanan Siber",             bobot: 4.00, target: 2.00 },
      { no: "14", nama: "Tim Tanggap Insiden / CSIRT",          bobot: 4.00, target: 1.50 },
      { no: "15", nama: "Audit Keamanan & Vulnerability",       bobot: 4.00, target: 1.00 },
    ],
  },
  {
    aspekNo: 5,
    nama: "Keterpaduan Layanan Digital",
    bobotAspek: 35,
    targetAspek: 1.80,
    indikators: [
      { no: "16", nama: "Layanan Kepegawaian/SIMPEG",           bobot: 5.83, target: 2.00 },
      { no: "17", nama: "Layanan Perencanaan & Keuangan",       bobot: 5.83, target: 2.00 },
      { no: "18", nama: "Layanan Naskah Dinas/e-Office",        bobot: 5.83, target: 2.00 },
      { no: "19", nama: "Layanan Perizinan Digital/OSS",        bobot: 5.83, target: 2.00 },
      { no: "20", nama: "Layanan Pengaduan Masyarakat",         bobot: 5.83, target: 2.00 },
      { no: "21", nama: "Integrasi Portal / Super-App",         bobot: 5.85, target: 1.50 },
    ],
  },
];

// ─── Fungsi Kalkulasi ─────────────────────────────────────────────────────────

/**
 * Hitung Indeks Akhir PEMDI dari nilai capaian per aspek.
 * aspekCapaian: { aspekNo, nilai } — nilai sudah dalam skala 0–5
 * Rumus: Σ(NilaiAspek × BobotAspek/100)
 */
export function hitungIndeksAkhir(
  aspekCapaian: { aspekNo: number; nilai: number }[]
): number {
  let indeks = 0;
  for (const ac of aspekCapaian) {
    const baseline = NATIONAL_BASELINE.find(a => a.aspekNo === ac.aspekNo);
    if (!baseline) continue;
    indeks += ac.nilai * (baseline.bobotAspek / 100);
  }
  return indeks;
}

/**
 * Hitung persentase capaian terhadap Target Nasional 1.70
 */
export function hitungPctTerhadapTarget(indeks: number): number {
  return Math.min((indeks / TARGET_KUMULATIF) * 100, 100);
}

/**
 * Tentukan status badge berdasarkan nilai indeks
 */
export function getStatusBadge(indeks: number): "Kurang" | "Cukup" | "Baik" {
  if (indeks < STATUS_THRESHOLD.KURANG) return "Kurang";
  if (indeks < STATUS_THRESHOLD.CUKUP) return "Cukup";
  return "Baik";
}

/**
 * Cari aspek dengan gap terbesar (target - capaian)
 * aspekCapaian: { aspekNo, nilai } — nilai dalam skala 0–5
 */
export function getGapTerbesar(
  aspekCapaian: { aspekNo: number; nilai: number }[]
): { nama: string; gap: number; target: number; capaian: number } | null {
  let maxGap = -Infinity;
  let result: { nama: string; gap: number; target: number; capaian: number } | null = null;

  for (const ac of aspekCapaian) {
    const baseline = NATIONAL_BASELINE.find(a => a.aspekNo === ac.aspekNo);
    if (!baseline) continue;
    const gap = baseline.targetAspek - ac.nilai;
    if (gap > maxGap) {
      maxGap = gap;
      result = {
        nama: baseline.nama,
        gap: parseFloat(gap.toFixed(2)),
        target: baseline.targetAspek,
        capaian: parseFloat(ac.nilai.toFixed(2)),
      };
    }
  }
  return result;
}

/**
 * Build data untuk Radar Chart — 5 titik sumbu, 2 layer (target per aspek + capaian)
 * capaianPerAspek: { aspekNo, nilai } — nilai dalam skala 0–5
 */
export function buildRadarData(
  capaianPerAspek: { aspekNo: number; nilai: number }[]
): { domain: string; capaian: number; targetNasional: number; fullNama: string }[] {
  return NATIONAL_BASELINE.map(baseline => {
    const found = capaianPerAspek.find(c => c.aspekNo === baseline.aspekNo);
    return {
      domain: baseline.nama.split(" ").slice(0, 2).join(" "),
      fullNama: baseline.nama,
      capaian: parseFloat((found?.nilai ?? 0).toFixed(2)),
      targetNasional: baseline.targetAspek,
    };
  });
}

export interface CapaianSummaryData {
  indeksRealisasi: number;
  pctTerhadapTarget: number;
  status: "Kurang" | "Cukup" | "Baik";
  gapTerbesar: { nama: string; gap: number; target: number; capaian: number } | null;
}

/**
 * Build objek ringkasan capaian (untuk KinerjaCard)
 */
export function buildCapaianSummary(
  aspekCapaian: { aspekNo: number; nilai: number }[]
): CapaianSummaryData {
  const indeks = hitungIndeksAkhir(aspekCapaian);
  return {
    indeksRealisasi: parseFloat(indeks.toFixed(2)),
    pctTerhadapTarget: parseFloat(hitungPctTerhadapTarget(indeks).toFixed(1)),
    status: getStatusBadge(indeks),
    gapTerbesar: getGapTerbesar(aspekCapaian),
  };
}
