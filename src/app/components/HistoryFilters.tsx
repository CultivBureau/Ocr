"use client";

import React, { useState } from "react";
import { useHistory } from "../contexts/HistoryContext";

export default function HistoryFilters() {
  const { filterType, setFilterType } = useHistory();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year">("all");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-[#A4C639] hover:text-[#8FB02E] font-semibold"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterType === "all"
              ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Documents
        </button>
        <button
          onClick={() => setFilterType("recent")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterType === "recent"
              ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setFilterType("favorites")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
            filterType === "favorites"
              ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorites
        </button>
        <button
          onClick={() => setFilterType("shared")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterType === "shared"
              ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Shared
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4 animate-in fade-in duration-200">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {(["all", "week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dateRange === range
                      ? "bg-[#A4C639] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range === "all" ? "All Time" : range === "week" ? "Last Week" : range === "month" ? "Last Month" : "Last Year"}
                </button>
              ))}
            </div>
          </div>

          {/* File Type (placeholder for future) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              File Type
            </label>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                PDF
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                All Types
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

