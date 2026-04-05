"use client";

import React, { useCallback, useState } from "react";
import { legacySectionContentToHtml } from "../utils/legacySectionContentToHtml";
import SectionContentEditor from "./SectionContentEditor";
import TermsStaticDisplay from "./TermsStaticDisplay";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";

function isEmptyTiptapHtml(html: string): boolean {
  if (!html.trim()) return true;
  if (typeof document === "undefined") {
    return !html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return !(el.textContent || "").trim();
}

export interface TermsAndConditionsEditorProps {
  resolvedDisplay: string | null;
  companyDefault: string | null;
  editable: boolean;
  onSave: (html: string | null) => void | Promise<void>;
  isSaving?: boolean;
}

/**
 * Click the footer terms area to open Tiptap (same as sections). Persists only via onSave → document override.
 */
export default function TermsAndConditionsEditor({
  resolvedDisplay,
  companyDefault,
  editable,
  onSave,
  isSaving = false,
}: TermsAndConditionsEditorProps) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const seedHtml = useCallback(() => {
    const raw = resolvedDisplay ?? companyDefault ?? "";
    return legacySectionContentToHtml(raw);
  }, [resolvedDisplay, companyDefault]);

  const handleOpen = () => {
    setDraft(seedHtml());
    setOpen(true);
  };

  const handleDone = async () => {
    const next = isEmptyTiptapHtml(draft) ? null : draft;
    await Promise.resolve(onSave(next));
    setOpen(false);
  };

  const handleResetCompany = async () => {
    await Promise.resolve(onSave(null));
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const showBlock =
    editable ||
    (resolvedDisplay != null && resolvedDisplay.trim() !== "") ||
    (companyDefault != null && companyDefault.trim() !== "");

  if (!showBlock && !editable) {
    return null;
  }

  const line = (
    <div
      style={{
        borderTop: "1.5px solid #C4B454",
        marginBottom: "8px",
      }}
    />
  );

  if (!editable) {
    const text = resolvedDisplay ?? "";
    if (!text.trim()) return null;
    return (
      <div className="w-full px-6 pb-4" dir="auto" style={{ pageBreakInside: "avoid" }}>
        {line}
        <TermsStaticDisplay content={text} />
      </div>
    );
  }

  if (!open) {
    const display = resolvedDisplay ?? companyDefault;
    const hasContent = !!(display && display.trim());
    return (
      <div className="w-full px-6 pb-4" dir="auto" style={{ pageBreakInside: "avoid" }}>
        {line}
        <button
          type="button"
          onClick={handleOpen}
          disabled={isSaving}
          className="w-full rounded-lg border border-transparent p-1 text-right transition hover:border-amber-300 hover:bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
        >
          {hasContent ? (
            <TermsStaticDisplay content={display!} />
          ) : (
            <span
              style={{
                fontFamily: "'Cairo', 'Arial', sans-serif",
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              {isRTL
                ? "انقر لتحرير الشروط والأحكام لهذا المستند فقط"
                : "Click to edit terms for this document only"}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 pb-4" dir="auto" style={{ pageBreakInside: "avoid" }}>
      {line}
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <SectionContentEditor
          value={draft}
          onChange={setDraft}
          editable={!isSaving}
          showFooterHint={false}
          className="terms-footer-editor"
        />
        <div
          className={`flex flex-wrap items-center gap-2 border-t border-amber-100 bg-amber-50/40 px-3 py-2 ${isRTL ? "flex-row-reverse" : "justify-between"}`}
        >
          <button
            type="button"
            onClick={handleResetCompany}
            disabled={isSaving || !companyDefault?.trim()}
            className="text-sm text-amber-800 hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.modals.documentTermsResetToCompany}
          </button>
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-white"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={isSaving}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {isSaving ? "…" : t.common.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
