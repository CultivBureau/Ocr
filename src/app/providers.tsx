"use client";

import { AuthProvider } from "@/app/modules/auth/contexts/AuthContext";
import { HistoryProvider } from "@/app/modules/history/contexts/HistoryContext";
import { LanguageProvider } from "@/app/modules/shared/contexts/LanguageContext";
import { ToastProvider } from "@/app/modules/shared/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HistoryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </HistoryProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

//////////////