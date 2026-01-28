"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import SuperAdminRoute from "@/app/components/SuperAdminRoute";
import {
  getAllCompanies,
  getCompany,
  getCompanyUsage,
  getCompanyUsageHistory,
  getCompanyUsers,
  getCompanyPlanDetails,
  getCompanyExportData,
  type Company,
  type CompanyUsageSummary,
  type CompanyUsersResponse,
  type CompanyPlanDetails,
  type UsageHistoryResponse,
} from "@/app/services/CompanyApi";
import { exportCompanyDataToExcel } from "@/app/utils/excelExport";
import { format } from "date-fns";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export default function CompanyDetailsPage() {
  return (
    <SuperAdminRoute>
      <CompanyDetailsContent />
    </SuperAdminRoute>
  );
}

function CompanyDetailsContent() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [usage, setUsage] = useState<CompanyUsageSummary | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistoryResponse | null>(null);
  const [plan, setPlan] = useState<CompanyPlanDetails | null>(null);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Usage filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCurrentPeriodOnly, setShowCurrentPeriodOnly] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyDetails();
    } else {
      setCompanyDetails(null);
      setUsage(null);
      setUsageHistory(null);
      setPlan(null);
      setCompanyUsers([]);
    }
  }, [selectedCompanyId, selectedMonth, selectedYear, showCurrentPeriodOnly]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError("");
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
      // Don't auto-select - require user to choose
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch companies";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    if (!selectedCompanyId) return;

    try {
      setIsLoading(true);
      setError("");
      const [detailsData, usageData, usageHistoryData, planData, usersData] = await Promise.all([
        getCompany(selectedCompanyId),
        getCompanyUsage(selectedCompanyId, selectedMonth, selectedYear, showCurrentPeriodOnly),
        getCompanyUsageHistory(selectedCompanyId, 0, 100),
        getCompanyPlanDetails(selectedCompanyId),
        getCompanyUsers(selectedCompanyId, 0, 100),
      ]);
      setCompanyDetails(detailsData);
      setUsage(usageData);
      setUsageHistory(usageHistoryData);
      setPlan(planData);
      setCompanyUsers(usersData.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch company details";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Helper function to calculate usage percentage
  const calculatePercentage = (used: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  // Helper function to get color based on usage percentage
  const getUsageColor = (percentage: number): { bg: string; bar: string; text: string; border: string } => {
    if (percentage >= 90) {
      return {
        bg: "bg-red-50",
        bar: "bg-gradient-to-r from-red-500 to-red-600",
        text: "text-red-700",
        border: "border-red-300"
      };
    } else if (percentage >= 70) {
      return {
        bg: "bg-amber-50",
        bar: "bg-gradient-to-r from-amber-500 to-amber-600",
        text: "text-amber-700",
        border: "border-amber-300"
      };
    } else {
      return {
        bg: "bg-green-50",
        bar: "bg-gradient-to-r from-green-500 to-green-600",
        text: "text-green-700",
        border: "border-green-300"
      };
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (percentage: number): string => {
    if (percentage >= 90) return "🔴";
    if (percentage >= 70) return "⚠️";
    return "✅";
  };

  // Helper function to render usage metric with progress bar
  const renderUsageMetric = (
    label: string,
    used: number,
    limit: number,
    icon: string,
    accentColor: string
  ) => {
    const percentage = calculatePercentage(used, limit);
    const colors = getUsageColor(percentage);
    const statusIcon = getStatusIcon(percentage);
    const isOverLimit = used > limit;

    return (
      <div className={`${colors.bg} rounded-xl p-5 border-2 ${colors.border} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="font-bold text-black text-base">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{statusIcon}</span>
            <span className={`text-2xl font-bold ${colors.text}`}>{percentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-6 bg-white rounded-full overflow-hidden shadow-inner border border-gray-300 mb-3">
          <div
            className={`${colors.bar} h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 shadow-md`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {percentage > 10 && (
              <span className="text-xs font-bold text-white drop-shadow">
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Usage Numbers */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Used</p>
            <p className="text-xl font-bold text-black">{used.toLocaleString()}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-sm font-medium text-gray-600">of</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Limit</p>
            <p className="text-xl font-bold text-black">{limit.toLocaleString()}</p>
          </div>
        </div>

        {/* Warning messages */}
        {isOverLimit && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-xs font-bold text-red-700">
              ⛔ OVER LIMIT: {(used - limit).toLocaleString()} over the allowed limit
            </p>
          </div>
        )}
        {!isOverLimit && percentage >= 90 && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-xs font-bold text-red-700">
              🚨 CRITICAL: Only {(limit - used).toLocaleString()} remaining
            </p>
          </div>
        )}
        {percentage >= 70 && percentage < 90 && (
          <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-xs font-bold text-amber-700">
              ⚠️ WARNING: {(limit - used).toLocaleString()} remaining ({100 - percentage}% available)
            </p>
          </div>
        )}
      </div>
    );
  };

  // Helper function to get overall status
  const getOverallStatus = (
    uploads: number,
    uploadsLimit: number,
    pages: number,
    pagesLimit: number,
    exports: number,
    exportsLimit: number,
    users: number,
    usersLimit: number
  ): string => {
    const percentages = [
      calculatePercentage(uploads, uploadsLimit),
      calculatePercentage(pages, pagesLimit),
      calculatePercentage(exports, exportsLimit),
      calculatePercentage(users, usersLimit),
    ];

    const maxPercentage = Math.max(...percentages);
    const hasOverLimit = uploads > uploadsLimit || pages > pagesLimit || exports > exportsLimit || users > usersLimit;

    if (hasOverLimit) {
      return "🔴 Over Limit - Action Required";
    } else if (maxPercentage >= 90) {
      return "🔴 Critical - Near Limit";
    } else if (maxPercentage >= 70) {
      return "⚠️ Warning - Monitor Usage";
    } else {
      return "✅ Healthy - Within Limits";
    }
  };

  // Export handler
  const handleExport = async (exportAll: boolean) => {
    try {
      setIsExporting(true);
      setError("");
      
      const companyId = exportAll ? undefined : selectedCompanyId || undefined;
      const data = await getCompanyExportData(companyId);
      
      const fileName = exportAll 
        ? `all_companies_report_${format(new Date(), "yyyy-MM-dd")}`
        : `${companyDetails?.name || "company"}_report_${format(new Date(), "yyyy-MM-dd")}`;
      
      exportCompanyDataToExcel(data, fileName);
      setSuccess(exportAll ? "All companies data exported successfully!" : "Company data exported successfully!");
      setShowExportModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export data";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
             src="/logo.png"
              alt="Buearau logo"
                width={140}
                height={50}
                className="object-contain cursor-pointer"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Home
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Company Details
            </h1>
            <p className="text-gray-700">Select and view detailed information for any company</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
        </div>

        {/* Company Filter */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-[#C4B454]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C4B454] to-[#B8A040] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <label className="text-lg font-bold text-black">
              Select a Company
            </label>
          </div>
          <select
            value={selectedCompanyId || ""}
            onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            className="w-full px-5 py-3 text-black border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#C4B454]/30 focus:border-[#C4B454] font-medium text-base transition-all"
          >
            <option value="" className="text-gray-500">-- Choose a company to view details --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id} className="text-black">
                {company.name} {company.is_active ? "✓ Active" : "✗ Inactive"}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!selectedCompanyId ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C4B454]/20 to-[#B8A040]/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#C4B454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">No Company Selected</h3>
              <p className="text-gray-700 text-lg">Please select a company from the dropdown above to view detailed information</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4B454]"></div>
            <p className="mt-2 text-gray-600">Loading company details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C4B454] to-[#B8A040] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Company Information
              </h2>

              {companyDetails && (
                <div className="space-y-5">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-black mb-2">
                      Company Name
                    </label>
                    <p className="text-black font-semibold text-lg">{companyDetails.name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-black mb-2">
                      Status
                    </label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                      companyDetails.is_active
                        ? "bg-green-100 text-green-800 border-2 border-green-300"
                        : "bg-red-100 text-red-800 border-2 border-red-300"
                    }`}>
                      {companyDetails.is_active ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-black mb-2">
                      Created At
                    </label>
                    <p className="text-black font-medium">
                      {format(new Date(companyDetails.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>

                  {companyDetails.plan_started_at && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-black mb-2">
                        Plan Started
                      </label>
                      <p className="text-black font-medium">
                        {format(new Date(companyDetails.plan_started_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}

                  {companyDetails.plan_expires_at && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-black mb-2">
                        Plan Expires
                      </label>
                      <p className="text-black font-medium">
                        {format(new Date(companyDetails.plan_expires_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Branding Images */}
                  <div className="pt-6 border-t-2 border-gray-200 mt-6">
                    <h3 className="text-lg font-bold text-black mb-4">Branding Images</h3>
                    
                    {companyDetails.header_image && (
                      <div className="mb-4 bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-bold text-black mb-3">
                          Header Image
                        </label>
                        <img
                          src={companyDetails.header_image.startsWith("http") ? companyDetails.header_image : `${API_BASE_URL}${companyDetails.header_image}`}
                          alt="Header"
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {companyDetails.footer_image && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-bold text-black mb-3">
                          Footer Image
                        </label>
                        <img
                          src={companyDetails.footer_image.startsWith("http") ? companyDetails.footer_image : `${API_BASE_URL}${companyDetails.footer_image}`}
                          alt="Footer"
                          className="w-full h-24 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {!companyDetails.header_image && !companyDetails.footer_image && (
                      <p className="text-sm text-black bg-gray-100 p-3 rounded-lg">No branding images uploaded</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C4B454] to-[#B8A040] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Plan Details
              </h2>

              {plan ? (
                plan.plan ? (
                  <div className="space-y-5">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-black mb-2">
                        Plan Name
                      </label>
                      <p className="text-black font-semibold text-lg">{plan.plan.name}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-black mb-2">
                        Monthly Price
                      </label>
                      <p className="text-black font-semibold text-2xl">${plan.plan.price_monthly.toFixed(2)}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-black mb-2">
                        Plan Type
                      </label>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                        plan.plan.is_trial
                          ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                          : "bg-[#C4B454]/20 text-[#B8A040] border-2 border-[#C4B454]"
                      }`}>
                        {plan.plan.is_trial ? "🎯 Trial" : "💎 Paid"}
                      </span>
                    </div>

                    <div className="pt-6 border-t-2 border-gray-200 mt-6">
                      <h3 className="text-lg font-bold text-black mb-4">Plan Limits</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-[#C4B454]/10 p-3 rounded-lg border border-[#C4B454]/30">
                          <span className="text-black font-medium">Uploads per month:</span>
                          <span className="font-bold text-black text-lg">{plan.plan.limits.uploads_per_month}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#C4B454]/10 p-3 rounded-lg border border-[#C4B454]/30">
                          <span className="text-black font-medium">Users limit:</span>
                          <span className="font-bold text-black text-lg">{plan.plan.limits.users_limit}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#C4B454]/10 p-3 rounded-lg border border-[#C4B454]/30">
                          <span className="text-black font-medium">Pages per month:</span>
                          <span className="font-bold text-black text-lg">{plan.plan.limits.pages_per_month}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#C4B454]/10 p-3 rounded-lg border border-[#C4B454]/30">
                          <span className="text-black font-medium">PDF exports:</span>
                          <span className="font-bold text-black text-lg">{plan.plan.limits.pdf_exports}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-black bg-gray-100 p-4 rounded-lg">No plan assigned</p>
                )
              ) : (
                <p className="text-black bg-gray-100 p-4 rounded-lg">Loading plan details...</p>
              )}
            </div>

            {/* Usage Statistics - Enhanced */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C4B454] to-[#B8A040] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Usage Statistics
                </h2>
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Current Period Toggle */}
                  <div className="flex items-center gap-2 mr-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCurrentPeriodOnly}
                        onChange={(e) => setShowCurrentPeriodOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C4B454]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C4B454]"></div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {showCurrentPeriodOnly ? "Current Period" : "All History"}
                      </span>
                    </label>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-[#C4B454]/30 focus:border-[#C4B454]"
                  >
                    {months.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    min="2000"
                    max="2100"
                    className="w-28 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-[#C4B454]/30 focus:border-[#C4B454]"
                  />
                </div>
              </div>

              {usage && plan?.plan ? (
                <div className="space-y-6">
                  {/* Period Info */}
                  <div className="text-sm text-black font-medium bg-gray-100 p-3 rounded-lg">
                    📅 Period: {format(new Date(usage.period_start), "MMM dd, yyyy")} - {format(new Date(usage.period_end), "MMM dd, yyyy")}
                  </div>

                  {/* Usage Metrics with Progress Bars */}
                  <div className="space-y-5">
                    {/* Uploads */}
                    {renderUsageMetric(
                      "Uploads",
                      usage.total_uploads,
                      plan.plan.limits.uploads_per_month,
                      "📤",
                      "#C4B454"
                    )}

                    {/* OCR Pages */}
                    {renderUsageMetric(
                      "OCR Pages",
                      usage.total_ocr_pages,
                      plan.plan.limits.pages_per_month,
                      "📄",
                      "#B8A040"
                    )}

                    {/* PDF Exports */}
                    {renderUsageMetric(
                      "PDF Exports",
                      usage.total_pdf_exports,
                      plan.plan.limits.pdf_exports,
                      "📑",
                      "#A69035"
                    )}

                    {/* Active Users */}
                    {renderUsageMetric(
                      "Active Users",
                      companyUsers.length,
                      plan.plan.limits.users_limit,
                      "👥",
                      "#8B7355"
                    )}
                  </div>

                  {/* Overall Status Summary */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Plan Status</p>
                        <p className="text-lg font-bold text-black">
                          {getOverallStatus(
                            usage.total_uploads,
                            plan.plan.limits.uploads_per_month,
                            usage.total_ocr_pages,
                            plan.plan.limits.pages_per_month,
                            usage.total_pdf_exports,
                            plan.plan.limits.pdf_exports,
                            companyUsers.length,
                            plan.plan.limits.users_limit
                          )}
                        </p>
                      </div>
                      {plan.plan_expires_at && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">Plan Expires</p>
                          <p className="text-lg font-bold text-black">
                            {format(new Date(plan.plan_expires_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : usage ? (
                <div className="space-y-4">
                  <div className="text-sm text-black font-medium bg-gray-100 p-3 rounded-lg">
                    📅 Period: {format(new Date(usage.period_start), "MMM dd, yyyy")} - {format(new Date(usage.period_end), "MMM dd, yyyy")}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-[#C4B454]/10 to-[#B8A040]/10 rounded-xl p-5 border-2 border-[#C4B454]/30 shadow-md">
                      <p className="text-sm text-black font-bold mb-2">Total Uploads</p>
                      <p className="text-3xl font-bold text-[#C4B454]">{usage.total_uploads}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#C4B454]/10 to-[#B8A040]/10 rounded-xl p-5 border-2 border-[#C4B454]/30 shadow-md">
                      <p className="text-sm text-black font-bold mb-2">OCR Pages</p>
                      <p className="text-3xl font-bold text-[#B8A040]">{usage.total_ocr_pages}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#C4B454]/10 to-[#B8A040]/10 rounded-xl p-5 border-2 border-[#C4B454]/30 shadow-md">
                      <p className="text-sm text-black font-bold mb-2">PDF Exports</p>
                      <p className="text-3xl font-bold text-[#A69035]">{usage.total_pdf_exports}</p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    ⚠️ No plan assigned - showing basic usage data only
                  </p>
                </div>
              ) : (
                <p className="text-black bg-gray-100 p-4 rounded-lg">Loading usage statistics...</p>
              )}

              {/* Historical Usage Summary */}
              {usageHistory && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <span>📊</span> Usage Comparison
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Period Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                      <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Current Plan Period
                        {usageHistory.plan_started_at && (
                          <span className="text-xs text-green-600 font-medium">
                            (Since {format(new Date(usageHistory.plan_started_at), "MMM dd, yyyy")})
                          </span>
                        )}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Uploads</p>
                          <p className="text-xl font-bold text-green-700">{usageHistory.current_period_summary.total_uploads}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">OCR Pages</p>
                          <p className="text-xl font-bold text-green-700">{usageHistory.current_period_summary.total_ocr_pages}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">PDF Exports</p>
                          <p className="text-xl font-bold text-green-700">{usageHistory.current_period_summary.total_pdf_exports}</p>
                        </div>
                      </div>
                    </div>

                    {/* All-Time Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                      <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        All-Time Total (Historical)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Uploads</p>
                          <p className="text-xl font-bold text-blue-700">{usageHistory.all_time_summary.total_uploads}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">OCR Pages</p>
                          <p className="text-xl font-bold text-blue-700">{usageHistory.all_time_summary.total_ocr_pages}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">PDF Exports</p>
                          <p className="text-xl font-bold text-blue-700">{usageHistory.all_time_summary.total_pdf_exports}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Users */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C4B454] to-[#B8A040] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                Company Users ({companyUsers.length})
              </h2>

              {companyUsers.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {companyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-black text-lg">{user.name}</p>
                        <p className="text-sm text-gray-700 font-medium">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-2 rounded-lg text-xs font-bold shadow-sm mb-2 ${
                          user.role === "superadmin"
                            ? "bg-red-100 text-red-800 border-2 border-red-300"
                            : user.role === "company_admin"
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-800 border-2 border-gray-300"
                        }`}>
                          {user.role === "superadmin" ? "🔴 Super Admin" : user.role === "company_admin" ? "🔵 Admin" : "👤 User"}
                        </span>
                        <p className="text-xs text-black font-medium">
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black bg-gray-100 p-4 rounded-lg">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Export Data
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Choose what data you want to export to Excel. The export includes company information, plan details, usage statistics, and user lists.
            </p>

            <div className="space-y-3">
              {/* Export All Companies */}
              <button
                onClick={() => handleExport(true)}
                disabled={isExporting}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-left">
                    <p className="font-bold">Export All Companies</p>
                    <p className="text-sm text-blue-100">{companies.length} companies</p>
                  </div>
                </div>
                {isExporting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {/* Export Selected Company */}
              <button
                onClick={() => handleExport(false)}
                disabled={isExporting || !selectedCompanyId}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-bold">Export Selected Company</p>
                    <p className="text-sm text-green-100">
                      {selectedCompanyId ? companyDetails?.name || "Selected company" : "No company selected"}
                    </p>
                  </div>
                </div>
                {isExporting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Excel Report includes:</strong> Companies overview, Plan details, Current & Historical usage, Users list
                </span>
              </p>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
    </div>
  );
}

