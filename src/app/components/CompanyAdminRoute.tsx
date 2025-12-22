"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";

interface CompanyAdminRouteProps {
  children: React.ReactNode;
}

export default function CompanyAdminRoute({ children }: CompanyAdminRouteProps) {
  const { user, isAuthenticated, isSuperAdmin, isCompanyAdmin, loading } = useAuth();
  const router = useRouter();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        const currentPath = window.location.pathname;
        router.push(`/pages/Login?returnUrl=${encodeURIComponent(currentPath)}`);
      } else if (!isSuperAdmin && !isCompanyAdmin) {
        // Show unauthorized message for regular users
        setShowUnauthorized(true);
        // Redirect to home after 3 seconds
        const timeout = setTimeout(() => {
          router.push("/?error=unauthorized");
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isAuthenticated, isSuperAdmin, isCompanyAdmin, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loading message="Verifying admin access..." />;
  }

  // Show unauthorized message for regular users
  if (showUnauthorized && !isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              This page is only accessible to Company Administrators or Super Administrators.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <p className="text-sm text-gray-600">
                Logged in as: <span className="font-bold text-gray-900">{user?.name}</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                User
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <p>Redirecting to home page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin
  if (!isAuthenticated || (!isSuperAdmin && !isCompanyAdmin)) {
    return null;
  }

  return <>{children}</>;
}

