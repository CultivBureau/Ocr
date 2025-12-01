"use client";

import React, { useState, useRef } from "react";
import { useUpload } from "@/app/Hooks/useUpload";

interface UploadFormProps {
  onUploadSuccess?: (filePath: string, filename: string) => void;
  onExtractSuccess?: (data: any) => void;
}

/**
 * Upload Form Component
 * Phase 2: Upload & API Integration
 */
export default function UploadForm({ onUploadSuccess, onExtractSuccess }: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    isUploading,
    isExtracting,
    uploadError,
    extractError,
    status,
    filePath,
    filename,
    extractedData,
    handleUpload,
    handleExtract,
    reset,
  } = useUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    reset(); // Reset previous state when new file is selected
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    // Step 1: Upload
    const uploadResponse = await handleUpload(selectedFile);
    
    if (uploadResponse && uploadResponse.file_path) {
      // Call success callback
      onUploadSuccess?.(uploadResponse.file_path, uploadResponse.filename);
      
      // Step 2: Extract (automatic after upload)
      const extractResponse = await handleExtract(uploadResponse.file_path);
      
      if (extractResponse) {
        onExtractSuccess?.(extractResponse);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    reset();
  };

  const isLoading = isUploading || isExtracting;
  const hasError = uploadError || extractError;
  const isComplete = filePath && extractedData;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* File Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          اختر ملف PDF
        </label>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
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
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Status Message */}
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

      {/* Error Messages */}
      {hasError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900">خطأ</h3>
              <p className="text-sm text-red-700 mt-1">
                {uploadError || extractError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isComplete && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-green-900">تم بنجاح!</h3>
              <p className="text-sm text-green-700 mt-1">
                تم رفع الملف واستخراج المحتوى بنجاح.
                {extractedData && (
                  <span className="block mt-1">
                    {extractedData.sections.length} قسم، {extractedData.tables.length} جدول
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl bg-linear-to-r from-[#A4C639] to-[#8FB02E] px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isUploading ? "جاري الرفع..." : "جاري الاستخراج..."}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>رفع واستخراج</span>
            </>
          )}
        </button>

        {(isComplete || hasError) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-4 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            إعادة تعيين
          </button>
        )}
      </div>
    </form>
  );
}

