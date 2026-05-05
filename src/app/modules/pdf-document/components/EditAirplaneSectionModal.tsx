"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Megaphone, BarChart3, ArrowLeft, ArrowRight } from "lucide-react";
import { saveAirplaneTemplate } from "@/app/modules/pdf-document/services/TemplatesApi";
import DeleteConfirmationModal from "@/app/modules/shared/components/DeleteConfirmationModal";
import { FlightData } from './AddAirplaneModal';
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import type { AirplaneBuiltinColumnKey, AirplaneColumnConfigItem } from "@/app/modules/pdf-document/types/airplaneColumnConfig";
import {
  defaultBuiltinColumnItem,
  generateCustomAirplaneColumnId,
  getDefaultAirplaneColumnConfig,
  getMissingBuiltinKeys,
  resolveAirplaneColumnConfig,
  syncFlightsCustomColumnValues,
} from "@/app/modules/pdf-document/types/airplaneColumnConfig";

interface EditAirplaneSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    showTitle?: boolean;
    noticeMessage?: string;
    showNotice?: boolean;
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
    columnConfig: AirplaneColumnConfigItem[];
    flights: FlightData[];
  }) => void;
  initialData: {
    title?: string;
    showTitle?: boolean;
    noticeMessage?: string;
    showNotice?: boolean;
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
    flights?: FlightData[];
    columnConfig?: AirplaneColumnConfigItem[];
    columnLabels?: {
      date?: string; arrivalTime?: string; departureTime?: string;
      airlineCompany?: string; fromAirport?: string; toAirport?: string;
      travelers?: string; luggage?: string;
    };
  } | null;
}

const TOTAL_STEPS = 2;

const Toggle = ({ checked, onChange, color = "bg-[#4A5568]" }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? color : "bg-gray-200"}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
  </button>
);

