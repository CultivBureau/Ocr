"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  uploadFile, 
  generateNextJs, 
  repairTable, 
  tableToJsx, 
  validateAndFixJsx 
} from "../../services/PdfApi";

/**
 * Extract table data from extracted text
 * Looks for TABLE_START markers and extracts table structure
 */
function extractTablesFromText(text: string): Array<{
  tableId: string;
  metadata: { rows: number; columns: number };
  header: string[];
  rows: string[][];
}> {
  const tables: Array<{
    tableId: string;
    metadata: { rows: number; columns: number };
    header: string[];
    rows: string[][];
  }> = [];

  // Find all table start markers
  const tableStartRegex = /--- TABLE START (\d+) ---/g;
  const tableEndRegex = /--- TABLE END (\d+) ---/g;
  
  let match;
  const tableStarts: Array<{ num: number; index: number }> = [];
  const tableEnds: Array<{ num: number; index: number }> = [];

  while ((match = tableStartRegex.exec(text)) !== null) {
    tableStarts.push({ num: parseInt(match[1]), index: match.index });
  }

  while ((match = tableEndRegex.exec(text)) !== null) {
    tableEnds.push({ num: parseInt(match[1]), index: match.index });
  }

  // Process each table
  for (const start of tableStarts) {
    const end = tableEnds.find(e => e.num === start.num);
    if (!end) continue;

    const tableText = text.substring(start.index, end.index + end.num.toString().length + 15);
    
    // Extract metadata
    const metadataMatch = tableText.match(/TABLE_METADATA:\s*rows=(\d+),\s*columns=(\d+)/);
    if (!metadataMatch) continue;

    const rows = parseInt(metadataMatch[1]);
    const columns = parseInt(metadataMatch[2]);

    // Extract header
    const headerMatch = tableText.match(/TABLE_HEADER:\s*([\s\S]+?)(?:\n|TABLE_ROW|TABLE_END)/);
    if (!headerMatch) continue;

    const header = headerMatch[1]
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    // Extract rows
    const rowRegex = /TABLE_ROW\s+(\d+):\s*([\s\S]+?)(?:\n|TABLE_ROW|TABLE_END)/g;
    const tableRows: string[][] = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableText)) !== null) {
      const rowData = rowMatch[2]
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (rowData.length > 0) {
        tableRows.push(rowData);
      }
    }

    if (header.length > 0 && tableRows.length > 0) {
      tables.push({
        tableId: `table_${start.num}`,
        metadata: { rows, columns },
        header,
        rows: tableRows,
      });
    }
  }

  return tables;
}

/**
 * Convert extracted table to raw_cells format for repairTable API
 */
function tableToRawCells(
  table: {
    tableId: string;
    metadata: { rows: number; columns: number };
    header: string[];
    rows: string[][];
  }
): Array<{ row: number; col: number; text: string; confidence?: number }> {
  const cells: Array<{ row: number; col: number; text: string; confidence?: number }> = [];

  // Add header row (row 0)
  table.header.forEach((text, col) => {
    cells.push({
      row: 0,
      col,
      text,
      confidence: 0.95,
    });
  });

  // Add data rows
  table.rows.forEach((rowData, rowIndex) => {
    rowData.forEach((text, col) => {
      cells.push({
        row: rowIndex + 1,
        col,
        text,
        confidence: 0.90,
      });
    });
  });

  return cells;
}

