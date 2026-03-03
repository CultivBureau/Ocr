"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Announcement,
  ANNOUNCEMENT_TYPE_COLORS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_LABELS,
  markAnnouncementRead,
} from "../services/AnnouncementsApi";

interface WhatsNewPanelProps {
  announcements: Announcement[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementRead: (id: string) => void;
  /** true when the current user is a super admin */
  isSuperAdmin?: boolean;
}

export default function WhatsNewPanel({
  announcements,
  isLoading,
  isOpen,
  onClose,
  onAnnouncementRead,
  isSuperAdmin = false,
}: WhatsNewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Close on outside click ─────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  /* ── Close on Escape ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* ── Mark as read when card is visible ──────────────────────────── */
  const handleMarkRead = useCallback(
    async (id: string, is_read: boolean) => {
      if (is_read) return;
      try {
        await markAnnouncementRead(id);
        onAnnouncementRead(id);
      } catch {
        /* silently ignore */
      }
    },
    [onAnnouncementRead]
  );

  /* ── Auto-mark all visible unread items when panel opens ────────── */
  useEffect(() => {
    if (!isOpen) return;
    // Small delay so items have rendered
    const timer = setTimeout(() => {
      announcements
        .filter((a) => !a.is_read)
        .forEach((a) => handleMarkRead(a.id, false));
    }, 600);
    return () => clearTimeout(timer);
  }, [isOpen, announcements, handleMarkRead]);

  const unreadCount = announcements.filter((a) => !a.is_read).length;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ── Panel ────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="What's New"
        className={`fixed right-0 top-0 h-max w-full max-w-sm z-50 flex flex-col
          bg-white shadow-2xl border-l border-gray-100
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#A4C639]/10 to-emerald-50">
          <div className="flex items-center gap-3">
            {/* Bureau OCR accent dot */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A4C639] to-emerald-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">What&apos;s New</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-[#A4C639] font-semibold">
                  {unreadCount} unread update{unreadCount > 1 ? "s" : ""}
                </p>
              )}
              {unreadCount === 0 && (
                <p className="text-xs text-gray-400">You&apos;re all caught up!</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <LoadingSkeleton />
          ) : announcements.length === 0 ? (
            <EmptyState />
          ) : (
            announcements.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                isSuperAdmin={isSuperAdmin}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-center text-gray-400">
            Bureau OCR · Updates &amp; Release Notes
          </p>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Announcement Card
───────────────────────────────────────────────────────────────────────────── */

function AnnouncementCard({
  announcement,
  isSuperAdmin,
}: {
  announcement: Announcement;
  isSuperAdmin: boolean;
}) {
  const { bg, text, border, dot } = ANNOUNCEMENT_TYPE_COLORS[announcement.type];
  const icon = ANNOUNCEMENT_TYPE_ICONS[announcement.type];
  const label = ANNOUNCEMENT_TYPE_LABELS[announcement.type];
  const isUnread = !announcement.is_read;

  return (
    <article
      className={`relative rounded-2xl border p-4 transition-all duration-200 hover:shadow-md
        ${isUnread ? "bg-white border-[#A4C639]/30 shadow-sm ring-1 ring-[#A4C639]/20" : "bg-gray-50/70 border-gray-100"}
      `}
    >
      {/* Unread indicator bar */}
      {isUnread && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#A4C639] block" />
      )}

      {/* Draft badge (superadmin only) */}
      {isSuperAdmin && !announcement.is_published && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
          Draft
        </span>
      )}

      <div className={`${isUnread ? "pl-3" : ""}`}>
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {icon} {label}
          </span>
          {isUnread && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A4C639] uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A4C639] animate-pulse" />
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-snug mb-1.5 ${isUnread ? "text-gray-900" : "text-gray-600"}`}>
          {announcement.title}
        </h3>

        {/* Content */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 whitespace-pre-line">
          {announcement.content}
        </p>

        {/* Date */}
        <p className="mt-2 text-[10px] text-gray-400">
          {announcement.published_at
            ? formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })
            : formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
        </p>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 p-4 animate-pulse">
          <div className="h-5 w-24 bg-gray-200 rounded-full mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-full bg-gray-100 rounded mb-1" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
        </div>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A4C639]/20 to-emerald-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#A4C639]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">No updates yet</h3>
      <p className="text-xs text-gray-400 max-w-[200px]">
        New features and improvements will appear here.
      </p>
    </div>
  );
}
