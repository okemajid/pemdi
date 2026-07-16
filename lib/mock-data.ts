import { Aspek, UserItem, Role, Maturitas } from "./types";

export const SESSION = { id: "u6", nama: "Admin Sistem", nip: "-", role: "Super Admin" as Role, instansi: "Kemendagri", kode: "00000", kategori: "Pusat" };

export const MATURITY_LABELS: Record<Maturitas, string> = {
  1: "Inisiasi / Rintisan", 2: "Emerging / Cukup", 3: "Berkembang Baik",
  4: "Embedded / Capat Baik", 5: "Leading / Pemimpin",
};

export const MATURITY_COLORS: Record<Maturitas, string> = {
  1: "#EF4444", 2: "#F97316", 3: "#EAB308", 4: "#22C55E", 5: "#3B82F6",
};

export const aspeks: Aspek[] = [
  {
    id: "a1", no: 1, nama: "Tata Kelola dan Manajemen", bobot: 31,
    indikators: [
      {
        id: "i1", no: "1.1", nama: "Tingkat Ketersediaan Data Kinerja Pemerintah Digital", tipe: "Internal",
        bobot: 6, nilaiCapaian: 3.5, predikat: "Berkembang Baik", aspekId: "a1",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.10, status: "uploaded", file: "SK_Kebijakan_2024.pdf", deskripsi: "Pemerintah Daerah telah memiliki dokumen perencanaan yang menyebutkan rencana pengembangan Pemerintah Digital secara umum namun belum spesifik dan terukur." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.15, status: "uploaded", file: "Laporan_Q4_2024.pdf", deskripsi: "Pemerintah Daerah telah memiliki dokumen perencanaan Pemerintah Digital yang lebih spesifik dengan indikator kinerja yang mulai teridentifikasi." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "pending", deskripsi: "Pemerintah Daerah telah memiliki data kinerja Pemerintah Digital yang terdokumentasi dengan baik dan dilakukan pemantauan secara periodik." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "empty", deskripsi: "Data kinerja Pemerintah Digital telah terintegrasi dalam sistem manajemen kinerja daerah dan digunakan sebagai dasar pengambilan keputusan." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.25, status: "empty", deskripsi: "Pemerintah Daerah menjadi rujukan nasional dalam pengelolaan data kinerja Pemerintah Digital dan berbagi praktik terbaik dengan daerah lain." },
        ],
      },
      {
        id: "i2", no: "1.2", nama: "Tingkat Ketersediaan Manajemen Layanan Digital Pemerintah", tipe: "Internal",
        bobot: 8, nilaiCapaian: 2.0, predikat: "Emerging / Cukup", aspekId: "a1",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.10, status: "uploaded", file: "Dok_Manajemen.pdf", deskripsi: "Terdapat pemahaman awal tentang manajemen layanan digital namun belum ada prosedur formal yang ditetapkan." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.21, status: "pending", deskripsi: "Prosedur manajemen layanan digital mulai didokumentasikan dan diterapkan pada sebagian layanan prioritas." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "empty", deskripsi: "Manajemen layanan digital telah diterapkan secara konsisten pada seluruh layanan utama dengan SLA yang terukur." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "empty", deskripsi: "Manajemen layanan digital telah terotomatisasi dan terintegrasi dengan sistem monitoring real-time." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.19, status: "empty", deskripsi: "Pemerintah Daerah menjadi model referensi nasional dalam manajemen layanan digital yang inovatif dan adaptif." },
        ],
      },
    ],
  },
  {
    id: "a2", no: 2, nama: "Pengembangan", bobot: 24,
    indikators: [
      {
        id: "i3", no: "2.1", nama: "Tingkat Kematangan Kebijakan Pemerintah Digital", tipe: "Internal",
        bobot: 7, nilaiCapaian: 4.0, predikat: "Embedded / Capat Baik", aspekId: "a2",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.12, status: "uploaded", file: "Perda_SPBE.pdf", deskripsi: "Terdapat kebijakan dasar terkait pengembangan Pemerintah Digital namun masih bersifat umum." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.18, status: "uploaded", file: "Perbup_TIK_2023.pdf", deskripsi: "Kebijakan Pemerintah Digital mulai lebih spesifik dengan cakupan yang lebih luas dan target yang terukur." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "uploaded", file: "Roadmap_Digital.pdf", deskripsi: "Kebijakan Pemerintah Digital komprehensif mencakup seluruh aspek dengan indikator keberhasilan yang jelas." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "pending", deskripsi: "Kebijakan Pemerintah Digital telah terintegrasi dengan kebijakan pembangunan daerah secara menyeluruh." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.20, status: "empty", deskripsi: "Kebijakan Pemerintah Digital menjadi acuan bagi daerah lain dan berkontribusi pada kebijakan nasional." },
        ],
      },
      {
        id: "i4", no: "2.2", nama: "Tingkat Keandalan Infrastruktur Pemerintah Digital", tipe: "Eksternal",
        bobot: 9, nilaiCapaian: null, predikat: null, aspekId: "a2",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.10, status: "empty", deskripsi: "Infrastruktur dasar TIK tersedia namun belum memenuhi standar keandalan yang dipersyaratkan." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.15, status: "empty", deskripsi: "Infrastruktur TIK mulai dikelola dengan standar yang lebih baik dan redundansi dasar tersedia." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "empty", deskripsi: "Infrastruktur TIK memiliki keandalan tinggi dengan SLA yang terdokumentasi dan dipantau secara aktif." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "empty", deskripsi: "Infrastruktur TIK beroperasi dengan keandalan sangat tinggi, otomatisasi pemulihan, dan disaster recovery." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.25, status: "empty", deskripsi: "Infrastruktur TIK bersifat cloud-native, scalable, dan menjadi referensi nasional dalam standar keandalan." },
        ],
      },
    ],
  },
  {
    id: "a3", no: 3, nama: "Data", bobot: 20,
    indikators: [
      {
        id: "i5", no: "3.1", nama: "Tingkat Ketersediaan Data Induk Satu Data Indonesia", tipe: "Eksternal",
        bobot: 8, nilaiCapaian: 1.5, predikat: "Inisiasi / Rintisan", aspekId: "a3",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.21, status: "uploaded", file: "Data_Inventaris.xlsx", deskripsi: "Terdapat identifikasi awal data yang perlu dikelola dalam kerangka Satu Data Indonesia namun belum komprehensif." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.25, status: "rejected", file: "SDI_Format.xlsx", deskripsi: "Data mulai dikelola sesuai standar Satu Data Indonesia pada beberapa domain data prioritas." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "empty", deskripsi: "Pengelolaan data sesuai SDI telah diterapkan pada mayoritas domain data dengan wali data yang ditetapkan." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.15, status: "empty", deskripsi: "Seluruh data pemerintah daerah dikelola dalam ekosistem SDI yang terintegrasi dengan portal data nasional." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.14, status: "empty", deskripsi: "Pemerintah Daerah menjadi pelopor dalam implementasi SDI dan berkontribusi aktif pada pengembangan standar nasional." },
        ],
      },
      {
        id: "i6", no: "3.2", nama: "Tingkat Ketersediaan Informasi Umum Pemerintah PPID Digital", tipe: "Eksternal",
        bobot: 6, nilaiCapaian: 3.0, predikat: "Berkembang Baik", aspekId: "a3",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.15, status: "uploaded", file: "SK_PPID.pdf", deskripsi: "PPID sudah terbentuk namun layanan informasi publik belum sepenuhnya digital." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.20, status: "uploaded", file: "Website_PPID_Screenshot.png", deskripsi: "Portal PPID digital sudah tersedia dan berfungsi dengan konten informasi dasar yang dipublikasikan." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "pending", deskripsi: "Portal PPID digital lengkap dan mudah diakses dengan mekanisme permintaan informasi online yang berfungsi baik." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "empty", deskripsi: "Layanan PPID digital terintegrasi dengan sistem informasi internal dan memberikan respons otomatis." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.15, status: "empty", deskripsi: "PPID digital menjadi model terbaik nasional dengan inovasi layanan informasi publik yang berkelanjutan." },
        ],
      },
    ],
  },
  {
    id: "a4", no: 4, nama: "Layanan", bobot: 25,
    indikators: [
      {
        id: "i7", no: "4.1", nama: "Tingkat Kematangan Layanan Publik Berbasis Digital", tipe: "Internal",
        bobot: 10, nilaiCapaian: 4.5, predikat: "Leading / Pemimpin", aspekId: "a4",
        kriteria: [
          { level: 1, label: "Inisiasi / Rintisan", bobot: 0.10, status: "uploaded", file: "Inventaris_Layanan.pdf", deskripsi: "Tersedia beberapa layanan publik secara online namun masih terbatas dan belum terintegrasi." },
          { level: 2, label: "Emerging / Cukup", bobot: 0.20, status: "uploaded", file: "Portal_Layanan.pdf", deskripsi: "Portal layanan publik online tersedia dengan layanan prioritas yang dapat diakses secara digital." },
          { level: 3, label: "Berkembang Baik", bobot: 0.25, status: "uploaded", file: "Laporan_Layanan_Q3.pdf", deskripsi: "Sebagian besar layanan publik sudah digital end-to-end dengan sistem antrian dan notifikasi otomatis." },
          { level: 4, label: "Embedded / Capat Baik", bobot: 0.25, status: "uploaded", file: "Survey_IKM_2024.pdf", deskripsi: "Seluruh layanan publik telah digital penuh, terintegrasi, dan dipantau dengan dashboard real-time." },
          { level: 5, label: "Leading / Pemimpin", bobot: 0.20, status: "pending", deskripsi: "Layanan publik digital inovatif dengan AI dan prediktif, menjadi contoh nasional dan internasional." },
        ],
      },
    ],
  },
];

