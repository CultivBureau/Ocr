// Excel Export Utility for Company Data - Professional Version
import * as XLSX from "xlsx";
import type { CompanyExportResponse, ExportCompanyData, ExportUsageCurrentData, ExportUsageHistoricalData } from "@/app/services/CompanyApi";

/**
 * Format date string for Excel - Enhanced formatting
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Format full date with time
 */
function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/**
 * Calculate days remaining until expiry
 */
function getDaysRemaining(expiryDate: string | null | undefined): string {
  if (!expiryDate) return "—";
  try {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "EXPIRED";
    if (diffDays === 0) return "Expires Today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  } catch {
    return "—";
  }
}

/**
 * Calculate usage status based on percentage
 */
function getUsageStatus(percentage: number): string {
  if (percentage >= 100) return "⚠️ OVER LIMIT";
  if (percentage >= 90) return "🔴 Critical";
  if (percentage >= 70) return "🟡 Warning";
  if (percentage >= 50) return "🟢 Moderate";
  return "✅ Good";
}

/**
 * Format number with commas
 */
function formatNumber(num: number | null | undefined): string | number {
  if (num === null || num === undefined) return 0;
  return num;
}

/**
 * Format currency
 */
function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined) return "$0.00";
  return `$${num.toFixed(2)}`;
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(1)}%`;
}

/**
 * Get limit display - show number or Unlimited
 */
function getLimitDisplay(limit: number | null | undefined): string | number {
  if (!limit || limit === 0) return "Unlimited";
  return limit;
}

/**
 * Generate Excel workbook from company export data
 */
export function generateCompanyExportExcel(
  data: CompanyExportResponse,
  exportType: "all" | "single"
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const exportDate = formatDateTime(data.export_date);
  const companiesCount = data.companies_count || data.companies?.length || 0;
  const usersCount = data.users?.length || 0;

  // Create lookup maps for easy data access
  const usageCurrentMap = new Map<string, ExportUsageCurrentData>();
  (data.usage_current_period || []).forEach(u => {
    usageCurrentMap.set(u.company_id, u);
  });

  const usageHistoricalMap = new Map<string, ExportUsageHistoricalData>();
  (data.usage_historical || []).forEach(u => {
    usageHistoricalMap.set(u.company_id, u);
  });

  // Count users per company
  const usersPerCompany = new Map<string, number>();
  (data.users || []).forEach(u => {
    const count = usersPerCompany.get(u.company_id) || 0;
    usersPerCompany.set(u.company_id, count + 1);
  });

  // ========================================
  // Sheet 1: COMPLETE COMPANY DETAILS (Main Sheet)
  // ========================================
  const companyDetailsData: (string | number)[][] = [
    ["COMPLETE COMPANY DETAILS - All Information Per Company"],
    [],
    [
      "#",
      "Company Name",
      "Status",
      // Plan Information
      "Plan Name",
      "Plan Type",
      "Monthly Price",
      "Plan Start Date",
      "Plan Expiry Date",
      "Days Remaining",
      // Plan Limits
      "Upload Limit",
      "Pages Limit",
      "PDF Export Limit",
      "Users Limit",
      // Current Period Usage
      "Uploads Used",
      "Uploads %",
      "Upload Status",
      "OCR Pages Used",
      "OCR Pages %",
      "OCR Status",
      "PDF Exports Used",
      "PDF Exports %",
      "Export Status",
      "Current Users",
      "Users %",
      // All-Time Totals
      "Total Uploads (All-Time)",
      "Total OCR Pages (All-Time)",
      "Total PDF Exports (All-Time)",
      // Meta
      "Created At",
      "Company ID",
    ],
  ];
  
  (data.companies || []).forEach((company, index) => {
    const currentUsage = usageCurrentMap.get(company.company_id);
    const historicalUsage = usageHistoricalMap.get(company.company_id);
    const userCount = usersPerCompany.get(company.company_id) || 0;
    
    const uploadsPercentage = currentUsage?.uploads_percentage || 0;
    const ocrPercentage = currentUsage?.ocr_pages_percentage || 0;
    const pdfPercentage = currentUsage?.pdf_exports_percentage || 0;
    const usersPercentage = currentUsage?.users_percentage || 0;
    
    companyDetailsData.push([
      index + 1,
      company.company_name || "Unknown",
      company.is_active ? "✅ Active" : "❌ Inactive",
      // Plan Information
      company.plan_name || "No Plan",
      company.plan_is_trial ? "🔄 Trial" : "💳 Paid",
      formatCurrency(company.plan_price_monthly),
      formatDate(company.plan_started_at),
      formatDate(company.plan_expires_at),
      getDaysRemaining(company.plan_expires_at),
      // Plan Limits
      getLimitDisplay(company.uploads_limit),
      getLimitDisplay(company.pages_limit),
      getLimitDisplay(company.pdf_exports_limit),
      getLimitDisplay(company.users_limit),
      // Current Period Usage
      formatNumber(currentUsage?.uploads_used),
      formatPercentage(uploadsPercentage),
      getUsageStatus(uploadsPercentage),
      formatNumber(currentUsage?.ocr_pages_used),
      formatPercentage(ocrPercentage),
      getUsageStatus(ocrPercentage),
      formatNumber(currentUsage?.pdf_exports_used),
      formatPercentage(pdfPercentage),
      getUsageStatus(pdfPercentage),
      userCount,
      formatPercentage(usersPercentage),
      // All-Time Totals
      formatNumber(historicalUsage?.total_uploads),
      formatNumber(historicalUsage?.total_ocr_pages),
      formatNumber(historicalUsage?.total_pdf_exports),
      // Meta
      formatDate(company.created_at),
      company.company_id || "—",
    ]);
  });
  
  // Add totals row
  const totalCurrentUploads = (data.usage_current_period || []).reduce((sum, u) => sum + (u.uploads_used || 0), 0);
  const totalCurrentOcr = (data.usage_current_period || []).reduce((sum, u) => sum + (u.ocr_pages_used || 0), 0);
  const totalCurrentPdf = (data.usage_current_period || []).reduce((sum, u) => sum + (u.pdf_exports_used || 0), 0);
  const totalHistoricalUploads = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_uploads || 0), 0);
  const totalHistoricalOcr = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_ocr_pages || 0), 0);
  const totalHistoricalPdf = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_pdf_exports || 0), 0);
  
  companyDetailsData.push([]);
  companyDetailsData.push([
    "",
    "📊 TOTALS",
    "",
    "", "", "", "", "", "",
    "", "", "", "",
    totalCurrentUploads, "", "",
    totalCurrentOcr, "", "",
    totalCurrentPdf, "", "",
    usersCount, "",
    totalHistoricalUploads,
    totalHistoricalOcr,
    totalHistoricalPdf,
    "", "",
  ]);
  
  const companyDetailsSheet = XLSX.utils.aoa_to_sheet(companyDetailsData);
  companyDetailsSheet["!cols"] = [
    { wch: 4 },   // #
    { wch: 20 },  // Company Name
    { wch: 12 },  // Status
    { wch: 16 },  // Plan Name
    { wch: 10 },  // Plan Type
    { wch: 12 },  // Monthly Price
    { wch: 14 },  // Plan Start
    { wch: 14 },  // Plan Expiry
    { wch: 14 },  // Days Remaining
    { wch: 12 },  // Upload Limit
    { wch: 12 },  // Pages Limit
    { wch: 14 },  // PDF Export Limit
    { wch: 11 },  // Users Limit
    { wch: 12 },  // Uploads Used
    { wch: 10 },  // Uploads %
    { wch: 14 },  // Upload Status
    { wch: 14 },  // OCR Pages Used
    { wch: 11 },  // OCR Pages %
    { wch: 14 },  // OCR Status
    { wch: 14 },  // PDF Exports Used
    { wch: 11 },  // PDF Exports %
    { wch: 14 },  // Export Status
    { wch: 12 },  // Current Users
    { wch: 10 },  // Users %
    { wch: 20 },  // Total Uploads
    { wch: 22 },  // Total OCR Pages
    { wch: 22 },  // Total PDF Exports
    { wch: 14 },  // Created At
    { wch: 28 },  // Company ID
  ];
  
  companyDetailsSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 28 } }];
  
  XLSX.utils.book_append_sheet(workbook, companyDetailsSheet, "Company Details");

  // ========================================
  // Sheet 2: EXECUTIVE SUMMARY
  // ========================================
  const summaryData = [
    ["PDF CONVERTER - COMPANY DATA REPORT"],
    [],
    ["REPORT INFORMATION"],
    ["Export Date & Time:", exportDate],
    ["Report Type:", exportType === "all" ? "All Companies Report" : "Single Company Report"],
    ["Total Companies:", companiesCount],
    ["Total Users:", usersCount],
    [],
    ["QUICK STATISTICS"],
    ["Active Companies:", data.companies?.filter(c => c.is_active).length || 0],
    ["Inactive Companies:", data.companies?.filter(c => !c.is_active).length || 0],
    ["Companies with Active Plan:", data.companies?.filter(c => c.plan_name && c.plan_name !== "No Plan").length || 0],
    ["Companies without Plan:", data.companies?.filter(c => !c.plan_name || c.plan_name === "No Plan").length || 0],
    [],
    ["USAGE OVERVIEW (Current Period)"],
    ["Total Uploads Used:", data.usage_current_period?.reduce((sum, u) => sum + (u.uploads_used || 0), 0) || 0],
    ["Total OCR Pages Used:", data.usage_current_period?.reduce((sum, u) => sum + (u.ocr_pages_used || 0), 0) || 0],
    ["Total PDF Exports:", data.usage_current_period?.reduce((sum, u) => sum + (u.pdf_exports_used || 0), 0) || 0],
    [],
    ["ALL-TIME TOTALS (Historical)"],
    ["Total Uploads (All-Time):", data.usage_historical?.reduce((sum, u) => sum + (u.total_uploads || 0), 0) || 0],
    ["Total OCR Pages (All-Time):", data.usage_historical?.reduce((sum, u) => sum + (u.total_ocr_pages || 0), 0) || 0],
    ["Total PDF Exports (All-Time):", data.usage_historical?.reduce((sum, u) => sum + (u.total_pdf_exports || 0), 0) || 0],
    [],
    [],
    ["Generated by PDF Converter - Super Admin Panel"],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 35 }, { wch: 30 }];
  
  // Merge title cell
  summarySheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
  ];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // ========================================
  // Sheet 2: COMPANIES OVERVIEW
  // ========================================
  const companiesSheetData: (string | number)[][] = [
    ["COMPANIES OVERVIEW"],
    [],
    [
      "#",
      "Company Name",
      "Status",
      "Plan Name",
      "Plan Type",
      "Monthly Price",
      "Plan Started",
      "Plan Expires",
      "Created At",
      "Uploads Limit",
      "Pages Limit",
      "PDF Exports Limit",
      "Users Limit",
      "Company ID",
    ],
  ];
  
  (data.companies || []).forEach((c, index) => {
    companiesSheetData.push([
      index + 1,
      c.company_name || "Unknown",
      c.is_active ? "✅ Active" : "❌ Inactive",
      c.plan_name || "No Plan",
      c.plan_is_trial ? "🔄 Trial" : "💳 Paid",
      formatCurrency(c.plan_price_monthly),
      formatDate(c.plan_started_at),
      formatDate(c.plan_expires_at),
      formatDate(c.created_at),
      c.uploads_limit ? formatNumber(c.uploads_limit) : "Unlimited",
      c.pages_limit ? formatNumber(c.pages_limit) : "Unlimited",
      c.pdf_exports_limit ? formatNumber(c.pdf_exports_limit) : "Unlimited",
      c.users_limit ? formatNumber(c.users_limit) : "Unlimited",
      c.company_id || "—",
    ]);
  });
  
  const companiesSheet = XLSX.utils.aoa_to_sheet(companiesSheetData);
  companiesSheet["!cols"] = [
    { wch: 5 },   // #
    { wch: 25 },  // Company Name
    { wch: 12 },  // Status
    { wch: 18 },  // Plan Name
    { wch: 12 },  // Plan Type
    { wch: 14 },  // Monthly Price
    { wch: 14 },  // Plan Started
    { wch: 14 },  // Plan Expires
    { wch: 14 },  // Created At
    { wch: 14 },  // Uploads Limit
    { wch: 13 },  // Pages Limit
    { wch: 16 },  // PDF Exports Limit
    { wch: 12 },  // Users Limit
    { wch: 28 },  // Company ID
  ];
  
  // Merge title row
  companiesSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }];
  
  XLSX.utils.book_append_sheet(workbook, companiesSheet, "Companies");

  // ========================================
  // Sheet 3: CURRENT PERIOD USAGE
  // ========================================
  const currentUsageData: (string | number)[][] = [
    ["CURRENT PERIOD USAGE - Usage Since Plan Started"],
    [],
    [
      "#",
      "Company Name",
      "Period Started",
      "Uploads Used",
      "Uploads Limit",
      "Uploads %",
      "Upload Status",
      "OCR Pages Used",
      "OCR Pages Limit",
      "OCR Pages %",
      "OCR Status",
      "PDF Exports Used",
      "PDF Exports Limit",
      "PDF Exports %",
      "Export Status",
      "Users Count",
      "Users Limit",
      "Users %",
    ],
  ];
  
  (data.usage_current_period || []).forEach((u, index) => {
    const uploadsPercentage = u.uploads_percentage || 0;
    const ocrPercentage = u.ocr_pages_percentage || 0;
    const pdfPercentage = u.pdf_exports_percentage || 0;
    
    currentUsageData.push([
      index + 1,
      u.company_name || "Unknown",
      formatDate(u.period_start),
      formatNumber(u.uploads_used),
      u.uploads_limit ? formatNumber(u.uploads_limit) : "Unlimited",
      formatPercentage(uploadsPercentage),
      getUsageStatus(uploadsPercentage),
      formatNumber(u.ocr_pages_used),
      u.ocr_pages_limit ? formatNumber(u.ocr_pages_limit) : "Unlimited",
      formatPercentage(ocrPercentage),
      getUsageStatus(ocrPercentage),
      formatNumber(u.pdf_exports_used),
      u.pdf_exports_limit ? formatNumber(u.pdf_exports_limit) : "Unlimited",
      formatPercentage(pdfPercentage),
      getUsageStatus(pdfPercentage),
      formatNumber(u.users_count),
      u.users_limit ? formatNumber(u.users_limit) : "Unlimited",
      formatPercentage(u.users_percentage || 0),
    ]);
  });
  
  const currentUsageSheet = XLSX.utils.aoa_to_sheet(currentUsageData);
  currentUsageSheet["!cols"] = [
    { wch: 5 },   // #
    { wch: 22 },  // Company Name
    { wch: 14 },  // Period Started
    { wch: 13 },  // Uploads Used
    { wch: 13 },  // Uploads Limit
    { wch: 11 },  // Uploads %
    { wch: 14 },  // Upload Status
    { wch: 14 },  // OCR Pages Used
    { wch: 14 },  // OCR Pages Limit
    { wch: 12 },  // OCR Pages %
    { wch: 14 },  // OCR Status
    { wch: 14 },  // PDF Exports Used
    { wch: 14 },  // PDF Exports Limit
    { wch: 12 },  // PDF Exports %
    { wch: 14 },  // Export Status
    { wch: 12 },  // Users Count
    { wch: 12 },  // Users Limit
    { wch: 10 },  // Users %
  ];
  
  // Merge title row
  currentUsageSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }];
  
  XLSX.utils.book_append_sheet(workbook, currentUsageSheet, "Current Usage");

  // ========================================
  // Sheet 4: HISTORICAL USAGE (ALL-TIME)
  // ========================================
  const historicalUsageData: (string | number)[][] = [
    ["HISTORICAL USAGE - All-Time Totals (Including Previous Plan Periods)"],
    [],
    [
      "#",
      "Company Name",
      "Total Uploads",
      "Total OCR Pages",
      "Total PDF Exports",
      "Total Users",
      "Company ID",
    ],
  ];
  
  (data.usage_historical || []).forEach((u, index) => {
    historicalUsageData.push([
      index + 1,
      u.company_name || "Unknown",
      formatNumber(u.total_uploads),
      formatNumber(u.total_ocr_pages),
      formatNumber(u.total_pdf_exports),
      formatNumber(u.total_users),
      u.company_id || "—",
    ]);
  });
  
  // Add totals row
  const totalUploads = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_uploads || 0), 0);
  const totalOcrPages = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_ocr_pages || 0), 0);
  const totalPdfExports = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_pdf_exports || 0), 0);
  const totalUsers = (data.usage_historical || []).reduce((sum, u) => sum + (u.total_users || 0), 0);
  
  historicalUsageData.push([]);
  historicalUsageData.push([
    "",
    "📊 GRAND TOTAL",
    formatNumber(totalUploads),
    formatNumber(totalOcrPages),
    formatNumber(totalPdfExports),
    formatNumber(totalUsers),
    "",
  ]);
  
  const historicalUsageSheet = XLSX.utils.aoa_to_sheet(historicalUsageData);
  historicalUsageSheet["!cols"] = [
    { wch: 5 },   // #
    { wch: 25 },  // Company Name
    { wch: 16 },  // Total Uploads
    { wch: 18 },  // Total OCR Pages
    { wch: 18 },  // Total PDF Exports
    { wch: 12 },  // Total Users
    { wch: 28 },  // Company ID
  ];
  
  // Merge title row
  historicalUsageSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  
  XLSX.utils.book_append_sheet(workbook, historicalUsageSheet, "Historical Usage");

  // ========================================
  // Sheet 5: USERS LIST
  // ========================================
  const usersData: (string | number)[][] = [
    ["USERS LIST - All Company Users"],
    [],
    [
      "#",
      "Company Name",
      "User Name",
      "Email Address",
      "Role",
      "Status",
      "Created At",
      "User ID",
    ],
  ];
  
  (data.users || []).forEach((u, index) => {
    let roleDisplay = "👤 User";
    if (u.user_role === "superadmin") {
      roleDisplay = "🔴 Super Admin";
    } else if (u.user_role === "company_admin") {
      roleDisplay = "🔵 Company Admin";
    }
    
    usersData.push([
      index + 1,
      u.company_name || "Unknown",
      u.user_name || "Unknown",
      u.user_email || "—",
      roleDisplay,
      u.is_active ? "✅ Active" : "❌ Inactive",
      formatDate(u.created_at),
      u.user_id || "—",
    ]);
  });
  
  const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
  usersSheet["!cols"] = [
    { wch: 5 },   // #
    { wch: 22 },  // Company Name
    { wch: 22 },  // User Name
    { wch: 32 },  // Email Address
    { wch: 18 },  // Role
    { wch: 12 },  // Status
    { wch: 14 },  // Created At
    { wch: 28 },  // User ID
  ];
  
  // Merge title row
  usersSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  
  XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

  // ========================================
  // Sheet 6: PLAN ANALYSIS
  // ========================================
  // Group companies by plan
  const planGroups: Record<string, { count: number; companies: string[]; price: number }> = {};
  
  (data.companies || []).forEach(c => {
    const planName = c.plan_name || "No Plan";
    if (!planGroups[planName]) {
      planGroups[planName] = { count: 0, companies: [], price: c.plan_price_monthly || 0 };
    }
    planGroups[planName].count++;
    planGroups[planName].companies.push(c.company_name || "Unknown");
  });
  
  const planAnalysisData: (string | number)[][] = [
    ["PLAN DISTRIBUTION ANALYSIS"],
    [],
    ["Plan Name", "Number of Companies", "Monthly Price", "Companies"],
  ];
  
  Object.entries(planGroups).forEach(([planName, info]) => {
    planAnalysisData.push([
      planName,
      info.count,
      formatCurrency(info.price),
      info.companies.join(", "),
    ]);
  });
  
  planAnalysisData.push([]);
  planAnalysisData.push(["Total Companies", companiesCount, "", ""]);
  
  const planAnalysisSheet = XLSX.utils.aoa_to_sheet(planAnalysisData);
  planAnalysisSheet["!cols"] = [
    { wch: 20 },  // Plan Name
    { wch: 20 },  // Number of Companies
    { wch: 15 },  // Monthly Price
    { wch: 60 },  // Companies
  ];
  
  // Merge title row
  planAnalysisSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  
  XLSX.utils.book_append_sheet(workbook, planAnalysisSheet, "Plan Analysis");

  return workbook;
}

/**
 * Download Excel file
 */
export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename);
}

/**
 * Export company data to Excel and download
 */
export async function exportCompanyDataToExcel(
  data: CompanyExportResponse,
  filename?: string
): Promise<void> {
  const exportType = data.companies_count === 1 ? "single" : "all";
  const workbook = generateCompanyExportExcel(data, exportType);
  
  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
  
  let finalFilename: string;
  if (filename) {
    finalFilename = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
  } else if (exportType === "single" && data.companies?.[0]?.company_name) {
    const companyName = data.companies[0].company_name.replace(/[^a-zA-Z0-9]/g, "_");
    finalFilename = `${companyName}_Report_${date}.xlsx`;
  } else {
    finalFilename = `All_Companies_Report_${date}_${time}.xlsx`;
  }
  
  downloadExcel(workbook, finalFilename);
}
