"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
  isRTL?: boolean;
  labels: {
    previous: string;
    next: string;
    pageOf: string;
    showingRange: string;
  };
  className?: string;
}

/**
 * Shared pagination controls (Prev / Next + page summary).
 * Use different `pageSize` values per screen (e.g. 20 history, 10 users).
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  isRTL = false,
  labels,
  className = "",
}: PaginationProps) {
  if (totalItems <= 0 || totalPages <= 0) {
    return null;
  }

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pageOfText = labels.pageOf
    .replace("{current}", String(currentPage))
    .replace("{total}", String(totalPages));

  const rangeText = labels.showingRange
    .replace("{start}", String(start))
    .replace("{end}", String(end))
    .replace("{total}", String(totalItems));

  const prev = () => onPageChange(Math.max(1, currentPage - 1));
  const next = () => onPageChange(Math.min(totalPages, currentPage + 1));

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-2xl border border-[#C4B454]/25 bg-gradient-to-r from-[#C4B454]/8 to-[#B8A040]/5 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <p className="text-sm font-medium text-slate-600 text-center sm:text-start">
        {rangeText}
      </p>
      <div
        className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-slate-200 text-slate-700 hover:border-[#C4B454] hover:bg-[#C4B454]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          {labels.previous}
        </button>
        <span className="px-3 py-2 text-sm font-bold text-slate-800 min-w-[8rem] text-center">
          {pageOfText}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-slate-200 text-slate-700 hover:border-[#C4B454] hover:bg-[#C4B454]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {labels.next}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
