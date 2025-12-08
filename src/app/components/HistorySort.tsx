"use client";

import React from "react";
import { useHistory } from "../contexts/HistoryContext";

export default function HistorySort() {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useHistory();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Sort By</h3>
      
      <div className="space-y-3">
        {/* Sort Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort Field
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "date", label: "Date Created" },
              { value: "modified", label: "Last Modified" },
              { value: "name", label: "Name" },
              { value: "size", label: "Size" },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  sortBy === option.value
                    ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Order
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder("desc")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                sortOrder === "desc"
                  ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Descending
              </span>
            </button>
            <button
              onClick={() => setSortOrder("asc")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                sortOrder === "asc"
                  ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Ascending
              </span>
            </button>
          </div>
        </div>

        {/* Quick Sort Buttons */}
        <div className="pt-3 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quick Sort
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSortBy("date");
                setSortOrder("desc");
              }}
              className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Newest First
            </button>
            <button
              onClick={() => {
                setSortBy("date");
                setSortOrder("asc");
              }}
              className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Oldest First
            </button>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder("asc");
              }}
              className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              A-Z
            </button>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder("desc");
              }}
              className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Z-A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

