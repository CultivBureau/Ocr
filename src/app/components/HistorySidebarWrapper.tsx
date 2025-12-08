"use client";

import HistorySidebar from "./HistorySidebar";

export default function HistorySidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <HistorySidebar />
    </>
  );
}

