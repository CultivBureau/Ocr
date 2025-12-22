"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import SuperAdminRoute from "@/app/components/SuperAdminRoute";
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  assignPlan,
  activateCompany,
  type Company,
} from "@/app/services/CompanyApi";
import { getAllPlans, type Plan } from "@/app/services/PlanApi";
import { format } from "date-fns";

export default function CompaniesPage() {
  return (
    <SuperAdminRoute>
      <CompaniesContent />
    </SuperAdminRoute>
  );
}

function CompaniesContent() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formName, setFormName] = useState("");
  const [formPlanId, setFormPlanId] = useState<string | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [companiesData, plansData] = await Promise.all([
        getAllCompanies(0, 1000),
        getAllPlans(0, 1000, true),
      ]);
      setCompanies(companiesData);
      setPlans(plansData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      setError("Company name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await createCompany({
        name: formName.trim(),
        plan_id: formPlanId || null,
        is_active: formIsActive,
      });
      setSuccess("Company created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create company";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCompany || !formName.trim()) {
      setError("Company name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await updateCompany(editingCompany.id, {
        name: formName.trim(),
        plan_id: formPlanId || null,
        is_active: formIsActive,
      });
      setSuccess("Company updated successfully");
      setEditingCompany(null);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update company";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to deactivate this company?")) return;

    try {
      await deleteCompany(companyId);
      setSuccess("Company deactivated successfully");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deactivate company";
      setError(message);
    }
  };

  const handleActivate = async (companyId: string) => {
    try {
      await activateCompany(companyId);
      setSuccess("Company activated successfully");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to activate company";
      setError(message);
    }
  };

  const handleAssignPlan = async (companyId: string, planId: string) => {
    try {
      await assignPlan(companyId, planId);
      setSuccess("Plan assigned successfully");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to assign plan";
      setError(message);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormPlanId(null);
    setFormIsActive(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormName(company.name);
    setFormPlanId(company.plan_id || null);
    setFormIsActive(company.is_active);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCompany(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
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
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Companies Management
            </h1>
            <p className="text-gray-600">Manage all companies in the system</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            + Create Company
          </button>
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

        {/* Companies List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">No companies found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg"
            >
              Create First Company
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              const plan = plans.find((p) => p.id === company.plan_id);
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                    company.is_active ? "border-green-200" : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            company.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {company.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {plan && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Plan</p>
                      <p className="text-sm font-semibold text-purple-700">{plan.name}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Created: {format(new Date(company.created_at), "MMM d, yyyy")}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(company)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                    >
                      Edit
                    </button>
                    {company.is_active ? (
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(company.id)}
                        className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                      >
                        Activate
                      </button>
                    )}
                  </div>

                  {plans.length > 0 && (
                    <div className="mt-3">
                      <select
                        value={company.plan_id || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignPlan(company.id, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">No Plan</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCompany) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCompany ? "Edit Company" : "Create Company"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan (Optional)
                </label>
                <select
                  value={formPlanId || ""}
                  onChange={(e) => setFormPlanId(e.target.value || null)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="">No Plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCompany ? handleUpdate : handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCompany ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

