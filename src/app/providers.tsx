"use client";

import { AuthProvider } from "./contexts/AuthContext";
import { HistoryProvider } from "./contexts/HistoryContext";
import { ToastProvider } from "./components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HistoryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </HistoryProvider>
    </AuthProvider>
  );
}

