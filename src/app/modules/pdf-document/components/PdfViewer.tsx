"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { exportToPDF, generatePDFBlob, exportToPDFWithProgress } from "../utils/pdfExport";
import PreviewRenderer from "./PreviewRenderer";

interface PdfViewerProps {
  /**
   * JSX code to render and export
   */
  code: string;
  
  /**
   * Values for EditableText components
   */
  values?: Record<string, string>;
  
  /**
   * Callback when values change
   */
  setValue?: (id: string, value: string) => void;
  
  /**
   * Filename for PDF export
   */
  filename?: string;
  
  /**
   * Show export button
   */
  showExportButton?: boolean;
  
  /**
   * Export options
   */
  exportOptions?: {
    format?: "a4" | "letter" | [number, number];
    orientation?: "portrait" | "landscape";
    margin?: number | [number, number, number, number];
    quality?: number;
    scale?: number;
  };
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * PDF Viewer Component
 * Phase 5: Export as PDF
 * 
 * Features:
 * - Preview final version
 * - Export to PDF (client-side)
 * - Download button
 */
export default function PdfViewer({
  code,
  values = {},
  setValue,
  filename = "document",
  showExportButton = true,
  exportOptions = {},
  className = "",
}: PdfViewerProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle value changes
  const handleSetValue = useCallback(
    (id: string, value: string) => {
      if (setValue) {
        setValue(id, value);
      }
    },
    [setValue]
  );

  // Export to PDF
  const handleExport = useCallback(async () => {
    if (!previewRef.current) {
      console.error("Preview element not found");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Convert exportOptions to pdfExport format
      const pdfOptions = {
        format: exportOptions?.format || 'a4',
        orientation: exportOptions?.orientation || 'portrait',
        margin: exportOptions?.margin || 10,
        image: {
          type: 'png' as const,
          quality: exportOptions?.quality || 0.98,
        },
        html2canvas: {
          scale: exportOptions?.scale || 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
      };

      // Export with progress
      await exportToPDFWithProgress(
        previewRef.current,
        filename,
        pdfOptions,
        (progress) => {
          setExportProgress(progress);
        }
      );
      
      // Reset after a moment
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error("Export error:", error);
      setIsExporting(false);
      setExportProgress(0);
      alert(error instanceof Error ? error.message : "فشل تصدير PDF");
    }
  }, [filename, exportOptions]);

  // Generate preview PDF blob (for preview before download)
  const handlePreviewPDF = useCallback(async () => {
    if (!previewRef.current) {
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Convert exportOptions to pdfExport format
      const pdfOptions = {
        format: exportOptions?.format || 'a4',
        orientation: exportOptions?.orientation || 'portrait',
        margin: exportOptions?.margin || 10,
        image: {
          type: 'png' as const,
          quality: exportOptions?.quality || 0.98,
        },
        html2canvas: {
          scale: exportOptions?.scale || 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
      };

      setExportProgress(30);
      const url = await generatePDFBlob(previewRef.current, pdfOptions);
      setPreviewUrl(url);
      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error("Preview PDF error:", error);
      setIsExporting(false);
      setExportProgress(0);
      alert(error instanceof Error ? error.message : "فشل إنشاء معاينة PDF");
    }
  }, [filename, exportOptions]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`pdf-viewer flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      {showExportButton && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">معاينة نهائية</h2>
            {isExporting && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-[#A4C639] border-t-transparent rounded-full animate-spin"></div>
                <span>جاري التصدير... {exportProgress}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Preview PDF Button */}
            <button
              onClick={handlePreviewPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isExporting && previewUrl === null ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>معاينة PDF</span>
                </>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-[#A4C639] text-white rounded-lg text-sm font-semibold hover:bg-[#8FB02E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التصدير...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>تصدير PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview PDF Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">معاينة PDF</h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border border-gray-200 rounded"
                title="PDF Preview"
              />
              <div className="mt-4 flex justify-end gap-3">
                <a
                  href={previewUrl}
                  download={`${filename}.pdf`}
                  className="px-4 py-2 bg-[#A4C639] text-white rounded-lg text-sm font-semibold hover:bg-[#8FB02E] transition-colors"
                >
                  تحميل PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div
        ref={previewRef}
        className="flex-1 overflow-auto bg-white p-8"
        style={{
          width: "210mm", // A4 width
          minHeight: "297mm", // A4 height
          margin: "0 auto",
        }}
      >
        <div className="preview-content max-w-full">
          <PreviewRenderer code={code} values={values} setValue={handleSetValue} />
        </div>
      </div>

      {/* Export Options Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 text-xs text-gray-500">
          <span>Format: {exportOptions.format || "a4"}</span>
          <span className="mx-2">|</span>
          <span>Orientation: {exportOptions.orientation || "portrait"}</span>
          <span className="mx-2">|</span>
          <span>Margin: {exportOptions.margin || 10}mm</span>
        </div>
      )}
    </div>
  );
}

