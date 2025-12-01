"use client";

import React from "react";

/**
 * Customizable Dynamic Table Template Component
 * 
 * A flexible table component with customizable:
 * - Header styling and colors
 * - Cell formatting
 * - Row styling (striped, hover effects)
 * - Border and spacing
 * - Empty state handling
 * - Responsive behavior
 */
export interface DynamicTableTemplateProps {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  
  // Table Title
  title?: string;
  titleClassName?: string;
  titleSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  showTitle?: boolean;
  
  // Header Configuration
  headerBackgroundColor?: string;
  headerGradient?: {
    from: string;
    to: string;
  };
  headerTextColor?: string;
  headerFontWeight?: "normal" | "medium" | "semibold" | "bold";
  headerTextSize?: "xs" | "sm" | "base";
  headerClassName?: string;
  headerUppercase?: boolean;
  headerTracking?: "normal" | "wide" | "wider" | "widest";
  
  // Cell Configuration
  cellClassName?: string;
  cellTextColor?: string;
  cellTextSize?: "xs" | "sm" | "base";
  cellPadding?: string;
  cellAlignment?: "left" | "center" | "right";
  
  // Row Configuration
  stripedRows?: boolean;
  stripeColor?: string;
  hoverEffect?: boolean;
  hoverColor?: string;
  rowClassName?: string;
  
  // Border Configuration
  border?: boolean;
  borderColor?: string;
  borderWidth?: "thin" | "medium" | "thick";
  rounded?: boolean;
  
  // Spacing Configuration
  marginBottom?: string;
  tableWrapperClassName?: string;
  containerClassName?: string;
  
  // Empty State
  emptyStateMessage?: string;
  emptyStateClassName?: string;
  showEmptyState?: boolean;
  
  // Layout
  fullWidth?: boolean;
  overflowX?: boolean;
  shadow?: boolean;
  backgroundColor?: string;
  
  // Additional customization
  className?: string;
  style?: React.CSSProperties;
}

const DynamicTableTemplate: React.FC<DynamicTableTemplateProps> = ({
  headers,
  rows,
  // Title
  title,
  titleClassName = "",
  titleSize = "xl",
  showTitle = true,
  // Header
  headerBackgroundColor,
  headerGradient = {
    from: "#A4C639",
    to: "#8FB02E",
  },
  headerTextColor = "text-white",
  headerFontWeight = "bold",
  headerTextSize = "sm",
  headerClassName = "",
  headerUppercase = true,
  headerTracking = "wider",
  // Cell
  cellClassName = "",
  cellTextColor = "text-gray-700",
  cellTextSize = "sm",
  cellPadding = "px-6 py-4",
  cellAlignment = "left",
  // Row
  stripedRows = true,
  stripeColor = "bg-gray-50/30",
  hoverEffect = true,
  hoverColor = "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50",
  rowClassName = "",
  // Border
  border = true,
  borderColor = "border-gray-200",
  borderWidth = "medium",
  rounded = true,
  // Spacing
  marginBottom = "mb-10",
  tableWrapperClassName = "",
  containerClassName = "",
  // Empty State
  emptyStateMessage = "No data available",
  emptyStateClassName = "",
  showEmptyState = true,
  // Layout
  fullWidth = true,
  overflowX = true,
  shadow = true,
  backgroundColor = "bg-white",
  // Additional
  className = "",
  style,
}) => {
  // Handle empty state
  if (!headers || headers.length === 0) {
    if (!showEmptyState) return null;
    
    return (
      <div
        className={`dynamic-table-empty p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${marginBottom} ${emptyStateClassName} ${className}`}
        style={style}
      >
        <p className="text-gray-500 text-lg">{emptyStateMessage}</p>
      </div>
    );
  }

  // Normalize rows to match headers length
  const normalizedRows = rows?.map((row) => {
    const normalizedRow = [...row];
    // Pad or truncate to match headers length
    while (normalizedRow.length < headers.length) {
      normalizedRow.push("");
    }
    return normalizedRow.slice(0, headers.length);
  }) || [];

  // Build header background classes
  const getHeaderBackgroundClasses = () => {
    if (headerBackgroundColor) {
      return `bg-[${headerBackgroundColor}]`;
    }
    if (headerGradient) {
      return `bg-gradient-to-r from-[${headerGradient.from}] to-[${headerGradient.to}]`;
    }
    // Default gradient
    return `bg-gradient-to-r from-[#A4C639] to-[#8FB02E]`;
  };

  // Build header classes
  const headerClasses = [
    getHeaderBackgroundClasses(),
    headerTextColor,
    `font-${headerFontWeight}`,
    `text-${headerTextSize}`,
    cellPadding,
    border && `border-r ${borderColor}`,
    headerUppercase && "uppercase",
    `tracking-${headerTracking}`,
    "first:rounded-tl-lg last:rounded-tr-lg last:border-r-0",
    headerClassName,
  ].filter(Boolean).join(" ");

  // Build cell classes
  const cellClasses = [
    cellTextColor,
    `text-${cellTextSize}`,
    cellPadding,
    border && `border-r ${borderColor} last:border-r-0`,
    `text-${cellAlignment}`,
    cellClassName,
  ].filter(Boolean).join(" ");

  // Build row classes
  const getRowClasses = (rowIndex: number) => {
    return [
      "transition-colors duration-150",
      hoverEffect && hoverColor,
      stripedRows && rowIndex % 2 === 0 && stripeColor,
      rowClassName,
    ].filter(Boolean).join(" ");
  };

  // Build border width classes
  const getBorderWidth = () => {
    switch (borderWidth) {
      case "thin":
        return "border";
      case "thick":
        return "border-2";
      default:
        return "border";
    }
  };

  // Build wrapper classes
  const wrapperClasses = [
    "dynamic-table-wrapper",
    fullWidth && "w-full",
    overflowX && "overflow-x-auto",
    marginBottom,
    rounded && "rounded-lg",
    shadow && "shadow-lg",
    border && `border ${borderColor}`,
    tableWrapperClassName,
    className,
  ].filter(Boolean).join(" ");

  // Build table classes
  const tableClasses = [
    "dynamic-table",
    fullWidth && "w-full",
    "border-collapse",
    backgroundColor,
    containerClassName,
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapperClasses} style={style}>
      {/* Table Title */}
      {showTitle && title && (
        <div className="mb-4">
          <h3 className={`text-${titleSize} font-bold text-gray-900 text-center ${titleClassName}`}>
            {title}
          </h3>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className={overflowX ? "overflow-x-auto -mx-4 sm:mx-0" : ""}>
        <div className={`${overflowX ? "inline-block min-w-full align-middle px-4 sm:px-0" : ""}`}>
          <div className={overflowX ? "overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" : ""}>
            <table className={`${tableClasses} ${overflowX ? "min-w-[640px] sm:min-w-0" : ""}`}>
            {/* Table Header */}
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`${headerClasses} whitespace-nowrap`}
                  >
                    {header || ""}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={border ? `divide-y ${borderColor}` : ""}>
              {normalizedRows.length > 0 ? (
                normalizedRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={getRowClasses(rowIndex)}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={cellClasses}>
                        <div className="font-medium">
                          {cell || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className={`${cellClasses} text-center text-gray-500 bg-gray-50`}
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg">{emptyStateMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      
      {/* Mobile-friendly scroll hint */}
      {overflowX && (
        <div className="sm:hidden mt-2 text-xs text-gray-500 text-center">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Swipe to see more
          </span>
        </div>
      )}
    </div>
  );
};

export default DynamicTableTemplate;

