"use client";

/**
 * /pages/WhatsNew/admin  –  Super-admin management page for announcements.
 *
 * Actions available:
 *  • Create draft announcement
 *  • Edit title / content / type
 *  • Publish (makes it visible to all users + resets read state)
 *  • Unpublish (reverts to draft)
 *  • Delete
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SuperAdminRoute from "@/app/modules/auth/components/SuperAdminRoute";
import Loading from "@/app/modules/shared/components/Loading";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  type Announcement,
  type AnnouncementType,
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_COLORS,
} from "@/app/modules/announcements/services/AnnouncementsApi";
import { formatDistanceToNow, format } from "date-fns";

// ─── Type options for the form ────────────────────────────────────────────────
const TYPE_OPTIONS: AnnouncementType[] = [
  "feature",
  "fix",
  "improvement",
  "warning",
  "info",
];

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper (SuperAdminRoute guard)
// ─────────────────────────────────────────────────────────────────────────────
export default function WhatsNewAdminPage() {
  return (
    <SuperAdminRoute>
      <WhatsNewAdminContent />
    </SuperAdminRoute>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────
function WhatsNewAdminContent() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form / modal state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Load ─────────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listAnnouncements(1, 100);
      setAnnouncements(data.announcements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Create / Edit submit ─────────────────────────────────────────── */
  const handleFormSubmit = async (values: {
    title: string;
    content: string;
    type: AnnouncementType;
  }) => {
    try {
      if (editTarget) {
        const updated = await updateAnnouncement(editTarget.id, values);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        showToast("Announcement updated.");
      } else {
        const created = await createAnnouncement(values);
        setAnnouncements((prev) => [created, ...prev]);
        showToast("Announcement created as draft.");
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saving", false);
    }
  };

  /* ── Publish ──────────────────────────────────────────────────────── */
  const handlePublish = async (a: Announcement) => {
    try {
      const updated = await publishAnnouncement(a.id);
      setAnnouncements((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      showToast("Published! All users will see this as unread.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error publishing", false);
    }
  };

  /* ── Unpublish ────────────────────────────────────────────────────── */
  const handleUnpublish = async (a: Announcement) => {
    try {
      const updated = await unpublishAnnouncement(a.id);
      setAnnouncements((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      showToast("Reverted to draft.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error unpublishing", false);
    }
  };

  /* ── Delete ───────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAnnouncement(deleteTarget.id);
      setAnnouncements((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      showToast("Announcement deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error deleting", false);
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── Stats counts ─────────────────────────────────────────────────── */
  const published = announcements.filter((a) => a.is_published).length;
  const drafts = announcements.filter((a) => !a.is_published).length;

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A4C639] to-emerald-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">What&apos;s New</h1>
                <p className="text-xs text-gray-500">Manage announcements &amp; release notes</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-[#93b230] hover:to-emerald-600 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Announcement
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Stats row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total" value={announcements.length} icon="📋" color="gray" />
          <StatCard label="Published" value={published} icon="🟢" color="green" />
          <StatCard label="Drafts" value={drafts} icon="📝" color="yellow" />
        </div>

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ── List ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading message="Loading announcements…" />
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState onNew={() => { setEditTarget(null); setShowForm(true); }} />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <AdminAnnouncementCard
                key={ann.id}
                announcement={ann}
                onEdit={() => { setEditTarget(ann); setShowForm(true); }}
                onPublish={() => handlePublish(ann)}
                onUnpublish={() => handleUnpublish(ann)}
                onDelete={() => setDeleteTarget(ann)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit modal ───────────────────────────────────── */}
      {showForm && (
        <AnnouncementFormModal
          initial={editTarget}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* ── Delete confirm ────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white
            ${toast.ok ? "bg-[#A4C639]" : "bg-red-500"} animate-[slideInUp_0.3s_ease-out]`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    gray: "from-gray-50 to-gray-100 border-gray-200",
    green: "from-emerald-50 to-green-100 border-emerald-200",
    yellow: "from-amber-50 to-yellow-100 border-amber-200",
  };
  return (
    <div className={`rounded-2xl border p-4 bg-gradient-to-br ${colorMap[color] ?? colorMap.gray}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Announcement Card
// ─────────────────────────────────────────────────────────────────────────────
function AdminAnnouncementCard({
  announcement: a,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  announcement: Announcement;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  const { bg, text, border, dot } = ANNOUNCEMENT_TYPE_COLORS[a.type];
  const icon = ANNOUNCEMENT_TYPE_ICONS[a.type];
  const label = ANNOUNCEMENT_TYPE_LABELS[a.type];

  return (
    <div className={`rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md
      ${a.is_published ? "border-gray-200" : "border-dashed border-gray-300"}`}
    >
      <div className="flex items-start gap-4">
        {/* Type + status */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {icon} {label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
              ${a.is_published ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${a.is_published ? "bg-emerald-500" : "bg-gray-400"}`} />
              {a.is_published ? "Published" : "Draft"}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{a.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.content}</p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              Created {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
            </span>
            {a.published_at && (
              <span className="text-emerald-600">
                Published {format(new Date(a.published_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit */}
          <button
            onClick={onEdit}
            title="Edit"
            className="p-2 rounded-xl text-gray-400 hover:text-[#A4C639] hover:bg-[#A4C639]/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Publish / Unpublish */}
          {a.is_published ? (
            <button
              onClick={onUnpublish}
              title="Revert to Draft"
              className="p-2 rounded-xl text-emerald-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onPublish}
              title="Publish"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A4C639] text-white text-xs font-bold hover:bg-[#93b230] transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Publish
            </button>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Delete"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
function AnnouncementFormModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial: Announcement | null;
  onSubmit: (v: { title: string; content: string; type: AnnouncementType }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [type, setType] = useState<AnnouncementType>(initial?.type ?? "feature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Title and content are required.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), type });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A4C639] to-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={initial ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {initial ? "Edit Announcement" : "New Announcement"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => {
                const colors = ANNOUNCEMENT_TYPE_COLORS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${type === t
                        ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-offset-1 ring-[#A4C639]`
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {ANNOUNCEMENT_TYPE_ICONS[t]} {ANNOUNCEMENT_TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="ann-title">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Improved OCR accuracy for Arabic text"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#A4C639] focus:border-transparent transition"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="ann-content">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              id="ann-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the update in detail…"
              maxLength={5000}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#A4C639] focus:border-transparent transition resize-none"
            />
            <p className="text-right text-[10px] text-gray-400 mt-0.5">{content.length}/5000</p>
          </div>

          {/* Error */}
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 border border-red-100">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white text-sm font-bold shadow-sm hover:from-[#93b230] hover:to-emerald-600 transition disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : initial ? "Save Changes" : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirm modal
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 animate-[scaleIn_0.2s_ease-out] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Announcement</h3>
        <p className="text-sm text-gray-500 mb-5">
          &quot;{title}&quot; will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#A4C639]/20 to-emerald-100 flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-[#A4C639]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">No announcements yet</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Create your first announcement to keep users informed about new features and updates.
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A4C639] to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create First Announcement
      </button>
    </div>
  );
}
