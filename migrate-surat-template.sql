-- Migration: Create surat_template table
-- Run: node migrate-surat-template.mjs

CREATE TABLE IF NOT EXISTS surat_template (
  id VARCHAR(50) PRIMARY KEY,
  indikator_id VARCHAR(50) NULL,
  kriteria_level INT NULL,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  file_path VARCHAR(500) NOT NULL,
  tipe_dokumen VARCHAR(100) DEFAULT 'Umum',
  uploaded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
