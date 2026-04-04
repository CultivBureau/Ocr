"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import { getHistory, type Document, type DocumentListResponse } from "../services/HistoryApi";

export const HISTORY_PAGE_SIZE = 20;
const CLIENT_FILTER_BATCH = 500;

function sortDocuments(
  docs: Document[],
  sortBy: "date" | "name" | "size" | "modified",
  sortOrder: "asc" | "desc"
): Document[] {
  const arr = [...docs];
  arr.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "modified":
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case "name":
        comparison = a.title.localeCompare(b.title);
        break;
      case "size":
        comparison = (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
  return arr;
}

interface HistoryContextType {
  documents: Document[];
  recentDocuments: Document[];
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageSize: number;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  companyFilter: string | null;
  setCompanyFilter: (companyId: string | null) => void;
  filterType: "all" | "recent" | "favorites" | "shared";
  setFilterType: (type: "all" | "recent" | "favorites" | "shared") => void;

  sortBy: "date" | "name" | "size" | "modified";
  sortOrder: "asc" | "desc";
  setSortBy: (by: "date" | "name" | "size" | "modified") => void;
  setSortOrder: (order: "asc" | "desc") => void;

  refreshDocuments: () => Promise<void>;
  toggleFavorite: (docId: string) => void;
  getFilteredDocuments: () => Document[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "recent" | "favorites" | "shared">("all");

  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "modified">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = localStorage.getItem("history_favorites");
      if (storedFavorites) {
        try {
          const favArray = JSON.parse(storedFavorites);
          setFavorites(new Set(favArray));
        } catch (e) {
          console.error("Failed to load favorites:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && favorites.size > 0) {
      localStorage.setItem("history_favorites", JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("history_sidebar_open");
      if (stored !== null) {
        setIsSidebarOpen(stored === "true");
      } else {
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("history_sidebar_open", String(isSidebarOpen));
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    setPage(1);
  }, [filterType, searchQuery, companyFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const refreshDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      setRecentDocuments([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const companyId = isSuperAdmin && companyFilter ? companyFilter : undefined;
      const search = searchQuery.trim() || undefined;

      const loadRecentSidebar = async () => {
        try {
          const r: DocumentListResponse = await getHistory(1, 10, search, companyId);
          setRecentDocuments(sortDocuments(r.documents, "date", "desc"));
        } catch {
          /* non-fatal */
        }
      };

      if (filterType === "all") {
        const response: DocumentListResponse = await getHistory(
          page,
          HISTORY_PAGE_SIZE,
          search,
          companyId
        );
        setDocuments(response.documents);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.total_pages));
        await loadRecentSidebar();
      } else {
        const response: DocumentListResponse = await getHistory(
          1,
          CLIENT_FILTER_BATCH,
          search,
          companyId
        );
        let filtered = [...response.documents];

        if (filterType === "favorites") {
          filtered = filtered.filter((doc) => favorites.has(doc.id));
        } else if (filterType === "shared") {
          filtered = filtered.filter((doc) => doc.shared_with.length > 0 || doc.is_public);
        } else if (filterType === "recent") {
          filtered = sortDocuments(filtered, "modified", "desc");
        }

        filtered = sortDocuments(filtered, sortBy, sortOrder);
        const totalFiltered = filtered.length;
        const tp = Math.max(1, Math.ceil(totalFiltered / HISTORY_PAGE_SIZE));
        setTotal(totalFiltered);
        setTotalPages(tp);
        const start = (page - 1) * HISTORY_PAGE_SIZE;
        setDocuments(filtered.slice(start, start + HISTORY_PAGE_SIZE));
        await loadRecentSidebar();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    isSuperAdmin,
    companyFilter,
    searchQuery,
    filterType,
    page,
    favorites,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const toggleFavorite = useCallback((docId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }, []);

  const getFilteredDocuments = useCallback((): Document[] => {
    return sortDocuments(documents, sortBy, sortOrder);
  }, [documents, sortBy, sortOrder]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const value: HistoryContextType = {
    documents,
    recentDocuments,
    favorites,
    isLoading,
    error,
    total,
    page,
    setPage,
    totalPages,
    pageSize: HISTORY_PAGE_SIZE,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    companyFilter,
    setCompanyFilter,
    filterType,
    setFilterType,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    refreshDocuments,
    toggleFavorite,
    getFilteredDocuments,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
