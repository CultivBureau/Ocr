// Company API client
import { getToken } from "./AuthApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

// Make authenticated request
async function authRequest(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> || {}),
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

    // Handle 204 No Content (empty response) - common for DELETE operations
    if (response.status === 204) {
      return;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    
    let payload: any = null;
    
    try {
      if (isJson) {
        payload = await response.json();
      } else {
        const text = await response.text();
        payload = text || null;
      }
    } catch (e) {
      // If JSON parsing fails (empty body), handle gracefully
      if (e instanceof SyntaxError || (e instanceof Error && e.message.includes("JSON"))) {
        // For successful responses with empty body, return undefined
        if (response.ok) {
          return;
        }
        // For error responses, use status text
        throw new Error(response.statusText || "Request failed");
      }
      throw e;
    }

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
    throw new Error(`[CompanyApi] Network request failed for ${path}: ${message}`);
  }
}

// Company types
export interface Company {
  id: string;
  name: string;
  plan_id: string | null;
  header_image: string | null;
  footer_image: string | null;
  is_active: boolean;
  created_at: string;
  plan_started_at: string | null;
  plan_expires_at: string | null;
}

export interface CompanyCreate {
  name: string;
  is_active?: boolean;
  plan_id?: string | null;
  header_image?: string | null;
  footer_image?: string | null;
}

export interface CompanyUpdate {
  name?: string;
  plan_id?: string | null;
  header_image?: string | null;
  footer_image?: string | null;
  is_active?: boolean;
}

/**
 * Get all companies (Super Admin only)
 */
