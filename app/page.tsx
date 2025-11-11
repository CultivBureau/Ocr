"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Choose what to do</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/pages/CodePreview" className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Add Code</h2>
                <p className="mt-1 text-sm text-gray-600">Open the live React + Tailwind template editor.</p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">→</span>
            </div>
          </Link>

          <Link
            href="/pages/PdfConverter"
            className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">API Playground</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Upload a PDF, call OpenAI endpoints, and preview JSX output with live editing.
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
