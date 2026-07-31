import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** berapa banyak tombol angka di kiri/kanan halaman aktif (default 1) */
  siblingCount?: number;
}

/** Membuat daftar halaman dengan elipsis.
 *  Contoh: [1, '...', 4, 5, 6, '...', 20]
 */
function buildPageRange(current: number, total: number, sibling: number): (number | "...")[] {
  const range: (number | "...")[] = [];

  const left = Math.max(2, current - sibling);
  const right = Math.min(total - 1, current + sibling);

  // Selalu tampilkan halaman pertama
  range.push(1);

  if (left > 2) range.push("...");

  for (let i = left; i <= right; i++) range.push(i);

  if (right < total - 1) range.push("...");

  // Selalu tampilkan halaman terakhir (jika lebih dari 1 halaman)
  if (total > 1) range.push(total);

  // Jika hanya 1 halaman, return langsung
  return total === 1 ? [1] : range;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages, siblingCount);

  const btnBase =
    "inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 select-none";
  const btnDefault = "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent";
  const btnActive = "bg-blue-600 text-white shadow-sm shadow-blue-200 border border-blue-600";
  const btnNav =
    "text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 bg-white disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex items-center gap-0.5">
      {/* First */}
      <button
        title="Halaman pertama"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className={`${btnBase} ${btnNav}`}
      >
        <ChevronsLeft size={13} />
      </button>

      {/* Previous */}
      <button
        title="Halaman sebelumnya"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} ${btnNav} gap-0.5 pr-2`}
      >
        <ChevronLeft size={13} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers + ellipsis */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-end justify-center min-w-[28px] h-7 text-gray-400 text-[11px] pb-0.5 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${p === currentPage ? btnActive : btnDefault}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        title="Halaman selanjutnya"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} ${btnNav} gap-0.5 pl-2`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={13} />
      </button>

      {/* Last */}
      <button
        title="Halaman terakhir"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`${btnBase} ${btnNav}`}
      >
        <ChevronsRight size={13} />
      </button>
    </div>
  );
}
