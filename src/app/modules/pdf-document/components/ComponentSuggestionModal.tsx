"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import type { ComponentSuggestion } from "../types/ExtractTypes";
import SuggestionRealPreview from "./SuggestionRealPreview";
import SuggestionEditModal from "./SuggestionEditModal";

interface ComponentSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: ComponentSuggestion[];
  onApprove: (suggestion: ComponentSuggestion) => void;
  onReject: (suggestionId: string) => void;
  onApproveAll: (suggestions: ComponentSuggestion[]) => void;
  onRejectAll: () => void;
}

const ComponentSuggestionModal: React.FC<ComponentSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApprove,
  onReject,
  onApproveAll,
  onRejectAll,
}) => {
  const { t, language, dir } = useLanguage();
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [draftSuggestions, setDraftSuggestions] = useState<ComponentSuggestion[]>(suggestions);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);

  const handleApprove = (suggestion: ComponentSuggestion) => {
    setApprovedIds((prev) => new Set(prev).add(suggestion.id));
    setRejectedIds((prev) => {
      const next = new Set(prev);
      next.delete(suggestion.id);
      return next;
    });
    onApprove(suggestion);
  };

  const handleReject = (suggestionId: string) => {
    setRejectedIds((prev) => new Set(prev).add(suggestionId));
    setApprovedIds((prev) => {
      const next = new Set(prev);
      next.delete(suggestionId);
      return next;
    });
    onReject(suggestionId);
  };

  const handleApproveAllClick = () => {
    const activeSuggestions = draftSuggestions.filter((suggestion) => !rejectedIds.has(suggestion.id));

    setApprovedIds((prev) => {
      const next = new Set(prev);
      activeSuggestions.forEach((suggestion) => next.add(suggestion.id));
      return next;
    });
    setRejectedIds((prev) => {
      const next = new Set(prev);
      activeSuggestions.forEach((suggestion) => next.delete(suggestion.id));
      return next;
    });
    onApproveAll(activeSuggestions);
  };

  const handleRejectAllClick = () => {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      draftSuggestions.forEach((suggestion) => {
        if (!approvedIds.has(suggestion.id)) next.add(suggestion.id);
      });
      return next;
    });
    setApprovedIds((prev) => {
      const next = new Set(prev);
      draftSuggestions.forEach((suggestion) => next.delete(suggestion.id));
      return next;
    });
    onRejectAll();
  };

  const handleSaveDraft = (updatedSuggestion: ComponentSuggestion) => {
    setDraftSuggestions((prev) =>
      prev.map((item) => (item.id === updatedSuggestion.id ? updatedSuggestion : item))
    );
    setEditingSuggestionId(null);
  };

  const editingSuggestion =
    draftSuggestions.find((suggestion) => suggestion.id === editingSuggestionId) ?? null;

  const getTypeIcon = (type: ComponentSuggestion["type"]) => {
    switch (type) {
      case "airplane":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        );
      case "hotel":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
            <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.007zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
          </svg>
        );
      case "transport":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
          </svg>
        );
      case "extra_service":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" />
          </svg>
        );
      case "total_price":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-10v12m0-12c1.105 0 2 .895 2 2M12 6c-1.105 0-2 .895-2 2" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: ComponentSuggestion["type"]) => {
    switch (type) {
      case "airplane":
        return t.modals.flightBooking;
      case "hotel":
        return t.modals.hotelBooking;
      case "transport":
        return t.modals.transportation;
      case "extra_service":
        return language === "ar" ? "خدمات اخرى" : "Extra Services";
      case "total_price":
        return language === "ar" ? "الاجمالي كليا" : "Grand Total";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-700 bg-green-50";
    if (confidence >= 0.8) return "text-blue-700 bg-blue-50";
    return "text-amber-700 bg-amber-50";
  };

  const originalById = useMemo(
    () => new Map(suggestions.map((suggestion) => [suggestion.id, JSON.stringify(suggestion.data)])),
    [suggestions]
  );

  const pendingCount = draftSuggestions.filter(
    (suggestion) => !approvedIds.has(suggestion.id) && !rejectedIds.has(suggestion.id)
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 p-4 backdrop-blur-md" dir={dir}>
      <div className="flex h-[92vh] w-[min(90vw,86rem)] flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.22)]">
        <div className="border-b border-slate-200 bg-white/95 px-8 py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100">
                <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="space-y-3">
                <div>
                  <h2 className="text-[34px] font-bold leading-tight text-slate-950">{t.modals.componentSuggestions}</h2>
                  <p className="mt-1 text-[15px] text-slate-600">
                    {language === "ar"
                      ? `تم العثور على ${suggestions.length} ${t.modals.suggestionsFound}`
                      : `${suggestions.length} ${suggestions.length !== 1 ? t.modals.suggestionsFound : t.modals.suggestion} found`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {language === "ar" ? `قيد المراجعة ${pendingCount}` : `${pendingCount} pending`}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {language === "ar" ? `تمت الموافقة ${approvedIds.size}` : `${approvedIds.size} approved`}
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    {language === "ar" ? `مرفوض ${rejectedIds.size}` : `${rejectedIds.size} rejected`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={t.modals.close}
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <p className="text-sm leading-6 text-slate-600">
              {language === "ar"
                ? "راجع كل معاينة، عدّل التفاصيل عند الحاجة، ثم اعتمد فقط النسخة التي تريد إضافتها إلى المستند."
                : "Review each preview, adjust its details when needed, then approve only the version you want added to the document."}
            </p>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                onClick={handleApproveAllClick}
                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                {t.modals.approveAll}
              </button>
              <button
                onClick={handleRejectAllClick}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                {t.modals.rejectAll}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-6 py-6 md:px-8">
          {suggestions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">{t.modals.noSuggestionsFound}</p>
            </div>
          ) : (
            draftSuggestions.map((suggestion) => {
              const isApproved = approvedIds.has(suggestion.id);
              const isRejected = rejectedIds.has(suggestion.id);
              const isEdited = originalById.get(suggestion.id) !== JSON.stringify(suggestion.data);

              return (
                <div
                  key={suggestion.id}
                  className={`mb-6 overflow-hidden rounded-[28px] border shadow-sm transition-all ${
                    isApproved
                      ? "border-green-300 bg-green-50/80"
                      : isRejected
                        ? "border-red-200 bg-red-50/70 opacity-70"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="border-b border-slate-200/80 bg-white px-6 py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`mt-0.5 shrink-0 rounded-2xl p-3 ring-1 ${
                            suggestion.type === "airplane"
                              ? "bg-blue-100 text-blue-600 ring-blue-100"
                              : suggestion.type === "hotel"
                                ? "bg-purple-100 text-purple-600 ring-purple-100"
                                : suggestion.type === "transport"
                                  ? "bg-red-100 text-red-600 ring-red-100"
                                  : suggestion.type === "extra_service"
                                    ? "bg-pink-100 text-pink-600 ring-pink-100"
                                    : "bg-green-100 text-green-600 ring-green-100"
                          }`}
                        >
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[28px] font-bold leading-tight text-slate-950">{getTypeLabel(suggestion.type)}</h3>
                            {isEdited && !isRejected && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                {language === "ar" ? "تم التعديل" : "Edited"}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceColor(suggestion.confidence)}`}>
                              {t.modals.confidence}: {(suggestion.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          {suggestion.reasoning && (
                            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">{suggestion.reasoning}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 xl:justify-end">
                        {!isApproved && !isRejected && (
                          <>
                            <button
                              onClick={() => setEditingSuggestionId(suggestion.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {t.common.edit}
                            </button>
                            <button
                              onClick={() => handleApprove(suggestion)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t.modals.approve}
                            </button>
                            <button
                              onClick={() => handleReject(suggestion.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {t.modals.reject}
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-green-100 px-5 py-3 text-sm font-semibold text-green-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t.modals.approved}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-red-100 px-5 py-3 text-sm font-semibold text-red-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t.modals.rejected}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/60 px-6 py-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-inner md:p-6">
                      <div className="max-h-[760px] overflow-auto rounded-[24px] border border-slate-100 bg-slate-50/40 p-3 md:p-5">
                        <div className={`mx-auto ${suggestion.type === "transport" || suggestion.type === "hotel" ? "min-w-[980px]" : "min-w-[760px]"} max-w-[1180px]`}>
                          <SuggestionRealPreview
                            suggestion={suggestion}
                            language={language as "ar" | "en"}
                            direction={dir as "rtl" | "ltr"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {suggestion.source_text && (
                    <details className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800">
                        {t.modals.showSourceText}
                      </summary>
                      <div className="mt-3 max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        {suggestion.source_text}
                      </div>
                    </details>
                  )}
                </div>
              );
            })
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white/95 px-8 py-5 backdrop-blur">
            <div className="text-sm text-slate-500">
              {language === "ar"
                ? `${draftSuggestions.length} اقتراحات في هذه الجلسة`
                : `${draftSuggestions.length} suggestions in this review`}
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              {t.modals.close}
            </button>
          </div>
        )}
      </div>

      <SuggestionEditModal
        key={editingSuggestion ? `${editingSuggestion.id}:${JSON.stringify(editingSuggestion.data)}` : "closed"}
        isOpen={!!editingSuggestion}
        suggestion={editingSuggestion}
        onClose={() => setEditingSuggestionId(null)}
        onSave={handleSaveDraft}
      />
    </div>
  );
};

export default ComponentSuggestionModal;
