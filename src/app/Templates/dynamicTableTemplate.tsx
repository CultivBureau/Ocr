"use client";

import React, { useState } from "react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

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
  headers?: string[];
  columns?: string[]; // Support 'columns' prop from our JSON structure
  rows: (string | number | React.ReactNode)[][];
  
  // Editable Configuration
  editable?: boolean;
  onCellChange?: (rowIndex: number, cellIndex: number, newValue: string) => void;
  onHeaderChange?: (headerIndex: number, newValue: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onDelete?: () => void;
  onBackgroundColorChange?: (color: 'dark-blue' | 'dark-red' | 'pink' | 'green') => void;
  onAddColumn?: () => void;
  onRemoveColumn?: (columnIndex: number) => void;
  onAddRow?: () => void;
  onRemoveRow?: (rowIndex: number) => void;
  tableBackgroundColor?: 'dark-blue' | 'dark-red' | 'pink' | 'green'; // Initial color from JSON
  
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
  columns, // Use 'columns' from JSON or fallback to 'headers'
  rows,
  // Editable
  editable = true,
  onCellChange,
  onHeaderChange,
  onTitleChange,
  onDelete,
  onBackgroundColorChange,
  onAddColumn,
  onRemoveColumn,
  onAddRow,
  onRemoveRow,
  tableBackgroundColor = 'green', // Default to green if not specified
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
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'dark-blue' | 'dark-red' | 'pink' | 'green' | 'black' | 'purple' | 'teal' | 'orange' | 'indigo' | 'emerald'>(tableBackgroundColor);
  
  // Get background color classes - Enhanced with more professional options
  const getBackgroundColorClass = (color: 'dark-blue' | 'dark-red' | 'pink' | 'green' | 'black' | 'purple' | 'teal' | 'orange' | 'indigo' | 'emerald') => {
    switch (color) {
      case 'dark-blue':
        return { bg: 'bg-[#1E3A8A]', border: 'border-[#1E3A8A]', from: '#1E3A8A', to: '#1E40AF', accent: '#3B82F6' };
      case 'dark-red':
        return { bg: 'bg-[#991B1B]', border: 'border-[#991B1B]', from: '#991B1B', to: '#B91C1C', accent: '#EF4444' };
      case 'black':
        return { bg: 'bg-[#1F2937]', border: 'border-[#1F2937]', from: '#1F2937', to: '#374151', accent: '#6B7280' };
      case 'purple':
        return { bg: 'bg-[#7C3AED]', border: 'border-[#7C3AED]', from: '#7C3AED', to: '#8B5CF6', accent: '#A78BFA' };
      case 'teal':
        return { bg: 'bg-[#0D9488]', border: 'border-[#0D9488]', from: '#0D9488', to: '#14B8A6', accent: '#2DD4BF' };
      case 'orange':
        return { bg: 'bg-[#EA580C]', border: 'border-[#EA580C]', from: '#EA580C', to: '#F97316', accent: '#FB923C' };
      case 'indigo':
        return { bg: 'bg-[#4338CA]', border: 'border-[#4338CA]', from: '#4338CA', to: '#5B21B6', accent: '#8B5CF6' };
      case 'emerald':
        return { bg: 'bg-[#059669]', border: 'border-[#059669]', from: '#059669', to: '#10B981', accent: '#34D399' };
      case 'pink':
        return { bg: 'bg-[#EC4899]', border: 'border-[#EC4899]', from: '#EC4899', to: '#F472B6', accent: '#F9A8D4' };
      case 'green':
      default:
        return { bg: 'bg-[#A4C639]', border: 'border-[#A4C639]', from: '#A4C639', to: '#8FB02E', accent: '#BEF264' };
    }
  };
  
  const colorClasses = getBackgroundColorClass(selectedColor);
  
  // Use 'columns' from JSON or fallback to 'headers'
  const tableHeaders = columns || headers || [];

  // Handle empty state
  if (!tableHeaders || tableHeaders.length === 0) {
    return null;
  }

  // Normalize rows to match headers length - handle both array and object formats
  const normalizedRows = rows?.map((row) => {
    // If row is already an array, use it
    if (Array.isArray(row)) {
      const normalizedRow = [...row];
      // Pad or truncate to match headers length
      while (normalizedRow.length < tableHeaders.length) {
        normalizedRow.push("");
      }
      return normalizedRow.slice(0, tableHeaders.length);
    } 
    // If row is an object, convert it to array based on column keys
    else if (row && typeof row === 'object') {
      return tableHeaders.map((header: any) => {
        const key = typeof header === 'string' ? header : (header?.key || header?.label);
        return row[key] !== undefined ? row[key] : '';
      });
    }
    // Fallback to empty array
    return Array(tableHeaders.length).fill("");
  }) || [];

  // Convert headers to strings (handle both string and object formats)
  const getHeaderString = (header: any): string => {
    if (typeof header === 'string') {
      return header;
    } else if (header && typeof header === 'object') {
      // Handle {key, label} format
      return header.label || header.key || String(header);
    }
    return String(header || '');
  };

  // Clean empty headers and convert objects to strings
  const cleanHeaders = tableHeaders
    .map(h => getHeaderString(h))
    .filter(h => h && h.trim());
  
  if (cleanHeaders.length === 0) return null;

  // Build header background classes
  const getHeaderBackgroundClasses = () => {
    if (headerBackgroundColor) {
      return `bg-[${headerBackgroundColor}]`;
    }
    // Use selected color gradient
    return `bg-gradient-to-r from-[${colorClasses.from}] to-[${colorClasses.to}]`;
  };

  // Build header classes - Ultra compact for NO scrolling
  const headerClasses = [
    getHeaderBackgroundClasses(),
    headerTextColor,
    `font-${headerFontWeight}`,
    "text-center",
    "border-r border-white/30",
    headerUppercase && "uppercase",
    "tracking-tight",
    "last:border-r-0",
    headerClassName,
  ].filter(Boolean).join(" ");

  // Build cell classes - Compact for perfect compression
  const cellClasses = [
    cellTextColor,
    "text-center",
    "border-r border-gray-200",
    "last:border-r-0",
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

  // Build wrapper classes - Always 100% width, comfortable spacing
  const wrapperClasses = [
    "dynamic-table-wrapper",
    "w-full",
    marginBottom || "mb-6",
    tableWrapperClassName,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={`${wrapperClasses} relative px-4 py-3`} style={style}>
      {/* Action Buttons - Top Right */}
      {editable && (
        <div className="absolute -top-1 right-2 flex gap-2 no-pdf-export">
          {/* Edit Button (Color Picker) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border border-blue-200 hover:border-blue-300"
              title="Edit table settings"
              aria-label="Edit table settings"
            >
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            
            {/* Edit Settings Modal - Fixed Center Popup */}
            {showColorPicker && (
              <>
                {/* Backdrop Overlay */}
                <div 
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                  onClick={() => setShowColorPicker(false)}
                ></div>
                
                {/* Modal Content */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div 
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close Button */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        Table Settings
                      </div>
                      <button
                        onClick={() => setShowColorPicker(false)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                        aria-label="Close modal"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                <div className="mb-6">
                  <div className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Professional Table Colors
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'green', label: 'Nature Green', bg: 'bg-[#A4C639]', accent: '#BEF264' },
                      { value: 'dark-blue', label: 'Ocean Blue', bg: 'bg-[#1E3A8A]', accent: '#3B82F6' },
                      { value: 'dark-red', label: 'Ruby Red', bg: 'bg-[#991B1B]', accent: '#EF4444' },
                      { value: 'black', label: 'Carbon Black', bg: 'bg-[#1F2937]', accent: '#6B7280' },
                      { value: 'purple', label: 'Royal Purple', bg: 'bg-[#7C3AED]', accent: '#A78BFA' },
                      { value: 'teal', label: 'Emerald Teal', bg: 'bg-[#0D9488]', accent: '#2DD4BF' },
                      { value: 'orange', label: 'Sunset Orange', bg: 'bg-[#EA580C]', accent: '#FB923C' },
                      { value: 'indigo', label: 'Midnight Indigo', bg: 'bg-[#4338CA]', accent: '#8B5CF6' },
                      { value: 'emerald', label: 'Forest Emerald', bg: 'bg-[#059669]', accent: '#34D399' },
                      { value: 'pink', label: 'Blossom Pink', bg: 'bg-[#EC4899]', accent: '#F9A8D4' }
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setSelectedColor(color.value as any);
                          if (onBackgroundColorChange) {
                            onBackgroundColorChange(color.value as any);
                          }
                        }}
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 hover:scale-105 transform ${
                          selectedColor === color.value 
                            ? 'ring-3 ring-blue-500 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl scale-105' 
                            : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg'
                        }`}
                        style={{
                          boxShadow: selectedColor === color.value 
                            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 3px rgb(59 130 246 / 0.5)'
                            : ''
                        }}
                      >
                        <div className="relative">
                          <div 
                            className={`w-12 h-8 rounded-xl ${color.bg} border-3 border-white shadow-lg relative overflow-hidden`}
                            style={{
                              background: `linear-gradient(135deg, ${color.bg.replace('bg-[', '').replace(']', '')}, ${color.accent})`
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                          </div>
                          {selectedColor === color.value && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* Add/Remove Columns */}
                <div className="mb-4">
                  <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Columns
                  </div>
                  <div className="flex gap-2">
                    {onAddColumn && (
                      <button
                        onClick={() => {
                          onAddColumn();
                          setShowColorPicker(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-semibold text-green-700">Add</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Add/Remove Rows */}
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Rows
                  </div>
                  <div className="flex gap-2">
                    {onAddRow && (
                      <button
                        onClick={() => {
                          onAddRow();
                          setShowColorPicker(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-semibold text-purple-700">Add</span>
                      </button>
                    )}
                  </div>
                </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group bg-gradient-to-br from-red-50 to-red-100 shadow-md border border-red-200 hover:border-red-300"
              title="Delete table"
              aria-label="Delete this table"
            >
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {onDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={onDelete}
          title="Delete Table"
          message="Are you sure you want to delete this table? This action cannot be undone."
        />
      )}
      
      {/* Table Title - Compact */}
      {showTitle && title && (
        <div className="mb-4">
          <h3 
            className={`text-base font-bold text-gray-900 ${editable ? 'cursor-text hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg px-2 py-1 transition-all duration-200 inline-block' : ''}`}
            contentEditable={editable}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (editable && onTitleChange) {
                onTitleChange(e.currentTarget.textContent || '');
              }
            }}
            onClick={(e) => {
              if (editable && e.currentTarget !== document.activeElement) {
                e.currentTarget.focus();
              }
            }}
          >
            {title}
          </h3>
        </div>
      )}

      {/* Responsive Table Container - Enhanced Professional Styling */}
      <div className="responsive-table-container relative">
        <div className={`w-full rounded-2xl border-2 ${colorClasses.border} shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden`}
             style={{
               background: `linear-gradient(145deg, ${colorClasses.accent}08, ${colorClasses.from}05)`,
               backdropFilter: 'blur(10px)'
             }}>
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, ${colorClasses.from} 1px, transparent 0)`,
                 backgroundSize: '20px 20px'
               }}></div>
          
          <table className="dynamic-table w-full border-collapse rounded-2xl relative z-10" style={{ tableLayout: 'fixed' }}>
          {/* Table Header - Enhanced Professional Design */}
          <thead>
            <tr style={{ 
                background: `linear-gradient(135deg, ${colorClasses.from} 0%, ${colorClasses.to} 50%, ${colorClasses.accent} 100%)`,
                boxShadow: `0 4px 6px -1px ${colorClasses.from}40`
              }}>
              {cleanHeaders.map((header, index) => (
                  <th
                    key={index}
                  className="text-white font-bold text-center border-r border-white/30 tracking-tight last:border-r-0 relative group backdrop-blur-sm"
                  style={{ 
                    fontSize: '9px',
                    lineHeight: '1.2',
                    padding: '6px 4px',
                    verticalAlign: 'middle',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Subtle header accent */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Delete Column Button */}
                  {editable && onRemoveColumn && cleanHeaders.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveColumn(index);
                      }}
                      className="absolute -top-6 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg  no-pdf-export"
                      title="Delete this column"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div 
                    className={`wrap-break-word hyphens-auto ${editable ? 'cursor-text hover:bg-white/20 rounded-md px-1.5 py-1 transition-all duration-200' : ''}`}
                    style={{ wordBreak: 'break-word' }}
                    contentEditable={editable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      if (editable && onHeaderChange) {
                        onHeaderChange(index, e.currentTarget.textContent || '');
                      }
                    }}
                    onClick={(e) => {
                      if (editable && e.currentTarget !== document.activeElement) {
                        e.currentTarget.focus();
                      }
                    }}
                  >
                    {header || `Col ${index + 1}`}
                  </div>
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body - Enhanced */}
          <tbody>
            {normalizedRows.length > 0 ? (
              normalizedRows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`${
                    rowIndex % 2 === 0 
                      ? 'bg-white/90 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-gray-50/80 to-blue-50/30'
                  } hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/40 transition-all duration-300 group relative`}
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {cleanHeaders.map((_, cellIndex) => {
                    const cell = row[cellIndex];
                    const cellValue = cell !== null && cell !== undefined ? String(cell) : '';
                    
                    return (
                      <td 
                        key={cellIndex} 
                        className={`${cellClasses} ${cellIndex === 0 ? 'relative' : ''}`}
                        style={{ 
                          fontSize: '8px',
                          lineHeight: '1.3',
                          padding: '5px 4px',
                          verticalAlign: 'middle'
                        }}
                      >
                        {/* Delete Row Button - only on first cell */}
                        {cellIndex === 0 && editable && onRemoveRow && normalizedRows.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemoveRow(rowIndex);
                            }}
                            className="absolute -left-6 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg  no-pdf-export"
                            title="Delete this row"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div 
                          className={`wrap-break-word font-medium ${editable ? 'cursor-text hover:bg-blue-50 rounded-md px-1.5 py-1 transition-all duration-200 min-h-[1.2em]' : ''}`}
                          style={{ wordBreak: 'break-word' }}
                          contentEditable={editable}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            if (editable && onCellChange) {
                              onCellChange(rowIndex, cellIndex, e.currentTarget.textContent || '');
                            }
                          }}
                          onClick={(e) => {
                            if (editable && e.currentTarget !== document.activeElement) {
                              e.currentTarget.focus();
                            }
                          }}
                        >
                          {cellValue || '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cleanHeaders.length}
                  className="px-4 py-6 text-center text-gray-400 text-xs"
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default DynamicTableTemplate;

