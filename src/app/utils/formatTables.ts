/**
 * Format Tables Utility
 * Phase 3: Receiving Extracted Data
 * 
 * Functions to format and process tables for rendering
 */

import type { Table } from "../types/ExtractTypes";

/**
 * Format table for display
 * @param table - Table object
 * @returns Formatted table with display-ready properties
 */
export function formatTable(table: Table) {
  return {
    ...table,
    displayColumns: table.columns || [],
    displayRows: table.rows || [],
    rowCount: table.rows ? table.rows.length : 0,
    columnCount: table.columns ? table.columns.length : 0,
    cellCount: table.rows ? table.rows.reduce((sum: number, row: string[]) => sum + row.length, 0) : 0,
    isEmpty: !table.rows || table.rows.length === 0,
  };
}

/**
 * Format multiple tables
 * @param tables - Array of tables
 * @returns Array of formatted tables
 */
export function formatTables(tables: Table[]) {
  return tables.map(formatTable);
}

/**
 * Sort tables by order
 * @param tables - Array of tables
 * @returns Sorted tables
 */
export function sortTablesByOrder(tables: Table[]): Table[] {
  return [...tables].sort((a, b) => a.order - b.order);
}

/**
 * Group tables by section
 * @param tables - Array of tables
 * @returns Map of section_id to tables
 */
export function groupTablesBySection(tables: Table[]): Map<string | null, Table[]> {
  const grouped = new Map<string | null, Table[]>();
  
  tables.forEach((table) => {
    const sectionId = table.section_id;
    if (!grouped.has(sectionId)) {
      grouped.set(sectionId, []);
    }
    grouped.get(sectionId)!.push(table);
  });
  
  // Sort each group by order
  grouped.forEach((groupTables) => {
    groupTables.sort((a, b) => a.order - b.order);
  });
  
  return grouped;
}

/**
 * Validate table structure
 * @param table - Table object
 * @returns Validation result
 */
export function validateTable(table: Table): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!table.columns || table.columns.length === 0) {
    errors.push("الجدول لا يحتوي على أعمدة");
  }
  
  if (!table.rows || table.rows.length === 0) {
    errors.push("الجدول لا يحتوي على صفوف");
  }
  
  // Check if all rows have same number of cells as columns
  if (table.columns && table.rows) {
    const columnCount = table.columns.length;
    table.rows.forEach((row: string[], index: number) => {
      if (row.length !== columnCount) {
        errors.push(`الصف ${index + 1} يحتوي على ${row.length} خلايا بدلاً من ${columnCount}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get table statistics
 * @param tables - Array of tables
 * @returns Statistics object
 */
export function getTableStats(tables: Table[]) {
  const totalRows = tables.reduce((sum, table) => sum + (table.rows ? table.rows.length : 0), 0);
  const totalCells = tables.reduce(
    (sum: number, table: Table) => sum + (table.rows ? table.rows.reduce((rowSum: number, row: string[]) => rowSum + row.length, 0) : 0),
    0
  );
  const totalColumns = tables.reduce((sum, table) => sum + (table.columns ? table.columns.length : 0), 0);
  
  return {
    total: tables.length,
    totalRows,
    totalColumns,
    totalCells,
    averageRows: tables.length > 0 ? Math.round(totalRows / tables.length) : 0,
    averageColumns: tables.length > 0 ? Math.round(totalColumns / tables.length) : 0,
    emptyTables: tables.filter((t) => !t.rows || t.rows.length === 0).length,
  };
}

/**
 * Convert table to CSV format
 * @param table - Table object
 * @returns CSV string
 */
export function tableToCSV(table: Table): string {
  const lines: string[] = [];
  
  // Add headers
  if (table.columns && table.columns.length > 0) {
    lines.push(table.columns.join(","));
  }
  
  // Add rows
  if (table.rows) {
    table.rows.forEach((row: string[]) => {
      // Escape commas and quotes in cells
      const escapedRow = row.map((cell: string) => {
        const cellStr = String(cell);
        if (cellStr.includes(",") || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      lines.push(escapedRow.join(","));
    });
  }
  
  return lines.join("\n");
}

/**
 * Convert table rows to DynamicTable format
 * @param table - Table object
 * @returns Formatted rows for DynamicTable component
 */
export function tableToDynamicTableRows(table: Table) {
  if (!table.rows || table.rows.length === 0) {
    return [];
  }
  
  return table.rows.map((row: string[]) => ({
    cells: row.map((cell: string) => ({
      content: String(cell),
      isHeader: false,
    })),
  }));
}

