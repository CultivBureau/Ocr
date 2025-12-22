"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getHistory, type Document, type DocumentListResponse } from "../services/HistoryApi";

interface HistoryContextType {
  // State
  documents: Document[];
  recentDocuments: Document[];
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
  total: number;
  
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  companyFilter: string | null; // Company ID filter (Super Admin only)
  setCompanyFilter: (companyId: string | null) => void;
  filterType: "all" | "recent" | "favorites" | "shared";
  setFilterType: (type: "all" | "recent" | "favorites" | "shared") => void;
  
  // Sorting
  sortBy: "date" | "name" | "size" | "modified";
  sortOrder: "asc" | "desc";
  setSortBy: (by: "date" | "name" | "size" | "modified") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  
  // Actions
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
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "recent" | "favorites" | "shared">("all");
  
  // Sorting
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "modified">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Load favorites from localStorage
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
  
  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && favorites.size > 0) {
      localStorage.setItem("history_favorites", JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);
  
  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("history_sidebar_open");
      if (stored !== null) {
        setIsSidebarOpen(stored === "true");
      } else {
        // Default to open on desktop
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    }
  }, []);
  
  // Save sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("history_sidebar_open", String(isSidebarOpen));
    }
  }, [isSidebarOpen]);
  
  // Fetch documents
  const refreshDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      setRecentDocuments([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Only include company_id filter if user is Super Admin
      const companyId = isSuperAdmin && companyFilter ? companyFilter : undefined;
      const response: DocumentListResponse = await getHistory(1, 100, searchQuery || undefined, companyId);
      setDocuments(response.documents);
      setTotal(response.total);
      
      // Get recent documents (last 10)
      const recent = response.documents
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
      setRecentDocuments(recent);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, companyFilter, isSuperAdmin]);
  
  // Initial load and refresh on auth change
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);
  
  // Toggle favorite
  const toggleFavorite = useCallback((docId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(docId)) {
        newFavorites.delete(docId);
      } else {
        newFavorites.add(docId);
      }
      return newFavorites;
    });
  }, []);
  
  // Get filtered and sorted documents
  const getFilteredDocuments = useCallback((): Document[] => {
    let filtered = [...documents];
    
    // Apply filter type
    if (filterType === "recent") {
      filtered = recentDocuments;
    } else if (filterType === "favorites") {
      filtered = filtered.filter((doc) => favorites.has(doc.id));
    } else if (filterType === "shared") {
      filtered = filtered.filter((doc) => doc.shared_with.length > 0 || doc.is_public);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.original_filename.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "modified":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "size":
          // Use file_path or metadata to estimate size
          const sizeA = a.metadata?.fileSize || 0;
          const sizeB = b.metadata?.fileSize || 0;
          comparison = sizeA - sizeB;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [documents, recentDocuments, favorites, filterType, searchQuery, sortBy, sortOrder]);
  
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

