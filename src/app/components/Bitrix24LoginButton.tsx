"use client";

import React from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export default function Bitrix24LoginButton() {
  const { t } = useLanguage();

  const handleBitrix24Login = () => {
    window.location.href = `${API_BASE_URL}/auth/bitrix24/login`;
  };

  return (
    <button
      onClick={handleBitrix24Login}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#2FC6F6] hover:bg-[#1BA8D6] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h11v11H0V0zm13 0h11v11H13V0zM0 13h11v11H0V13zm13 0h11v11H13V13z"/>
      </svg>
      <span>{t("Continue with Bitrix24") || "Continue with Bitrix24"}</span>
    </button>
  );
}