const StepIndicator = ({ steps, current, onClickStep }: { steps: { label: string; sub: string }[]; current: number; onClickStep: (n: number) => void }) => (
  <div className="flex items-start justify-center pb-4 gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <button type="button" onClick={() => i + 1 < current && onClickStep(i + 1)} className="flex flex-col items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${current > i + 1 ? "bg-emerald-400 border-emerald-400 text-white" : current === i + 1 ? "bg-white border-white text-[#4A5568] shadow-lg" : "bg-transparent border-white/30 text-white/40"}`}>
            {current > i + 1 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : i + 1}
          </div>
          <div className="text-center mt-1 px-1">
            <p className={`text-xs font-semibold transition-all ${current === i + 1 ? "text-white" : current > i + 1 ? "text-emerald-300" : "text-white/40"}`}>{step.label}</p>
            <p className="text-[10px] text-white/50 whitespace-nowrap">{step.sub}</p>
          </div>
        </button>
        {i < steps.length - 1 && <div className={`flex-1 h-0.5 mt-[18px] transition-all duration-500 ${current > i + 1 ? "bg-emerald-400" : "bg-white/20"}`} />}
      </React.Fragment>
    ))}
  </div>
);

export default function EditAirplaneSectionModal({ isOpen, onClose, onSubmit, initialData }: EditAirplaneSectionModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [title, setTitle] = useState("حجز الطيران");
  const [showTitle, setShowTitle] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState("التواجد في صاله المطار قبل الاقلاع بساعتين");
  const [showNotice, setShowNotice] = useState(true);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [columnConfig, setColumnConfig] = useState<AirplaneColumnConfigItem[]>(() => getDefaultAirplaneColumnConfig());
  const [newCustomColumnName, setNewCustomColumnName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || "حجز الطيران");
      setShowTitle(initialData.showTitle !== undefined ? initialData.showTitle : true);
      setNoticeMessage(initialData.noticeMessage || "التواجد في صاله المطار قبل الاقلاع بساعتين");
      setShowNotice(initialData.showNotice !== undefined ? initialData.showNotice : true);
      setDirection(initialData.direction || "rtl");
      setLanguage(initialData.language || "ar");
      const resolved = resolveAirplaneColumnConfig(initialData.columnConfig, initialData.columnLabels ?? undefined);
      setColumnConfig(resolved);
      const baseFlights = initialData.flights?.length ? initialData.flights : [];
      setFlights(syncFlightsCustomColumnValues(baseFlights, resolved));
      setNewCustomColumnName("");
      setCurrentStep(1);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnConfig.length === 0) { toast.error(t.modals.airplaneAtLeastOneColumn); return; }
    const syncedFlights = syncFlightsCustomColumnValues(flights, columnConfig);
    onSubmit({ title: title.trim() || undefined, showTitle, noticeMessage: noticeMessage.trim() || undefined, showNotice, direction, language, columnConfig, flights: syncedFlights });
    onClose();
  };

  const applyFlightsSync = (cfg: AirplaneColumnConfigItem[]) => setFlights((prev) => syncFlightsCustomColumnValues(prev, cfg));

  const moveColumn = (index: number, delta: -1 | 1) => {
    const j = index + delta;
    if (j < 0 || j >= columnConfig.length) return;
    const next = [...columnConfig];
    [next[index], next[j]] = [next[j], next[index]];
    setColumnConfig(next);
  };

  const removeColumnAt = (index: number) => {
    if (columnConfig.length <= 1) { toast.error(t.modals.airplaneAtLeastOneColumn); return; }
    const next = columnConfig.filter((_, i) => i !== index);
    setColumnConfig(next);
    applyFlightsSync(next);
  };

  const updateColumnLabels = (index: number, field: "labelAr" | "labelEn", value: string) => {
    const next = [...columnConfig];
    next[index] = { ...next[index], [field]: value } as AirplaneColumnConfigItem;
    setColumnConfig(next);
  };

  const addBuiltinColumn = (key: AirplaneBuiltinColumnKey) => {
    const next = [...columnConfig, defaultBuiltinColumnItem(key)];
    setColumnConfig(next);
    applyFlightsSync(next);
  };

  const addCustomColumn = () => {
    const raw = newCustomColumnName.trim();
    if (!raw) return;
    const item: AirplaneColumnConfigItem = { kind: "custom", id: generateCustomAirplaneColumnId(), labelAr: raw, labelEn: raw };
    const next = [...columnConfig, item];
    setColumnConfig(next);
    setNewCustomColumnName("");
    applyFlightsSync(next);
  };

  const missingBuiltin = getMissingBuiltinKeys(columnConfig);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { toast.error(language === 'ar' ? 'يرجى إدخال اسم القالب' : 'Please enter a template name'); return; }
    if (isSavingTemplate) return;
    try {
      setIsSavingTemplate(true);
      await saveAirplaneTemplate(templateName.trim(), { title, showTitle, noticeMessage, showNotice, flights: syncFlightsCustomColumnValues(flights, columnConfig), direction, language, columnConfig });
      setShowSaveTemplateModal(false);
      setTemplateName("");
      toast.success(language === 'ar' ? 'تم حفظ القالب بنجاح' : 'Template saved successfully');
    } catch { toast.error(language === 'ar' ? 'فشل حفظ القالب' : 'Failed to save template');
    } finally { setIsSavingTemplate(false); }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ name: title || "Airplane Section", template_type: "airplane", data: { title, showTitle, noticeMessage, showNotice, flights: syncFlightsCustomColumnValues(flights, columnConfig), direction, language, columnConfig }, exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `airplane-section-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      if (!importData.data) { toast.error(language === 'ar' ? 'ملف JSON غير صالح' : 'Invalid JSON file'); return; }
      const data = importData.data;
      if (data.title !== undefined) setTitle(data.title || "حجز الطيران");
      if (data.showTitle !== undefined) setShowTitle(data.showTitle);
      if (data.noticeMessage !== undefined) setNoticeMessage(data.noticeMessage || "");
      if (data.showNotice !== undefined) setShowNotice(data.showNotice);
      if (data.direction) setDirection(data.direction);
      if (data.language) setLanguage(data.language);
      if (data.flights && Array.isArray(data.flights)) {
        const cfg = resolveAirplaneColumnConfig(data.columnConfig, data.columnLabels ?? undefined);
        setColumnConfig(cfg);
        setFlights(syncFlightsCustomColumnValues(data.flights, cfg));
      }
      toast.success(language === 'ar' ? 'تم استيراد القالب بنجاح' : 'Template imported successfully');
    } catch { toast.error(language === 'ar' ? 'فشل استيراد القالب' : 'Failed to import template');
    } finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape") onClose(); };

  if (!isOpen) return null;

  const stepConfig = [
    { label: language === "ar" ? "الإعدادات" : "Settings", sub: language === "ar" ? "العنوان والإشعار" : "Title & Notice" },
    { label: language === "ar" ? "الأعمدة" : "Columns", sub: `${columnConfig.length} ${language === "ar" ? "أعمدة" : "cols"}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} dir={dir}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
        style={{ animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#4A5568] via-[#2D3748] to-[#1A202C] px-6 pt-5 pb-0">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t.modals.editAirplaneSection}</h2>
                <p className="text-xs text-white/60">{language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button type="button" onClick={handleExportJSON} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={t.modals.exportJson}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={t.modals.importJson}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </button>
              <button type="button" onClick={() => setShowSaveTemplateModal(true)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={t.modals.saveAsTemplate}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <StepIndicator steps={stepConfig} current={currentStep} onClickStep={setCurrentStep} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Step 1 — Settings */}
          {currentStep === 1 && (
            <div className="p-6 space-y-5">
              {/* Section title */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-lg">✈️</span>
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "عنوان القسم" : "Section Title"}</span>
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A5568] focus:border-transparent bg-white text-sm" placeholder={t.modals.flightBooking} />
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm text-gray-600">{t.modals.showTitle}</span>
                  <Toggle checked={showTitle} onChange={() => setShowTitle(!showTitle)} />
                </div>
              </div>

              {/* Language & Direction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ${isRTL ? "text-right" : ""}`}>{t.modals.language}</p>
                  <div className="flex gap-2">
                    {(["ar", "en"] as const).map((lang) => (
                      <button key={lang} type="button" onClick={() => { setLanguage(lang); setDirection(lang === "ar" ? "rtl" : "ltr"); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${language === lang ? "bg-[#4A5568] text-white border-[#4A5568] shadow" : "bg-white text-gray-600 border-gray-200 hover:border-[#4A5568]"}`}>
                        {lang === "ar" ? "🇸🇦 AR" : "🇺🇸 EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ${isRTL ? "text-right" : ""}`}>{t.modals.direction}</p>
                  <div className="flex gap-2">
                    {(["rtl", "ltr"] as const).map((d) => (
                      <button key={d} type="button" onClick={() => setDirection(d)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${direction === d ? "bg-[#4A5568] text-white border-[#4A5568] shadow" : "bg-white text-gray-600 border-gray-200 hover:border-[#4A5568]"}`}>
                        <span className="inline-flex items-center gap-1">
                          {d === "rtl" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          {d.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notice card */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Megaphone className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-bold text-amber-800">{t.modals.noticeMessage}</span>
                </div>
                <textarea value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-sm" rows={2} placeholder={t.modals.arrivalAirportNotice} />
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm text-amber-700">{t.modals.showNotice}</span>
                  <Toggle checked={showNotice} onChange={() => setShowNotice(!showNotice)} color="bg-amber-500" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Column Configuration */}
          {currentStep === 2 && (
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{t.modals.airplaneColumnsTitle}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t.modals.airplaneColumnsHelp}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {columnConfig.map((col, index) => (
                  <div key={col.kind === "builtin" ? col.key : col.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className={`flex flex-wrap items-end gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-full">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.kind === "builtin" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"}`}>
                          {col.kind === "builtin" ? `${t.modals.columnTypeBuiltin} · ${col.key}` : `${t.modals.columnTypeCustom} · ${col.id.slice(0, 12)}…`}
                        </span>
                      </div>
                      <div className="flex-1 min-w-[130px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">🇸🇦 العربية</label>
                        <input type="text" value={col.labelAr} onChange={(e) => updateColumnLabels(index, "labelAr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent" dir="rtl" />
                      </div>
                      <div className="flex-1 min-w-[130px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">🇺🇸 English</label>
                        <input type="text" value={col.labelEn} onChange={(e) => updateColumnLabels(index, "labelEn", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent" dir="ltr" />
                      </div>
                      <div className={`flex gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <button type="button" onClick={() => moveColumn(index, -1)} disabled={index === 0} className="px-2 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors" title={t.modals.moveColumnUp}>↑</button>
                        <button type="button" onClick={() => moveColumn(index, 1)} disabled={index === columnConfig.length - 1} className="px-2 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors" title={t.modals.moveColumnDown}>↓</button>
                        <button type="button" onClick={() => removeColumnAt(index)} className="px-2 py-2 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors" title={t.modals.airplaneRemoveColumn}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add standard columns */}
              {missingBuiltin.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-2">+ {t.modals.addStandardColumn}</p>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {missingBuiltin.map((key) => {
                      const ref = defaultBuiltinColumnItem(key);
                      return (
                        <button key={key} type="button" onClick={() => addBuiltinColumn(key)} className="px-3 py-1.5 text-xs font-medium bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors">
                          + {ref.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add custom column */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-bold text-amber-700 mb-2">✨ {language === "ar" ? "إضافة عمود مخصص" : "Add Custom Column"}</p>
                <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <input
                    type="text"
                    value={newCustomColumnName}
                    onChange={(e) => setNewCustomColumnName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColumn(); } }}
                    className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    placeholder={t.modals.newColumnNamePlaceholder}
                  />
                  <button type="button" onClick={addCustomColumn} className="px-4 py-2 bg-[#4A5568] text-white text-sm font-semibold rounded-lg hover:bg-[#2D3748] transition-colors">
                    {t.common.add}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className={`bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">{t.common.cancel}</button>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep((s) => s - 1)} className={`px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {language === "ar" ? "السابق" : "Back"}
              </button>
            )}
            {currentStep < TOTAL_STEPS ? (
              <button type="button" onClick={() => setCurrentStep((s) => s + 1)} className={`px-5 py-2 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-lg hover:from-[#2D3748] hover:to-[#1A202C] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {language === "ar" ? "التالي" : "Next"} {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit} className={`px-5 py-2 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-lg hover:from-[#2D3748] hover:to-[#1A202C] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t.common.save}
              </button>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </div>

      <style jsx>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSaveTemplateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()} dir={dir}>
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? "text-right" : ""}`}>{t.modals.saveAsTemplate}</h3>
            <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveTemplate(); } }} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5568] focus:border-transparent mb-4 ${isRTL ? "text-right" : ""}`} placeholder={t.modals.enterTemplateName} autoFocus />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button onClick={() => setShowSaveTemplateModal(false)} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">{t.common.cancel}</button>
              <button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#4A5568] rounded-lg hover:bg-[#2D3748] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSavingTemplate && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                {isSavingTemplate ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
