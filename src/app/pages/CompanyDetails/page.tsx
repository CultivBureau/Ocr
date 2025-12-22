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
  getCompanyUsers,
  getCompanyPlanDetails,
  type Company,
  type CompanyUsageSummary,
  type CompanyUsersResponse,
  type CompanyPlanDetails,
} from "@/app/services/CompanyApi";
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
  const [plan, setPlan] = useState<CompanyPlanDetails | null>(null);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Usage filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyDetails();
    } else {
      setCompanyDetails(null);
      setUsage(null);
      setPlan(null);
      setCompanyUsers([]);
    }
  }, [selectedCompanyId, selectedMonth, selectedYear]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError("");
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
      // Auto-select first company if available
      if (companiesData.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companiesData[0].id);
      }
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
      const [detailsData, usageData, planData, usersData] = await Promise.all([
        getCompany(selectedCompanyId),
        getCompanyUsage(selectedCompanyId, selectedMonth, selectedYear),
        getCompanyPlanDetails(selectedCompanyId),
        getCompanyUsers(selectedCompanyId, 0, 100),
      ]);
      setCompanyDetails(detailsData);
      setUsage(usageData);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logoHappylife.jpg"
                alt="HappyLife Travel & Tourism"
                width={180}
                height={60}
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Company Details
          </h1>
          <p className="text-gray-600">View detailed information for any company</p>
        </div>

        {/* Company Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Company
          </label>
          <select
            value={selectedCompanyId || ""}
            onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a company --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} {company.is_active ? "(Active)" : "(Inactive)"}
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
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">Please select a company to view details</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading company details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Company Information
              </h2>

              {companyDetails && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Name
                    </label>
                    <p className="text-gray-900 font-medium">{companyDetails.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      companyDetails.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {companyDetails.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Created At
                    </label>
                    <p className="text-gray-600">
                      {format(new Date(companyDetails.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>

                  {companyDetails.plan_started_at && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Plan Started
                      </label>
                      <p className="text-gray-600">
                        {format(new Date(companyDetails.plan_started_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}

                  {companyDetails.plan_expires_at && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Plan Expires
                      </label>
                      <p className="text-gray-600">
                        {format(new Date(companyDetails.plan_expires_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Branding Images */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Branding Images</h3>
                    
                    {companyDetails.header_image && (
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Header Image
                        </label>
                        <img
                          src={companyDetails.header_image.startsWith("http") ? companyDetails.header_image : `${API_BASE_URL}${companyDetails.header_image}`}
                          alt="Header"
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {companyDetails.footer_image && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Footer Image
                        </label>
                        <img
                          src={companyDetails.footer_image.startsWith("http") ? companyDetails.footer_image : `${API_BASE_URL}${companyDetails.footer_image}`}
                          alt="Footer"
                          className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {!companyDetails.header_image && !companyDetails.footer_image && (
                      <p className="text-sm text-gray-500">No branding images uploaded</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Plan Details
              </h2>

              {plan ? (
                plan.plan ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Plan Name
                      </label>
                      <p className="text-gray-900 font-medium">{plan.plan.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Monthly Price
                      </label>
                      <p className="text-gray-900 font-medium">${plan.plan.price_monthly.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Plan Type
                      </label>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.plan.is_trial
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {plan.plan.is_trial ? "Trial" : "Paid"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Plan Limits</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uploads per month:</span>
                          <span className="font-semibold">{plan.plan.limits.uploads_per_month}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Users limit:</span>
                          <span className="font-semibold">{plan.plan.limits.users_limit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pages per month:</span>
                          <span className="font-semibold">{plan.plan.limits.pages_per_month}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PDF exports:</span>
                          <span className="font-semibold">{plan.plan.limits.pdf_exports}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No plan assigned</p>
                )
              ) : (
                <p className="text-gray-600">Loading plan details...</p>
              )}
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Usage Statistics
                </h2>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
                    className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {usage ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Uploads</p>
                      <p className="text-2xl font-bold text-blue-600">{usage.total_uploads}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">OCR Pages</p>
                      <p className="text-2xl font-bold text-green-600">{usage.total_ocr_pages}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">PDF Exports</p>
                      <p className="text-2xl font-bold text-purple-600">{usage.total_pdf_exports}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Period: {format(new Date(usage.period_start), "MMM dd, yyyy")} - {format(new Date(usage.period_end), "MMM dd, yyyy")}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading usage statistics...</p>
              )}
            </div>

            {/* Company Users */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                Company Users ({companyUsers.length})
              </h2>

              {companyUsers.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {companyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          user.role === "superadmin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "company_admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

