"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setAuthToken } from "@/app/utils/Cookis";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      // Handle error
      console.error("Authentication error:", errorParam);
      setError(errorParam);
      setTimeout(() => {
        router.push("/pages/Login?error=" + encodeURIComponent(errorParam));
      }, 2000);
      return;
    }

    if (token) {
      // Store token
      setAuthToken(token);
      
      // Redirect to home
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      // No token or error, redirect to login
      setTimeout(() => {
        router.push("/pages/Login");
      }, 1000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we sign you in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
