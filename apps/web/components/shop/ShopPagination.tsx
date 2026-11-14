"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";
import { CountUp } from "@/components/reactbits/CountUp";
import { Magnet } from "@/components/reactbits/Magnet";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ShopPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ShopPaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="w-full mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
      {/* ── Results Summary with ReactBits CountUp ── */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <strong className="text-foreground font-semibold">
            {startItem} – {endItem}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground font-semibold">
            <CountUp to={totalItems} duration={800} />
          </strong>{" "}
          accessories
        </span>

        {/* Page size picker */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-border">
          <span className="text-[11px] text-muted-foreground">Show:</span>
          {[12, 16, 24, 36].map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                pageSize === size
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* ── Page Navigation Controls ── */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <Magnet padding={15} magnetStrength={2}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
        </Magnet>

        {/* Mobile Compact Page Indicator (< 640px) */}
        <div className="flex sm:hidden items-center px-3 text-xs font-bold text-foreground">
          {currentPage} / {totalPages}
        </div>

        {/* Numbered Pills (sm+ >= 640px) */}
        <div className="hidden sm:flex items-center gap-1 px-1">
          {pages.map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-muted-foreground font-bold tracking-widest"
                >
                  •••
                </span>
              );
            }

            const isCurrent = pageNum === currentPage;
            return (
              <Magnet key={`page-${pageNum}`} padding={15} magnetStrength={3}>
                <button
                  onClick={() => onPageChange(pageNum as number)}
                  className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                    isCurrent
                      ? "bg-foreground text-background shadow-md shadow-foreground/10 scale-105"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
                  }`}
                >
                  {pageNum}
                </button>
              </Magnet>
            );
          })}
        </div>

        {/* Next */}
        <Magnet padding={15} magnetStrength={2}>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </Magnet>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
