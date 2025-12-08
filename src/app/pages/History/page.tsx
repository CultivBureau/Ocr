"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { useHistory } from "@/app/contexts/HistoryContext";
import {
  deleteDocument,
  updateDocument,
  shareDocument,
  exportDocument,
  type Document,
} from "@/app/services/HistoryApi";
import DocumentCard from "@/app/components/DocumentCard";
import RenameModal from "@/app/components/RenameModal";
import ShareModal from "@/app/components/ShareModal";
import HistoryFilters from "@/app/components/HistoryFilters";
import HistorySort from "@/app/components/HistorySort";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Loading from "@/app/components/Loading";

function HistoryPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    documents,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    getFilteredDocuments,
    refreshDocuments,
  } = useHistory();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean;
    docId: string;
    currentTitle: string;
  }>({ isOpen: false, docId: "", currentTitle: "" });
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    docId: string;
    title: string;
  }>({ isOpen: false, docId: "", title: "" });
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);
  
  // Refresh documents when needed
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);
  
  // Get filtered documents
  const filteredDocuments = getFilteredDocuments();

  const handleOpen = (docId: string) => {
    // Store document ID and navigate to editor
    router.push(`/pages/CodePreview?docId=${docId}`);
  };

  const handleRename = (docId: string) => {
    const doc = filteredDocuments.find((d) => d.id === docId);
    if (doc) {
      setRenameModal({ isOpen: true, docId, currentTitle: doc.title });
    }
  };

  const handleRenameSubmit = async (newTitle: string) => {
    setIsModalLoading(true);
    try {
      await updateDocument(renameModal.docId, { title: newTitle });
      await refreshDocuments();
      setRenameModal({ isOpen: false, docId: "", currentTitle: "" });
    } catch (err) {
      alert("Failed to rename document");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleShare = (docId: string) => {
    const doc = filteredDocuments.find((d) => d.id === docId);
    if (doc) {
      setShareModal({ isOpen: true, docId, title: doc.title });
    }
  };

  const handleShareSubmit = async (emails: string[], isPublic: boolean) => {
    setIsModalLoading(true);
    try {
      await shareDocument(shareModal.docId, { emails, is_public: isPublic });
      alert("Document shared successfully!");
      await refreshDocuments();
      setShareModal({ isOpen: false, docId: "", title: "" });
    } catch (err) {
      alert("Failed to share document");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocument(docId);
      await refreshDocuments();
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  const handleExport = async (docId: string) => {
    try {
      const doc = filteredDocuments.find((d) => d.id === docId);
      const data = await exportDocument(docId, "json");
      
      // Download JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc?.title || "document"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export document");
    }
  };

  if (isLoading && documents.length === 0) {
    return <Loading message="Loading your documents..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
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
              {user && (
                <span className="text-sm font-medium text-gray-700">Welcome, {user.name}</span>
              )}
              <Link
                href="/pages/PdfConverter"
                className="px-4 py-2 bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 text-sm"
              >
                Upload PDF
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Document History</h1>
              <p className="text-gray-600 mt-1">Manage all your converted documents</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A4C639]/20 focus:border-[#A4C639] transition-all duration-200"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* View Mode & Filter Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                showFilters
                  ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#A4C639]"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </span>
            </button>
            <div className="flex gap-2 bg-white rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters & Sort Panel */}
        {showFilters && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <HistoryFilters />
            <HistorySort />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Documents Count */}
        {filteredDocuments.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing <span className="font-bold text-[#A4C639]">{filteredDocuments.length}</span> of <span className="font-semibold">{documents.length}</span> documents
          </div>
        )}

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={handleOpen}
                onRename={handleRename}
                onShare={handleShare}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? "Try adjusting your search or filters" : "Upload your first PDF to get started"}
            </p>
            {!searchQuery && (
              <Link
                href="/pages/PdfConverter"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                Upload PDF
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RenameModal
        isOpen={renameModal.isOpen}
        currentTitle={renameModal.currentTitle}
        onClose={() => setRenameModal({ isOpen: false, docId: "", currentTitle: "" })}
        onRename={handleRenameSubmit}
        isLoading={isModalLoading}
      />
      <ShareModal
        isOpen={shareModal.isOpen}
        documentTitle={shareModal.title}
        onClose={() => setShareModal({ isOpen: false, docId: "", title: "" })}
        onShare={handleShareSubmit}
        isLoading={isModalLoading}
      />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  );
}

