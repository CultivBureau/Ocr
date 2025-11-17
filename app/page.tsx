"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-lime-50">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logoHappylife.jpg"
              alt="HappyLife Travel & Tourism"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">PDF Template Generator</p>
            <p className="text-xs text-gray-500">Professional Document Solutions</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-[#A4C639]">HappyLife</span> Template Studio
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create, edit, and export professional travel packages and documents with our advanced PDF template generator
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Link 
              href="/pages/CodePreview" 
              className="group block rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:border-[#A4C639] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4C639]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-md">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Code Editor</h2>
                </div>
                <p className="text-gray-600 mb-4 grow">
                  Open the live React + Tailwind template editor. Design and customize your travel packages with real-time preview.
                </p>
                <div className="flex items-center text-[#A4C639] font-semibold group-hover:gap-3 transition-all">
                  <span>Start Editing</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/pages/PdfConverter"
              className="group block rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:border-orange-400 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">PDF Upload</h2>
                </div>
                <p className="text-gray-600 mb-4 grow">
                  Upload a PDF document and let AI transform it into an editable template. Extract content and preview with live editing capabilities.
                </p>
                <div className="flex items-center text-orange-500 font-semibold group-hover:gap-3 transition-all">
                  <span>Upload Document</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-xl">
              <div className="w-12 h-12 bg-[#A4C639] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
              <p className="text-sm text-gray-600">Generate templates in seconds with AI-powered extraction</p>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Preview</h3>
              <p className="text-sm text-gray-600">See changes in real-time as you edit your templates</p>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Export</h3>
              <p className="text-sm text-gray-600">Download as code or PDF with one click</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Image
              src="/logoHappylife.jpg"
              alt="HappyLife"
              width={120}
              height={40}
              className="object-contain opacity-75"
            />
            <span>•</span>
            <span>Professional Travel Document Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