export const USERS: UserItem[] = [
  { id: "u1", nama: "Budi Santoso", email: "budi@ciamiskab.go.id", nip: "198705122010011002", instansi: "Diskominfo Ciamis", role: "Admin Instansi", status: "Aktif", lastLogin: "14 Jul 2025, 08:32" },
  { id: "u2", nama: "Siti Rahayu", email: "siti@ciamiskab.go.id", nip: "199001152012012001", instansi: "Dinas Pendidikan", role: "Operator OPD", status: "Aktif", lastLogin: "14 Jul 2025, 07:15" },
  { id: "u3", nama: "Ahmad Fauzi", email: "ahmad@ciamiskab.go.id", nip: "198803202011011003", instansi: "BAPPEDA", role: "Operator OPD", status: "Aktif", lastLogin: "13 Jul 2025, 16:44" },
  { id: "u4", nama: "Dewi Kurniawati", email: "dewi@ciamiskab.go.id", nip: "199205102015012002", instansi: "Dinas Kesehatan", role: "Viewer", status: "Aktif", lastLogin: "12 Jul 2025, 10:20" },
  { id: "u5", nama: "Rizky Pratama", email: "rizky@ciamiskab.go.id", nip: "199407082017011001", instansi: "Diskominfo Ciamis", role: "Operator OPD", status: "Nonaktif", lastLogin: "01 Jul 2025, 14:00" },
  { id: "u6", nama: "Admin Sistem", email: "admin@pemdi.go.id", nip: "–", instansi: "Kemendagri", role: "Super Admin", status: "Aktif", lastLogin: "14 Jul 2025, 09:00" },
];

export const ROLES_DATA = [
  { id: "r1", nama: "Super Admin", deskripsi: "Akses penuh ke seluruh sistem dan konfigurasi", users: 1, permissions: ["Kelola Instansi", "Kelola Pengguna", "Kelola Indikator", "Lihat Laporan", "Konfigurasi Sistem", "Export Data"] },
  { id: "r2", nama: "Admin Instansi", deskripsi: "Mengelola penilaian dan pengguna dalam satu instansi", users: 4, permissions: ["Kelola Pengguna OPD", "Input Penilaian", "Upload Dokumen", "Lihat Laporan", "Export Data"] },
  { id: "r3", nama: "Operator OPD", deskripsi: "Upload bukti dukung dan input capaian indikator", users: 12, permissions: ["Input Penilaian", "Upload Dokumen", "Lihat Laporan"] },
  { id: "r4", nama: "Viewer", deskripsi: "Hanya dapat melihat data penilaian tanpa edit", users: 8, permissions: ["Lihat Laporan"] },
];
