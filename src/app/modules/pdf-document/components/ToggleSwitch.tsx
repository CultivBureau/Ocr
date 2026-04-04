"use client";

import React from "react";

type Mode = "code" | "preview" | "split";

export default function ToggleSwitch({ 
  mode, 
  onChange 
}: { 
  mode: Mode; 
  onChange: (next: Mode) => void;
}) {
  const isPreview = mode === "preview";
  const isSplit = mode === "split";

  function handleToggle() {
    if (isPreview) {
      onChange("code");
    } else if (isSplit) {
      onChange("preview");
    } else {
      onChange("split");
    }
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <span className={`text-sm ${!isPreview ? "font-semibold text-gray-900" : "text-gray-600"}`}>Code</span>
      <button
        type="button"
        role="switch"
        aria-checked={isPreview}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
          isPreview ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            isPreview ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-sm ${isPreview ? "font-semibold text-gray-900" : "text-gray-600"}`}>Preview</span>
    </div>
  );
}


