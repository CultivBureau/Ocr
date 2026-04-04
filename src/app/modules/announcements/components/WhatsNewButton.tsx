"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  listAnnouncements,
  type Announcement,
} from "@/app/modules/announcements/services/AnnouncementsApi";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import WhatsNewPanel from "./WhatsNewPanel";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // refresh every 5 minutes

export default function WhatsNewButton() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch announcements ─────────────────────────────────────────── */
  const fetchAnnouncements = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await listAnnouncements(1, 50);
      setAnnouncements(data.announcements);
      setUnreadCount(data.unread_count);
    } catch {
      /* silently ignore — UX should not break if API fails */
    } finally {
      setHasFetched(true);
    }
  }, [isAuthenticated]);

  /* ── Initial fetch + polling ─────────────────────────────────────── */
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAnnouncements();
    pollerRef.current = setInterval(fetchAnnouncements, POLL_INTERVAL_MS);
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [isAuthenticated, fetchAnnouncements]);

  /* ── Open panel: load fresh data ─────────────────────────────────── */
  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const data = await listAnnouncements(1, 50);
      setAnnouncements(data.announcements);
      setUnreadCount(data.unread_count);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Mark a single announcement as read in local state ──────────── */
  const handleAnnouncementRead = useCallback((id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /* ── Don't render if not authenticated ──────────────────────────── */
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        aria-label={`What's New${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
        title="What's New"
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl
          transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4C639]
          ${isOpen
            ? "bg-[#A4C639]/20 text-[#6b8a1e]"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
      >
        {/* Bell icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {hasFetched && unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
              flex items-center justify-center
              bg-[#A4C639] text-white text-[10px] font-bold rounded-full
              shadow-sm ring-2 ring-white
              animate-[scaleIn_0.3s_ease-out]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Slide-over panel ────────────────────────────────────────── */}
      <WhatsNewPanel
        isOpen={isOpen}
        announcements={announcements}
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onAnnouncementRead={handleAnnouncementRead}
        isSuperAdmin={isSuperAdmin}
      />
    </>
  );
}
