"use client";

import React from "react";
import type { Table } from "../types/ExtractTypes";

interface TableBlockProps {
  data: Table;
  bbox?: [number, number, number, number];
  page?: number;
  className?: string;
  showStats?: boolean;
  editable?: boolean;
  onEdit?: (table: Table) => void;
  debugMode?: boolean;
}

/**
 * Table Block Component
 * Displays a table with columns and rows
 */
export default function TableBlock({
  data,
  bbox,
  page,
  className = "",
  showStats = false,
  editable = false,
  onEdit,
  debugMode = false,
}: TableBlockProps) {
  const isDebug = debugMode || process.env.NODE_ENV === "development";

  return (
    <div
      className={`table-block mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
      data-table-id={data.id}
      data-table-order={data.order}
      style={isDebug && bbox ? {
        position: "relative",
        border: "2px dashed #10b981",
      } : undefined}
    >
      {/* Table Header with Controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Table</h3>
        {editable && onEdit && (
          <button
            onClick={() => onEdit(data)}
            className="p-2 text-gray-600 hover:text-[#A4C639] hover:bg-gray-100 rounded transition-colors"
            title="Edit Table"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {data.columns.map((col, i) => (
                <th
                  key={i}
                  className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900"
                >
                  {col || `Column ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.length > 0 ? (
              data.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 px-4 py-2 text-gray-700"
                    >
                      {cell || ""}
                    </td>
                  ))}
                  {/* Fill missing cells */}
                  {row.length < data.columns.length &&
                    Array.from({ length: data.columns.length - row.length }).map(
                      (_, i) => (
                        <td
                          key={`empty-${i}`}
                          className="border border-gray-300 px-4 py-2 text-gray-400"
                        >
                          -
                        </td>
                      )
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={data.columns.length}
                  className="border border-gray-300 px-4 py-8 text-center text-gray-400 italic"
                >
                  No data rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex gap-4">
          <span>Columns: {data.columns.length}</span>
          <span>Rows: {data.rows.length}</span>
          <span>Order: {data.order}</span>
          {data.section_id && <span>Section: {data.section_id}</span>}
        </div>
      )}

      {/* Debug Info */}
      {isDebug && (
        <div className="mt-2 text-xs text-gray-400 font-mono border-t pt-2">
          <div>ID: {data.id} | Order: {data.order}</div>
          {page && <div>Page: {page}</div>}
          {bbox && (
            <div>
              BBox: [{bbox[0]}, {bbox[1]}, {bbox[2]}, {bbox[3]}]
            </div>
          )}
          {data.section_id && <div>Section ID: {data.section_id}</div>}
        </div>
      )}
    </div>
  );
}

