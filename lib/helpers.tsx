import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { UploadStatus, KriteriaLevel } from "./types";
import { aspeks } from "./mock-data";

export function statusColor(s: UploadStatus) {
  return { uploaded: "text-emerald-600 bg-emerald-50 border-emerald-200", pending: "text-amber-600 bg-amber-50 border-amber-200", rejected: "text-red-600 bg-red-50 border-red-200", empty: "text-slate-400 bg-slate-50 border-slate-200", verified: "text-blue-600 bg-blue-50 border-blue-200" }[s];
}
export function statusLabel(s: UploadStatus) {
  return { uploaded: "Terunggah", pending: "Menunggu Review", rejected: "Ditolak", empty: "Belum Upload", verified: "Terverifikasi" }[s];
}
export function statusIcon(s: UploadStatus) {
  const cls = "w-3.5 h-3.5";
  return { uploaded: <CheckCircle className={cls} />, pending: <Clock className={cls} />, rejected: <XCircle className={cls} />, empty: <AlertCircle className={cls} />, verified: <CheckCircle className={cls} /> }[s];
}

export function getOverallStats() {
  const all: KriteriaLevel[] = aspeks.flatMap(a => a.indikators.flatMap(i => i.kriteria));
  return {
    total: all.length,
    uploaded: all.filter(k => k.status === "uploaded").length,
    pending: all.filter(k => k.status === "pending").length,
    rejected: all.filter(k => k.status === "rejected").length,
    empty: all.filter(k => k.status === "empty").length,
  };
}