export async function getAllCompanies(
  skip: number = 0,
  limit: number = 100,
  is_active?: boolean
): Promise<Company[]> {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (is_active !== undefined) {
    params.append("is_active", is_active.toString());
  }

  return authRequest(`/companies?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get company by ID
 */
export async function getCompany(companyId: string): Promise<Company> {
  return authRequest(`/companies/${companyId}`, {
    method: "GET",
  });
}

/**
 * Create a new company (Super Admin only)
 */
export async function createCompany(data: CompanyCreate): Promise<Company> {
  return authRequest("/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a company (Super Admin only)
 */
export async function updateCompany(
  companyId: string,
  data: CompanyUpdate
): Promise<Company> {
  return authRequest(`/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Deactivate a company (Super Admin only)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  return authRequest(`/companies/${companyId}`, {
    method: "DELETE",
  });
}

/**
 * Assign plan to company (Super Admin only)
 * This will reset usage counters by default when changing plans.
 * 
 * @param companyId - Company ID
 * @param planId - Plan ID to assign
 * @param resetUsage - Whether to reset usage counters (default: true)
 */
export async function assignPlan(
  companyId: string,
  planId: string,
  resetUsage: boolean = true
): Promise<Company> {
  return authRequest(`/companies/${companyId}/plan?plan_id=${planId}&reset_usage=${resetUsage}`, {
    method: "PUT",
  });
}

/**
 * Renew current plan for a company (Super Admin only)
 * This resets the plan period and all usage counters to 0.
 * 
 * @param companyId - Company ID
 */
export async function renewPlan(companyId: string): Promise<Company> {
  return authRequest(`/companies/${companyId}/plan/renew`, {
    method: "POST",
  });
}

/**
 * Activate a company (Super Admin only)
 */
export async function activateCompany(companyId: string): Promise<Company> {
  return authRequest(`/companies/${companyId}/activate`, {
    method: "POST",
  });
}

/**
 * Upload header image for a company (Super Admin only)
 */
export async function uploadCompanyHeaderImage(
  companyId: string,
  file: File
): Promise<Company> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/branding/header`, {
    method: "POST",
    headers,
    body: formData,
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
}

/**
 * Upload footer image for a company (Super Admin only)
 */
export async function uploadCompanyFooterImage(
  companyId: string,
  file: File
): Promise<Company> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/branding/footer`, {
    method: "POST",
    headers,
    body: formData,
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
}

/**
 * Delete header image for a company (Super Admin only)
 */
export async function deleteCompanyHeaderImage(companyId: string): Promise<Company> {
  return authRequest(`/companies/${companyId}/branding/header`, {
    method: "DELETE",
  });
}

/**
 * Delete footer image for a company (Super Admin only)
 */
export async function deleteCompanyFooterImage(companyId: string): Promise<Company> {
  return authRequest(`/companies/${companyId}/branding/footer`, {
    method: "DELETE",
  });
}

// Company Details types (for Super Admin)
export interface CompanyUsageSummary {
  total_uploads: number;
  total_ocr_pages: number;
  total_pdf_exports: number;
  total_cost: number;
  period_start: string;
  period_end: string;
}

export interface UsageRecord {
  id: string;
  action: string;
  pages: number;
  cost: number;
  created_at: string;
  is_current_period: boolean;
}

export interface UsageHistoryResponse {
  records: UsageRecord[];
  total: number;
  skip: number;
  limit: number;
  plan_started_at: string | null;
  current_period_summary: {
    total_uploads: number;
    total_ocr_pages: number;
    total_pdf_exports: number;
    total_cost: number;
  };
  all_time_summary: {
    total_uploads: number;
    total_ocr_pages: number;
    total_pdf_exports: number;
    total_cost: number;
  };
}

export interface CompanyPlanDetails {
  plan: {
    id: string;
    name: string;
    price_monthly: number;
    is_trial: boolean;
    duration_days: number | null;
    is_active: boolean;
    limits: {
      uploads_per_month: number;
      users_limit: number;
      pages_per_month: number;
      pdf_exports: number;
    };
  } | null;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  message?: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyUsersResponse {
  users: CompanyUser[];
  total: number;
  message?: string;
}

/**
 * Get company usage statistics (Super Admin only)
 * 
 * @param companyId - Company ID
 * @param month - Month (1-12)
 * @param year - Year
 * @param currentPeriodOnly - If true, only show usage since plan started
 */
export async function getCompanyUsage(
  companyId: string,
  month?: number,
  year?: number,
  currentPeriodOnly: boolean = true
): Promise<CompanyUsageSummary> {
  const params = new URLSearchParams();
  if (month !== undefined) {
    params.append("month", month.toString());
  }
  if (year !== undefined) {
    params.append("year", year.toString());
  }
  params.append("current_period_only", currentPeriodOnly.toString());

  return authRequest(`/companies/${companyId}/usage?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get company usage history (Super Admin only)
 * Returns all usage records including historical data from previous plan periods.
 * 
 * @param companyId - Company ID
 * @param skip - Number of records to skip
 * @param limit - Maximum number of records to return
 * @param startDate - Filter records from this date (ISO string)
 * @param endDate - Filter records until this date (ISO string)
 */
export async function getCompanyUsageHistory(
  companyId: string,
  skip: number = 0,
  limit: number = 100,
  startDate?: string,
  endDate?: string
): Promise<UsageHistoryResponse> {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (startDate) {
    params.append("start_date", startDate);
  }
  if (endDate) {
    params.append("end_date", endDate);
  }

  return authRequest(`/companies/${companyId}/usage/history?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get company users (Super Admin only)
 */
export async function getCompanyUsers(
  companyId: string,
  skip: number = 0,
  limit: number = 100
): Promise<CompanyUsersResponse> {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());

  return authRequest(`/companies/${companyId}/users?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get company plan details (Super Admin only)
 */
export async function getCompanyPlanDetails(companyId: string): Promise<CompanyPlanDetails> {
  return authRequest(`/companies/${companyId}/plan`, {
    method: "GET",
  });
}

// Export data types
export interface ExportCompanyData {
  company_id: string;
  company_name: string;
  is_active: boolean;
  created_at: string | null;
  plan_name: string;
  plan_price_monthly: number;
  plan_is_trial: boolean;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  uploads_limit: number;
  pages_limit: number;
  pdf_exports_limit: number;
  users_limit: number;
}

export interface ExportUsageCurrentData {
  company_id: string;
  company_name: string;
  period_start: string | null;
  uploads_used: number;
  uploads_limit: number;
  uploads_percentage: number;
  ocr_pages_used: number;
  ocr_pages_limit: number;
  ocr_pages_percentage: number;
  pdf_exports_used: number;
  pdf_exports_limit: number;
  pdf_exports_percentage: number;
  users_count: number;
  users_limit: number;
  users_percentage: number;
}

export interface ExportUsageHistoricalData {
  company_id: string;
  company_name: string;
  total_uploads: number;
  total_ocr_pages: number;
  total_pdf_exports: number;
  total_users: number;
}

export interface ExportUserData {
  company_id: string;
  company_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  is_active: boolean;
  created_at: string | null;
}

export interface CompanyExportResponse {
  export_date: string;
  export_type: string;
  companies_count: number;
  companies: ExportCompanyData[];
  usage_current_period: ExportUsageCurrentData[];
  usage_historical: ExportUsageHistoricalData[];
  users: ExportUserData[];
}

/**
 * Get company data for Excel export (Super Admin only)
 * 
 * @param companyId - Optional specific company ID, leave empty for all companies
 */
export async function getCompanyExportData(companyId?: string): Promise<CompanyExportResponse> {
  const params = new URLSearchParams();
  if (companyId) {
    params.append("company_id", companyId);
  }
  
  return authRequest(`/companies/export/data?${params.toString()}`, {
    method: "GET",
  });
}

