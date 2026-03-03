// Announcements API client — "What's New" feature
import { getToken } from "./AuthApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type AnnouncementType =
  | "feature"
  | "fix"
  | "improvement"
  | "warning"
  | "info";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  is_published: boolean;
  created_by: string;
  created_by_email: string;
  created_at: string;
  published_at: string | null;
  is_read: boolean;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  unread_count: number;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  type: AnnouncementType;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  type?: AnnouncementType;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg =
      isJson && payload?.message
        ? payload.message
        : isJson && payload?.detail
        ? typeof payload.detail === "string"
          ? payload.detail
          : JSON.stringify(payload.detail)
        : String(payload) || res.statusText;
    throw new Error(msg || "Request failed");
  }
  return payload as T;
}

// ─────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────

/** List announcements (paginated). Superadmin sees all; others see published only. */
export async function listAnnouncements(
  page = 1,
  pageSize = 20
): Promise<AnnouncementListResponse> {
  const res = await fetch(
    `${API_BASE_URL}/announcements/?page=${page}&page_size=${pageSize}`,
    { headers: authHeaders() }
  );
  return handleResponse<AnnouncementListResponse>(res);
}

/** Get the unread count for the current user. */
export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/announcements/unread-count`, {
    headers: authHeaders(),
  });
  const data = await handleResponse<{ unread_count: number }>(res);
  return data.unread_count;
}

/** Get a single announcement by ID. */
export async function getAnnouncement(id: string): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Announcement>(res);
}

/** Create a new announcement draft (superadmin). */
export async function createAnnouncement(
  payload: AnnouncementCreate
): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/announcements/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Announcement>(res);
}

/** Update an existing announcement (superadmin). */
export async function updateAnnouncement(
  id: string,
  payload: AnnouncementUpdate
): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Announcement>(res);
}

/** Delete an announcement (superadmin). */
export async function deleteAnnouncement(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    await handleResponse<void>(res);
  }
}

/** Publish a draft announcement (superadmin). Resets read-state for all users. */
export async function publishAnnouncement(id: string): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}/publish`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<Announcement>(res);
}

/** Unpublish (revert to draft) an announcement (superadmin). */
export async function unpublishAnnouncement(id: string): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}/unpublish`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<Announcement>(res);
}

/** Mark a published announcement as read for the current user (idempotent). */
export async function markAnnouncementRead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}/read`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) await handleResponse<void>(res);
}

// ─────────────────────────────────────────────────────────────────
// Label / badge helpers
// ─────────────────────────────────────────────────────────────────

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  feature: "New Feature",
  fix: "Bug Fix",
  improvement: "Improvement",
  warning: "Important",
  info: "Info",
};

export const ANNOUNCEMENT_TYPE_ICONS: Record<AnnouncementType, string> = {
  feature: "✨",
  fix: "🐛",
  improvement: "⚡",
  warning: "⚠️",
  info: "ℹ️",
};

/** Tailwind classes for each announcement type badge */
export const ANNOUNCEMENT_TYPE_COLORS: Record<
  AnnouncementType,
  { bg: string; text: string; border: string; dot: string }
> = {
  feature: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  fix: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  improvement: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  warning: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
};
