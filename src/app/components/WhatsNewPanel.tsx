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

  /* ── Mark as read ────────────────────────────────────────────────── */
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
    const timer = setTimeout(() => {
      announcements
        .filter((a) => !a.is_read)
        .forEach((a) => handleMarkRead(a.id, false));
    }, 600);
    return () => clearTimeout(timer);
  }, [isOpen, announcements, handleMarkRead]);

  const unreadCount = announcements.filter((a) => !a.is_read).length;
  const totalCount  = announcements.length;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto bg-black/40 backdrop-blur-[3px]"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ── Full-height slide-over panel ─────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="What's New"
        className={`fixed right-0 top-0 h-screen z-50 flex flex-col
          bg-white shadow-2xl border-l border-gray-100
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "clamp(320px, 30vw, 420px)" }}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-[#7cb518] via-[#A4C639] to-emerald-400 opacity-95" />
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute top-4 left-1/2 w-16 h-16 rounded-full bg-white/5" />

          <div className="relative px-5 pt-6 pb-5">
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon + title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">What&apos;s New</h2>
                <p className="text-xs text-white/75">Bureau OCR · Release notes</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-xl font-bold text-white">{totalCount}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Updates</p>
              </div>
              <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-xl font-bold text-white">{unreadCount}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Unread</p>
              </div>
              <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-xl font-bold text-white">{totalCount - unreadCount}</p>
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section label ─────────────────────────────────────────────── */}
        {!isLoading && announcements.length > 0 && (
          <div className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Latest updates
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 min-h-0">
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

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A4C639] animate-pulse" />
            <p className="text-[11px] text-gray-400 font-medium">Live updates enabled</p>
          </div>
          <p className="text-[11px] text-gray-300">Bureau OCR</p>
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
  const icon  = ANNOUNCEMENT_TYPE_ICONS[announcement.type];
  const label = ANNOUNCEMENT_TYPE_LABELS[announcement.type];
  const isUnread = !announcement.is_read;

  return (
    <article
      className={`relative rounded-2xl border transition-all duration-200 hover:shadow-md overflow-hidden
        ${isUnread
          ? "bg-white border-[#A4C639]/25 shadow-sm ring-1 ring-[#A4C639]/15"
          : "bg-gray-50/60 border-gray-100"
        }`}
    >
      {/* Unread left accent bar */}
      {isUnread && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#A4C639] to-emerald-400 block rounded-l-2xl" />
      )}

      {/* Draft badge (superadmin only) */}
      {isSuperAdmin && !announcement.is_published && (
        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
          Draft
        </span>
      )}

      <div className={`p-4 ${isUnread ? "pl-5" : ""}`}>
        {/* Top row: badge + NEW pill */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${bg} ${text} ${border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {icon} {label}
          </span>
          {isUnread && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#A4C639] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A4C639] animate-pulse" />
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-snug mb-1.5 ${isUnread ? "text-gray-900" : "text-gray-500"}`}>
          {announcement.title}
        </h3>

        {/* Content */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 whitespace-pre-line">
          {announcement.content}
        </p>

        {/* Date row */}
        <div className="mt-3 flex items-center gap-1.5">
          <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] text-gray-400">
            {announcement.published_at
              ? formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })
              : formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="pt-3 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 p-4 animate-pulse bg-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-8 bg-gray-100 rounded-full" />
          </div>
          <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-full bg-gray-50 rounded mb-1" />
          <div className="h-3 w-5/6 bg-gray-50 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-50 rounded mt-3" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-[#A4C639]/20 to-emerald-100 flex items-center justify-center mb-5 shadow-inner">
        <svg className="w-10 h-10 text-[#A4C639]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-gray-700 mb-1.5">No updates yet</h3>
      <p className="text-xs text-gray-400 max-w-[180px] leading-relaxed">
        New features and improvements will appear here as they ship.
      </p>
    </div>
  );
}
