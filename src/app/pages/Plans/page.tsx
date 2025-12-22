"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAllPlans, createPlan, updatePlan, deletePlan, type Plan, type PlanCreate } from "@/app/services/PlanApi";
import { format } from "date-fns";

export default function PlansPage() {
  return <PlansContent />;
}

function PlansContent() {
  const { user, isSuperAdmin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formIsTrial, setFormIsTrial] = useState(false);
  const [formDurationDays, setFormDurationDays] = useState<number | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLimits, setFormLimits] = useState({
    uploads_per_month: 0,
    users_limit: 1,
    pages_per_month: 0,
    pdf_exports: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError("");
      const plansData = await getAllPlans(0, 1000);
      setPlans(plansData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch plans";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      setError("Plan name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const planData: PlanCreate = {
        name: formName.trim(),
        price_monthly: formPrice,
        is_trial: formIsTrial,
        duration_days: formDurationDays,
        is_active: formIsActive,
        limits: formLimits,
      };
      await createPlan(planData);
      setSuccess("Plan created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create plan";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPlan || !formName.trim()) {
      setError("Plan name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await updatePlan(editingPlan.id, {
        name: formName.trim(),
        price_monthly: formPrice,
        is_trial: formIsTrial,
        duration_days: formDurationDays,
        is_active: formIsActive,
        limits: formLimits,
      });
      setSuccess("Plan updated successfully");
      setEditingPlan(null);
      resetForm();
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update plan";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to deactivate this plan?")) return;

    try {
      await deletePlan(planId);
      setSuccess("Plan deactivated successfully");
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deactivate plan";
      setError(message);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormPrice(0);
    setFormIsTrial(false);
    setFormDurationDays(null);
    setFormIsActive(true);
    setFormLimits({
      uploads_per_month: 0,
      users_limit: 1,
      pages_per_month: 0,
      pdf_exports: 0,
    });
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.price_monthly);
    setFormIsTrial(plan.is_trial);
    setFormDurationDays(plan.duration_days);
    setFormIsActive(plan.is_active);
    setFormLimits(plan.limits);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
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
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Subscription Plans
            </h1>
            <p className="text-gray-600">
              {isSuperAdmin ? "Manage subscription plans" : "View available plans"}
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
            >
              + Create Plan
            </button>
          )}
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

        {/* Plans List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">No plans found</p>
            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg"
              >
                Create First Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                  plan.is_active ? "border-indigo-200" : "border-gray-200 opacity-60"
                } ${plan.is_trial ? "border-green-300 bg-green-50/30" : ""}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      {plan.is_trial && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        ${plan.price_monthly.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          plan.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploads/month:</span>
                    <span className="font-semibold">
                      {plan.limits.uploads_per_month === 0 ? "Unlimited" : plan.limits.uploads_per_month}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Users:</span>
                    <span className="font-semibold">{plan.limits.users_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages/month:</span>
                    <span className="font-semibold">
                      {plan.limits.pages_per_month === 0 ? "Unlimited" : plan.limits.pages_per_month}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PDF Exports:</span>
                    <span className="font-semibold">
                      {plan.limits.pdf_exports === 0 ? "Unlimited" : plan.limits.pdf_exports}
                    </span>
                  </div>
                  {plan.is_trial && plan.duration_days && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{plan.duration_days} days</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created: {format(new Date(plan.created_at), "MMM d, yyyy")}
                </div>

                {isSuperAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                    >
                      Deactivate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal (Super Admin only) */}
      {isSuperAdmin && (showCreateModal || editingPlan) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPlan ? "Edit Plan" : "Create Plan"}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter plan name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration Days (Trial)
                  </label>
                  <input
                    type="number"
                    value={formDurationDays || ""}
                    onChange={(e) => setFormDurationDays(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTrial"
                    checked={formIsTrial}
                    onChange={(e) => setFormIsTrial(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isTrial" className="text-sm font-medium text-gray-700">
                    Is Trial Plan
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Uploads/Month (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formLimits.uploads_per_month}
                      onChange={(e) =>
                        setFormLimits({ ...formLimits, uploads_per_month: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Users Limit
                    </label>
                    <input
                      type="number"
                      value={formLimits.users_limit}
                      onChange={(e) =>
                        setFormLimits({ ...formLimits, users_limit: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pages/Month (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formLimits.pages_per_month}
                      onChange={(e) =>
                        setFormLimits({ ...formLimits, pages_per_month: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PDF Exports (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formLimits.pdf_exports}
                      onChange={(e) =>
                        setFormLimits({ ...formLimits, pdf_exports: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPlan ? handleUpdate : handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingPlan ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

