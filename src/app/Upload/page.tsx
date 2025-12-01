"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import UploadForm from "./uploadForm";

/**
 * Upload Page
 * Phase 2: Upload & API Integration
 * 
 * Features:
 * - Upload PDF file
 * - Extract content (sections & tables)
 * - Display results
 * - Navigate to preview after extraction
 */
export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = (filePath: string, filename: string) => {
    console.log("Upload successful:", { filePath, filename });
    // Store file info in sessionStorage for next steps
    if (typeof window !== "undefined") {
      sessionStorage.setItem("upload.filePath", filePath);
      sessionStorage.setItem("upload.filename", filename);
    }
  };

  const handleExtractSuccess = (data: any) => {
    console.log("Extract successful:", data);
    // Store extracted data in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("extract.data", JSON.stringify(data));
      sessionStorage.setItem("extract.sectionsCount", String(data.sections?.length || 0));
      sessionStorage.setItem("extract.tablesCount", String(data.tables?.length || 0));
    }
    
    // Optional: Auto-navigate to preview after extraction
    // router.push("/preview");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-lime-50">
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
                <p className="text-sm font-semibold text-gray-900">رفع واستخراج PDF</p>
                <p className="text-xs text-gray-500">المرحلة 2: رفع الملفات</p>
              </div>
              <Link 
                href="/preview"
                className="px-4 py-2 bg-[#A4C639] text-white rounded-lg font-medium hover:bg-[#8FB02E] transition-colors shadow-md text-sm"
              >
                معاينة الكود
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <div className="w-2 h-2 bg-[#A4C639] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">المرحلة 2: رفع واستخراج</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            رفع ملف PDF
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            قم برفع ملف PDF الخاص بك وسيتم استخراج المحتوى تلقائياً (الأقسام والجداول)
          </p>
        </div>

        {/* Upload Form */}
        <div className="w-full rounded-2xl bg-white p-10 shadow-2xl ring-1 ring-gray-200 border-t-4 border-[#A4C639]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                رفع الملف
              </h2>
              <p className="text-sm text-gray-600">
                الصيغ المدعومة: PDF فقط
              </p>
            </div>
          </div>

          <UploadForm
            onUploadSuccess={handleUploadSuccess}
            onExtractSuccess={handleExtractSuccess}
          />

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">رفع الملف</p>
                  <p className="text-xs text-gray-600">إلى الخادم</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">استخراج المحتوى</p>
                  <p className="text-xs text-gray-600">أقسام وجداول</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">جاهز للمعالجة</p>
                  <p className="text-xs text-gray-600">الخطوة التالية</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-gray-500 max-w-md">
          يتم معالجة ملفاتك بأمان. بعد الاستخراج، يمكنك المتابعة إلى معاينة الكود.
        </p>
      </div>
    </div>
  );
}