const PdfConverter: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please choose a PDF before submitting.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setStatus("Uploading file…");

      const uploadResponse = await uploadFile(selectedFile);
      const extractedText = uploadResponse.extracted_text;
      if (!extractedText) {
        throw new Error("Extraction returned empty text.");
      }

      // Extract and process tables if present
      const extractedTables = extractTablesFromText(extractedText);
      const processedTables: Array<{ tableId: string; jsx: string }> = [];

      if (extractedTables.length > 0) {
        setStatus(`Processing ${extractedTables.length} table(s)…`);
        
        for (const table of extractedTables) {
          try {
            // Convert to raw_cells format
            const rawCells = tableToRawCells(table);
            
            // Repair the table
            const repairData = {
              table_id: table.tableId,
              page: 1,
              detected_columns: table.metadata.columns,
              raw_cells: rawCells,
              notes: `Extracted from PDF with ${table.metadata.rows} rows and ${table.metadata.columns} columns`,
              max_retries: 2,
            };

            setStatus(`Repairing table ${table.tableId}…`);
            const repaired = await repairTable(repairData) as {
              success: boolean;
              table_id: string;
              columns: number;
              header_row_index: number;
              rows: Array<Array<{
                text: string;
                colspan: number;
                rowspan: number;
                confidence: number;
              }>>;
              issues: Array<{ type: string; description: string }>;
            };
            
            if (repaired.success && repaired.rows.length > 0) {
              // Convert to JSX
              setStatus(`Converting table ${table.tableId} to JSX…`);
              const jsxResponse = await tableToJsx({
                table_id: repaired.table_id,
                columns: repaired.columns,
                header_row_index: repaired.header_row_index,
                rows: repaired.rows.map((row: Array<{ text: string; colspan: number; rowspan: number; confidence: number }>) => 
                  row.map((cell: { text: string; colspan: number; rowspan: number; confidence: number }) => ({
                    text: cell.text,
                    colspan: cell.colspan,
                    rowspan: cell.rowspan,
                    confidence: cell.confidence,
                  }))
                ),
                issues: repaired.issues,
              }) as { success: boolean; jsx: string; warnings: string[] };

              if (jsxResponse.jsx) {
                // Validate and fix JSX if needed
                const validated = await validateAndFixJsx(jsxResponse.jsx) as {
                  jsx: string;
                  warnings: string[];
                  fixed: boolean;
                };
                processedTables.push({
                  tableId: table.tableId,
                  jsx: validated.jsx,
                });
              }
            }
          } catch (tableError) {
            console.warn(`Failed to process table ${table.tableId}:`, tableError);
            // Continue with other tables
          }
        }
      }

      setStatus("Generating component from extracted text…");
      const nextJsResponse = await generateNextJs(extractedText);
      let generatedCode = nextJsResponse.code?.code;
      if (!generatedCode) {
        throw new Error("Generation returned empty code.");
      }

      // If we have processed tables, we could merge them into the code
      // For now, the backend should handle tables in the extracted text
      // But we store processed tables in sessionStorage for potential future use
      if (processedTables.length > 0 && typeof window !== "undefined") {
        sessionStorage.setItem(
          "codePreview.processedTables",
          JSON.stringify(processedTables)
        );
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("codePreview.initialCode", generatedCode);
        sessionStorage.setItem(
          "codePreview.warnings",
          JSON.stringify(nextJsResponse.validation_warnings || []),
        );
        sessionStorage.setItem(
          "codePreview.metadata",
          JSON.stringify({
            filename: uploadResponse.filename || selectedFile.name,
            uploadedAt: new Date().toISOString(),
          }),
        );
      }

      setStatus("Opening editor…");
      router.push("/pages/CodePreview");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-lime-50">
      {/* Header with Logo and Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <Image
                src="/logoHappylife.jpg"
                alt="HappyLife Travel & Tourism"
                width={150}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">PDF to Template Converter</p>
                <p className="text-xs text-gray-500">Upload & Transform</p>
              </div>
              <Link 
                href="/pages/CodePreview"
                className="px-4 py-2 bg-[#A4C639] text-white rounded-lg font-medium hover:bg-[#8FB02E] transition-colors shadow-md text-sm"
              >
                Open Editor
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <div className="w-2 h-2 bg-[#A4C639] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">AI-Powered Template Generation</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Transform Your Documents
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDF, Word, or text files and watch them transform into editable, professional templates
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white p-10 shadow-2xl ring-1 ring-gray-200 border-t-4 border-[#A4C639]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Upload Your Document
              </h2>
              <p className="text-sm text-gray-600">
                Supported formats: PDF, DOCX, TXT
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#A4C639] file:text-white
                    hover:file:bg-[#8FB02E]
                    file:cursor-pointer file:transition-colors
                    cursor-pointer
                    border-2 border-dashed border-gray-300 rounded-xl
                    p-4 bg-gray-50
                    hover:border-[#A4C639] hover:bg-lime-50
                    focus:outline-none focus:ring-2 focus:ring-[#A4C639] focus:border-transparent
                    transition-all"
                />
                {selectedFile && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-lime-50 p-3 rounded-lg border border-lime-200">
                    <svg className="w-5 h-5 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {status && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-blue-900">{status}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-linear-to-r from-[#A4C639] to-[#8FB02E] px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload & Generate Template</span>
                </>
              )}
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">AI Extraction</p>
                  <p className="text-xs text-gray-600">Smart content analysis</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Live Editing</p>
                  <p className="text-xs text-gray-600">Real-time preview</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Export Ready</p>
                  <p className="text-xs text-gray-600">Code or PDF format</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-gray-500 max-w-md">
          Your documents are processed securely. Generated templates can be further customized in the live editor after processing.
        </p>
      </div>
    </div>
  );
};

export default PdfConverter;
