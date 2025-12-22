// Plan API client
import { getToken } from "./AuthApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

// Make authenticated request
async function authRequest(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      ...init,
      mode: init.mode ?? "cors",
      headers,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        isJson && payload?.message
          ? payload.message
          : isJson && payload?.detail
          ? typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail)
          : payload || response.statusText;
      throw new Error(errorMessage || "Request failed");
    }

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[PlanApi] Network request failed for ${path}: ${message}`);
  }
}

// Plan types
export interface PlanLimits {
  uploads_per_month: number;
  users_limit: number;
  pages_per_month: number;
  pdf_exports: number;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  is_trial: boolean;
  duration_days: number | null;
  is_active: boolean;
  limits: PlanLimits;
  created_at: string;
  updated_at: string;
}

export interface PlanCreate {
  name: string;
  price_monthly: number;
  is_trial: boolean;
  duration_days: number | null;
  is_active?: boolean;
  limits: PlanLimits;
}

export interface PlanUpdate {
  name?: string;
  price_monthly?: number;
  is_trial?: boolean;
  duration_days?: number | null;
  is_active?: boolean;
  limits?: PlanLimits;
}

/**
 * Get all plans (all authenticated users can view)
 */
export async function getAllPlans(
  skip: number = 0,
  limit: number = 100,
  is_active?: boolean,
  is_trial?: boolean
): Promise<Plan[]> {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (is_active !== undefined) {
    params.append("is_active", is_active.toString());
  }
  if (is_trial !== undefined) {
    params.append("is_trial", is_trial.toString());
  }

  return authRequest(`/plans?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get plan by ID (all authenticated users can view)
 */
export async function getPlan(planId: string): Promise<Plan> {
  return authRequest(`/plans/${planId}`, {
    method: "GET",
  });
}

/**
 * Create a new plan (Super Admin only)
 */
export async function createPlan(data: PlanCreate): Promise<Plan> {
  return authRequest("/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a plan (Super Admin only)
 */
export async function updatePlan(
  planId: string,
  data: PlanUpdate
): Promise<Plan> {
  return authRequest(`/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Deactivate a plan (Super Admin only)
 */
export async function deletePlan(planId: string): Promise<void> {
  return authRequest(`/plans/${planId}`, {
    method: "DELETE",
  });
}

