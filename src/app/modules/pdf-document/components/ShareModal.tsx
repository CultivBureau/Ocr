"use client";

import React, { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  documentTitle: string;
  onClose: () => void;
  onShare: (emails: string[], isPublic: boolean) => void;
  isLoading?: boolean;
}

export default function ShareModal({
  isOpen,
  documentTitle,
  onClose,
  onShare,
  isLoading = false,
}: ShareModalProps) {
  const [emails, setEmails] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailList = emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);
    onShare(emailList, isPublic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-lg animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A4C639] to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Share Document</h2>
              <p className="text-sm font-medium text-gray-600 mt-0.5">
                Share <span className="font-bold text-[#A4C639]">{documentTitle}</span> with others
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="emails" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Email Addresses
            </label>
            <input
              type="text"
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#A4C639]/30 focus:border-[#A4C639] focus:bg-white transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md"
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="mt-2 text-xs font-medium text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Separate multiple emails with commas
            </p>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-200/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 text-[#A4C639] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#A4C639]/30 focus:border-[#A4C639] transition-all cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#A4C639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Make Public
                </span>
                <p className="text-xs font-medium text-gray-600 mt-1">Anyone with the link can view this document</p>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white font-bold rounded-xl hover:from-[#8FB02E] hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sharing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

