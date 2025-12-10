"use client";

import React, { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PreviewEditor from "./PreviewEditor";
import PdfViewer from "@/app/components/PdfViewer";
import { codeReducer, initialCodeState } from "@/app/Store/codeSlice";
import { generateJsx } from "@/app/services/PdfApi";
import type { Structure } from "@/app/types/ExtractTypes";
import AirplaneSectionModal, { type AirplaneSectionData } from "@/app/components/AirplaneSectionModal";
import HotelsSectionModal, { type HotelsSectionData } from "@/app/components/HotelsSectionModal";
import { insertAirplaneSection, insertHotelsSection } from "@/app/utils/sectionInserter";

/**
 * Preview Page
 * Phase 4 & 5: JSX Code Generation Preview & Export as PDF
 * 
 * Features:
 * - Display generated JSX code from GPT
 * - Syntax highlighting
 * - User can edit code manually
 * - Live preview of final JSX
 * - Export to PDF
 */
export default function PreviewPage() {
  const router = useRouter();
  const [codeState, dispatch] = useReducer(codeReducer, initialCodeState);
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"editor" | "pdf">("editor");
  const [values, setValues] = useState<Record<string, string>>({});
  const [airplaneModalOpen, setAirplaneModalOpen] = useState(false);
  const [hotelsModalOpen, setHotelsModalOpen] = useState(false);

  // Load extracted data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const extractedDataStr = sessionStorage.getItem("extract.data");
      if (extractedDataStr) {
        try {
          const extractedData = JSON.parse(extractedDataStr);
          setStructure({
            sections: extractedData.sections || [],
            tables: extractedData.tables || [],
            meta: extractedData.meta || {},
          });
        } catch (error) {
          console.error("Error parsing extracted data:", error);
        }
      }
    }
  }, []);

  // Generate JSX from structure
  const handleGenerateJSX = async () => {
    if (!structure) {
      setGenerationError("لا توجد بيانات للتحويل");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await generateJsx(structure);
      
      if (response.jsxCode) {
        dispatch({ type: "SET_ORIGINAL_CODE", payload: response.jsxCode });
        dispatch({
          type: "SET_GENERATION_METADATA",
          payload: {
            generatedAt: new Date(),
            metadata: response.metadata || {},
          },
        });
      } else {
        throw new Error("لم يتم إرجاع كود JSX");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل توليد JSX";
      setGenerationError(message);
      console.error("JSX generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate JSX if structure exists and no code yet
  useEffect(() => {
    if (structure && !codeState.jsxCode && !isGenerating) {
      handleGenerateJSX();
    }
  }, [structure]);

  const handleCodeChange = (code: string) => {
    dispatch({ type: "UPDATE_CODE", payload: code });
  };

  const handleSave = (code: string) => {
    // Save to sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("preview.code", code);
    }
    console.log("Code saved:", code);
  };

  const handleSetValue = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleAirplaneSectionSubmit = (data: AirplaneSectionData) => {
    const currentCode = codeState.jsxCode || "";
    const updatedCode = insertAirplaneSection(currentCode, data);
    dispatch({ type: "UPDATE_CODE", payload: updatedCode });
    setAirplaneModalOpen(false);
  };

  const handleHotelsSectionSubmit = (data: HotelsSectionData) => {
    const currentCode = codeState.jsxCode || "";
    const updatedCode = insertHotelsSection(currentCode, data);
    dispatch({ type: "UPDATE_CODE", payload: updatedCode });
    setHotelsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">معاينة الكود</p>
                <p className="text-xs text-gray-500">المرحلة 4 & 5: التوليد والتصدير</p>
              </div>
              <Link
                href="/upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-md text-sm"
              >
                رفع ملف جديد
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Mode Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("editor")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-[#A4C639] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              محرر الكود
            </button>
            <button
              onClick={() => setViewMode("pdf")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "pdf"
                  ? "bg-[#A4C639] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              معاينة PDF
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <button
              onClick={() => setAirplaneModalOpen(true)}
              className="px-4 py-2 bg-[#4A5568] text-white rounded-lg font-medium hover:bg-[#2D3748] transition-colors shadow-md text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
                />
              </svg>
              إضافة قسم الطيران
            </button>
            <button
              onClick={() => setHotelsModalOpen(true)}
              className="px-4 py-2 bg-[#3B5998] text-white rounded-lg font-medium hover:bg-[#2E4A7A] transition-colors shadow-md text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z"
                />
                <path
                  fillRule="evenodd"
                  d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.007zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z"
                  clipRule="evenodd"
                />
              </svg>
              إضافة قسم الفنادق
            </button>
          </div>

          {/* Generation Status */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-[#A4C639] border-t-transparent rounded-full animate-spin"></div>
              <span>جاري توليد JSX...</span>
            </div>
          )}

          {generationError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {generationError}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          {viewMode === "editor" ? (
            <PreviewEditor
              initialCode={codeState.jsxCode}
              onCodeChange={handleCodeChange}
              onSave={handleSave}
              showToolbar={true}
            />
          ) : (
            <PdfViewer
              code={codeState.jsxCode || ""}
              values={values}
              setValue={handleSetValue}
              filename="document"
              showExportButton={true}
              exportOptions={{
                format: "a4",
                orientation: "portrait",
                margin: 10,
                quality: 0.98,
                scale: 2,
              }}
            />
          )}
        </div>

        {/* Info Section */}
        {codeState.generationMetadata && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">معلومات التوليد</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-700">
              <div>
                <span className="font-medium">النموذج:</span>{" "}
                {codeState.generationMetadata.model || "غير محدد"}
              </div>
              <div>
                <span className="font-medium">الوقت:</span>{" "}
                {codeState.generatedAt?.toLocaleTimeString("ar") || "غير محدد"}
              </div>
              <div>
                <span className="font-medium">المكونات:</span>{" "}
                {codeState.usedComponents.length}
              </div>
              <div>
                <span className="font-medium">الحالة:</span>{" "}
                {codeState.isValid ? "✓ صحيح" : "✗ أخطاء"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AirplaneSectionModal
        isOpen={airplaneModalOpen}
        onClose={() => setAirplaneModalOpen(false)}
        onSubmit={handleAirplaneSectionSubmit}
      />
      <HotelsSectionModal
        isOpen={hotelsModalOpen}
        onClose={() => setHotelsModalOpen(false)}
        onSubmit={handleHotelsSectionSubmit}
      />
    </div>
  );
}

