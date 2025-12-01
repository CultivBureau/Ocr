"use client";

import React from 'react';
import type { Table } from "../types/ExtractTypes";
import { tableToDynamicTableRows, formatTable } from "../utils/formatTables";

interface TableCell {
  content: string;
  rowSpan?: number;
  colSpan?: number;
  isHeader?: boolean;
  className?: string;
}

interface TableRow {
  cells: TableCell[];
  className?: string;
}

interface DynamicTableProps {
  // Direct props (legacy support)
  title?: string;
  headers?: string[];
  rows?: TableRow[];
  
  // Phase 3: Table object support
  table?: Table;
  
  // Styling
  className?: string;
  cellClassName?: string;
  headerClassName?: string;
  
  // Features
  showStats?: boolean;
  editable?: boolean;
  onEdit?: (table: Table) => void;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  headers: propsHeaders,
  rows: propsRows,
  table,
  className = '',
  cellClassName = '',
  headerClassName = '',
  showStats = false,
  editable = false,
  onEdit,
}) => {
  // Phase 3: Support Table object
  let displayHeaders: string[] = [];
  let displayRows: TableRow[] = [];
  let tableTitle = title;
  let formattedTable = null;

  if (table) {
    formattedTable = formatTable(table);
    displayHeaders = formattedTable.displayColumns;
    displayRows = tableToDynamicTableRows(table);
    tableTitle = tableTitle || `جدول ${table.id}`;
  } else if (propsHeaders && propsRows) {
    // Legacy support
    displayHeaders = propsHeaders;
    displayRows = propsRows;
  }

  if (displayRows.length === 0) {
    return (
      <div className={`w-full p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <p className="text-gray-500 text-center">الجدول فارغ</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full mb-6 ${className}`}
      data-table-id={table?.id}
      data-table-order={table?.order}
    >
      {/* Table Title */}
      {tableTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 text-center flex-1">
            {tableTitle}
          </h3>
          
          {editable && onEdit && table && (
            <button
              onClick={() => onEdit(table)}
              className="ml-4 p-2 text-gray-600 hover:text-[#A4C639] hover:bg-gray-100 rounded transition-colors"
              title="تعديل الجدول"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="w-full max-w-full border-collapse border border-gray-400 table-auto min-w-[640px] sm:min-w-0">
          {displayHeaders && displayHeaders.length > 0 && (
            <thead>
              <tr className="bg-[#A4C639]">
                {displayHeaders.map((header, index) => (
                  <th
                    key={index}
                    className={`border border-gray-400 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-white text-xs sm:text-sm whitespace-nowrap ${headerClassName}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${row.className || ''} ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-lime-50 transition-colors`}
              >
                {row.cells.map((cell, cellIndex) => {
                  const CellTag = cell.isHeader ? 'th' : 'td';
                  const baseClass = cell.isHeader
                    ? 'bg-green-100 font-bold text-gray-900'
                    : 'text-gray-800';
                  
                  return (
                    <CellTag
                      key={cellIndex}
                      rowSpan={cell.rowSpan}
                      colSpan={cell.colSpan}
                      className={`border border-gray-400 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm ${baseClass} ${cell.className || ''} ${cellClassName} break-words`}
                    >
                      <div className="max-w-[200px] sm:max-w-none mx-auto">
                        {cell.content}
                      </div>
                    </CellTag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>
      
      {/* Mobile-friendly card view hint */}
      <div className="sm:hidden mt-2 text-xs text-gray-500 text-center">
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          اسحب لرؤية المزيد
        </span>
      </div>

      {/* Statistics (optional) */}
      {showStats && formattedTable && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex gap-4 justify-center">
          <span>الصفوف: {formattedTable.rowCount}</span>
          <span>الأعمدة: {formattedTable.columnCount}</span>
          <span>الخلايا: {formattedTable.cellCount}</span>
          {table && <span>الترتيب: {table.order}</span>}
        </div>
      )}

      {/* Table Metadata (debug) */}
      {process.env.NODE_ENV === "development" && table && (
        <div className="mt-2 text-xs text-gray-400 font-mono text-center">
          ID: {table.id} | Order: {table.order} | Section: {table.section_id || "none"}
        </div>
      )}
    </div>
  );
};

export default DynamicTable;