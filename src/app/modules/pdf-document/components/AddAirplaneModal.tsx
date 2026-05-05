"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Calendar, PlaneLanding, PlaneTakeoff, Building2, Link as LinkIcon, MapPin, Flag, Briefcase, Users, User, Baby, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import { getAirlineCompanies, addAirlineCompanyUser } from "@/app/modules/company-settings/services/CompanySettingsApi";
import {
  getAirplaneTemplates,
  saveAirplaneTemplate,
  deleteAirplaneTemplate,
  importAirplaneTemplate,
  Template,
} from "@/app/modules/pdf-document/services/TemplatesApi";
import AddAirlineCompanyModal from "./AddAirlineCompanyModal";
import DeleteConfirmationModal from "@/app/modules/shared/components/DeleteConfirmationModal";
import {
  columnLabel,
  getDefaultAirplaneColumnConfig,
  resolveAirplaneColumnConfig,
  syncFlightsCustomColumnValues,
} from "@/app/modules/pdf-document/types/airplaneColumnConfig";
import type { AirplaneColumnConfigItem } from "@/app/modules/pdf-document/types/airplaneColumnConfig";

export interface FlightData {
  date: string;
  arrivalTime?: string;
  departureTime?: string;
  airlineCompany?: string;
  airlineCompanyLink?: string;
  fromAirport: string;
  fromAirportLink?: string;
  toAirport: string;
  toAirportLink?: string;
  travelers: { adults: number; children: number; infants: number };
  luggage: string;
  note?: string;
  customColumnValues?: Record<string, string>;
}

interface AddAirplaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    showTitle?: boolean;
    noticeMessage?: string;
    showNotice?: boolean;
    flights: FlightData[];
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
    columnConfig?: AirplaneColumnConfigItem[];
  }) => void;
}

// ---- Toggle Switch ----
const Toggle = ({ checked, onChange, color = "bg-[#4A5568]" }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none ${checked ? color : "bg-gray-200"}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
  </button>
);

// ---- Step Indicator ----
const StepIndicator = ({
  steps,
  current,
  onClickStep,
  accentColor = "#4A5568",
}: {
  steps: { label: string; sub: string }[];
  current: number;
  onClickStep: (n: number) => void;
  accentColor?: string;
}) => (
  <div className="flex items-start justify-center pb-5 gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <button
          type="button"
          onClick={() => i + 1 < current && onClickStep(i + 1)}
          className={`flex flex-col items-center gap-1.5 min-w-[80px] transition-all duration-200 ${i + 1 < current ? "cursor-pointer" : "cursor-default"}`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
            current > i + 1 ? "bg-emerald-400 border-emerald-300 text-white shadow-lg" :
            current === i + 1 ? "bg-white border-white text-[#4A5568] shadow-lg" :
            "bg-transparent border-white/30 text-white/40"
          }`}>
            {current > i + 1 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : i + 1}
          </div>
          <div className="text-center">
            <div className={`text-xs font-semibold ${current >= i + 1 ? "text-white" : "text-white/40"}`}>{step.label}</div>
            <div className="text-white/40 text-[10px]">{step.sub}</div>
          </div>
        </button>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mt-[18px] mx-2 rounded-full transition-all duration-500 ${current > i + 1 ? "bg-emerald-400" : "bg-white/20"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default function AddAirplaneModal({ isOpen, onClose, onSubmit }: AddAirplaneModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [title, setTitle] = useState("حجز الطيران");
  const [showTitle, setShowTitle] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState("التواجد في صاله المطار قبل الاقلاع بساعتين");
  const [showNotice, setShowNotice] = useState(true);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const { user } = useAuth();
  const [airlineCompanies, setAirlineCompanies] = useState<string[]>([]);
  const [showAddAirlineModal, setShowAddAirlineModal] = useState(false);
  const [flights, setFlights] = useState<FlightData[]>([{
    date: new Date().toISOString().split("T")[0],
    arrivalTime: "", departureTime: "", airlineCompany: "", airlineCompanyLink: "",
    fromAirport: "", fromAirportLink: "", toAirport: "", toAirportLink: "",
    travelers: { adults: 1, children: 0, infants: 0 }, luggage: "20 كيلو", note: "",
  }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [columnConfig, setColumnConfig] = useState<AirplaneColumnConfigItem[]>(() => getDefaultAirplaneColumnConfig());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 2;

  const fetchAirlineCompanies = async () => {
    try {
      const result = await getAirlineCompanies();
      setAirlineCompanies(result.airline_companies || []);
    } catch { setAirlineCompanies([]); }
  };

  const fetchTemplates = async () => {
    try {
      const result = await getAirplaneTemplates();
      setTemplates(result.templates || []);
    } catch { setTemplates([]); }
  };

  useEffect(() => {
    if (isOpen) { fetchAirlineCompanies(); fetchTemplates(); }
  }, [isOpen]);

  const handleAddAirlineCompany = async (companyName: string) => {
    try {
      const result = await addAirlineCompanyUser(companyName);
      if (result?.airline_companies) {
        setAirlineCompanies(result.airline_companies);
        if (flights.length > 0) updateFlight(0, "airlineCompany", companyName);
      }
    } catch (err) { throw err; }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("حجز الطيران"); setShowTitle(true);
      setNoticeMessage("التواجد في صاله المطار قبل الاقلاع بساعتين"); setShowNotice(true);
      setDirection("rtl"); setLanguage("ar");
      setFlights([{
        date: new Date().toISOString().split("T")[0],
        arrivalTime: "", departureTime: "", airlineCompany: "", airlineCompanyLink: "",
        fromAirport: "", fromAirportLink: "", toAirport: "", toAirportLink: "",
        travelers: { adults: 1, children: 0, infants: 0 }, luggage: "20 كيلو", note: "",
      }]);
      setErrors({}); setShowTemplateSelection(false); setShowSaveTemplateModal(false);
      setTemplateName(""); setColumnConfig(getDefaultAirplaneColumnConfig()); setCurrentStep(1);
    }
  }, [isOpen]);

  const loadTemplate = (template: Template) => {
    const data = template.data;
    if (data.title !== undefined) setTitle(data.title || "حجز الطيران");
    if (data.showTitle !== undefined) setShowTitle(data.showTitle);
    if (data.noticeMessage !== undefined) setNoticeMessage(data.noticeMessage || "");
    if (data.showNotice !== undefined) setShowNotice(data.showNotice);
    if (data.direction) setDirection(data.direction);
    if (data.language) setLanguage(data.language);
    const cfg = resolveAirplaneColumnConfig(data.columnConfig, data.columnLabels ?? undefined);
    setColumnConfig(cfg);
    if (data.flights?.length > 0) setFlights(syncFlightsCustomColumnValues(data.flights, cfg));
    setShowTemplateSelection(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { toast.error(language === "ar" ? "يرجى إدخال اسم القالب" : "Please enter a template name"); return; }
    if (isSavingTemplate) return;
    try {
      setIsSavingTemplate(true);
      await saveAirplaneTemplate(templateName.trim(), { title, showTitle, noticeMessage, showNotice, flights: syncFlightsCustomColumnValues(flights, columnConfig), direction, language, columnConfig });
      setShowSaveTemplateModal(false); setTemplateName("");
      await fetchTemplates();
      toast.success(language === "ar" ? "تم حفظ القالب بنجاح" : "Template saved successfully");
    } catch { toast.error(language === "ar" ? "فشل حفظ القالب" : "Failed to save template"); }
    finally { setIsSavingTemplate(false); }
  };

  const handleExportJSON = () => {
    const exportData = { name: title || "Airplane Section", template_type: "airplane", data: { title, showTitle, noticeMessage, showNotice, flights: syncFlightsCustomColumnValues(flights, columnConfig), direction, language, columnConfig }, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `airplane-template-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text(); const importData = JSON.parse(text);
      if (!importData.data?.flights) { toast.error(language === "ar" ? "ملف JSON غير صالح" : "Invalid JSON file"); return; }
      const data = importData.data;
      if (data.title !== undefined) setTitle(data.title || "حجز الطيران");
      if (data.showTitle !== undefined) setShowTitle(data.showTitle);
      if (data.noticeMessage !== undefined) setNoticeMessage(data.noticeMessage || "");
      if (data.showNotice !== undefined) setShowNotice(data.showNotice);
      if (data.direction) setDirection(data.direction);
      if (data.language) setLanguage(data.language);
      const cfg = resolveAirplaneColumnConfig(data.columnConfig, data.columnLabels ?? undefined);
      setColumnConfig(cfg);
      if (data.flights?.length > 0) setFlights(syncFlightsCustomColumnValues(data.flights, cfg));
      toast.success(language === "ar" ? "تم استيراد القالب بنجاح" : "Template imported successfully");
    } catch { toast.error(language === "ar" ? "فشل استيراد القالب" : "Failed to import template"); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteAirplaneTemplate(templateId);
      setShowDeleteTemplateModal(false); setTemplateToDelete(null);
      await fetchTemplates();
      toast.success(language === "ar" ? "تم حذف القالب بنجاح" : "Template deleted successfully");
    } catch { toast.error(language === "ar" ? "فشل حذف القالب" : "Failed to delete template"); }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (flights.length === 0) newErrors.flights = "At least one flight is required";
    flights.forEach((flight, i) => {
      if (!flight.fromAirport.trim()) newErrors[`flight_${i}_from`] = "From airport is required";
      if (!flight.toAirport.trim()) newErrors[`flight_${i}_to`] = "To airport is required";
      if (!flight.date) newErrors[`flight_${i}_date`] = "Date is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAdvanceStep = (step: number): boolean => {
    if (step === 1) return true;
    if (step === 2) return validate();
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const synced = syncFlightsCustomColumnValues(flights.map(f => ({ ...f, note: f.note?.trim() || undefined })), columnConfig);
    onSubmit({ title: title.trim() || undefined, showTitle, noticeMessage: noticeMessage.trim() || undefined, showNotice, flights: synced, direction, language, columnConfig });
    onClose();
  };

  const addFlight = () => {
    const customIds = columnConfig.filter((c): c is Extract<AirplaneColumnConfigItem, { kind: "custom" }> => c.kind === "custom").map(c => c.id);
    const customColumnValues: Record<string, string> = {};
    customIds.forEach(id => { customColumnValues[id] = ""; });
    const newFlight: FlightData = { date: new Date().toISOString().split("T")[0], arrivalTime: "", departureTime: "", airlineCompany: "", airlineCompanyLink: "", fromAirport: "", fromAirportLink: "", toAirport: "", toAirportLink: "", travelers: { adults: 1, children: 0, infants: 0 }, luggage: "20 كيلو", note: "" };
    if (Object.keys(customColumnValues).length > 0) newFlight.customColumnValues = customColumnValues;
    setFlights([...flights, newFlight]);
  };

  const removeFlight = (index: number) => { if (flights.length > 1) setFlights(flights.filter((_, i) => i !== index)); };

  const updateFlight = (index: number, field: keyof FlightData | "travelers", value: any) => {
    const next = [...flights];
    if (field === "travelers") next[index] = { ...next[index], travelers: { ...next[index].travelers, ...value } };
    else next[index] = { ...next[index], [field]: value };
    setFlights(next);
  };

  const updateFlightCustomColumn = (index: number, columnId: string, value: string) => {
    const next = [...flights];
    next[index] = { ...next[index], customColumnValues: { ...next[index].customColumnValues, [columnId]: value } };
    setFlights(next);
  };

  if (!isOpen) return null;

  const stepConfig = [
    { label: language === "ar" ? "إعداد القسم" : "Setup", sub: language === "ar" ? "العنوان واللغة" : "Title & language" },
    { label: language === "ar" ? "الرحلات" : "Flights", sub: language === "ar" ? `${flights.length} رحلة` : `${flights.length} flight${flights.length !== 1 ? "s" : ""}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose} dir={dir}>
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
        style={{ animation: "modalIn 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-[#4A5568] via-[#3D4A5C] to-[#2D3748] px-6 pt-5 pb-0 shrink-0">
          <div className={`flex items-center justify-between mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="p-2.5 bg-white/15 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="text-lg font-bold text-white">{t.modals.addAirplaneSection}</h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button type="button" onClick={() => setShowTemplateSelection(!showTemplateSelection)}
                className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${showTemplateSelection ? "bg-white text-[#4A5568] shadow-lg" : "bg-white/15 text-white hover:bg-white/25"} ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="hidden sm:inline">{t.modals.savedTemplates}</span>
                {templates.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${showTemplateSelection ? "bg-[#4A5568] text-white" : "bg-white/25 text-white"}`}>{templates.length}</span>
                )}
              </button>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <StepIndicator steps={stepConfig} current={currentStep} onClickStep={setCurrentStep} />
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="p-6 space-y-4">
              {/* Templates Panel */}
              {showTemplateSelection && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                  <div className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <h3 className={`text-sm font-bold text-gray-800 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {t.modals.savedTemplates}
                    </h3>
                    {templates.length > 0 && <button type="button" onClick={() => setShowTemplateSelection(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">{t.modals.hide}</button>}
                  </div>
                  {templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {templates.map(tpl => (
                        <div key={tpl.id} onClick={() => loadTemplate(tpl)}
                          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate">{tpl.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{tpl.data?.flights?.length || 0} {t.modals.flightsCount}</p>
                          </div>
                          <button type="button" onClick={e => { e.stopPropagation(); setTemplateToDelete(tpl.id); setShowDeleteTemplateModal(true); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm font-semibold text-gray-600">{t.modals.noSavedTemplates}</p>
                      <p className="text-xs text-gray-400 mt-1">{t.modals.createAirplaneSectionDesc}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Section Title Card */}
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-2.5 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="p-2 bg-[#4A5568]/10 rounded-lg">
                    <svg className="w-4 h-4 text-[#4A5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">{language === "ar" ? "عنوان القسم" : "Section Title"}</h3>
                </div>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 focus:border-[#4A5568] transition-all text-sm shadow-sm mb-3"
                  placeholder={t.modals.flightBooking} dir={language === "ar" ? "rtl" : "ltr"}
                />
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Toggle checked={showTitle} onChange={() => setShowTitle(!showTitle)} />
                  <span className="text-sm text-gray-600">{t.modals.showTitle}</span>
                </div>
              </div>

              {/* Language & Direction Card */}
              <div className="bg-blue-50/40 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-2.5 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">{language === "ar" ? "اللغة والاتجاه" : "Language & Direction"}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{language === "ar" ? "اللغة" : "Language"}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ v: "ar", l: "العربية" }, { v: "en", l: "English" }].map(({ v, l }) => (
                        <button key={v} type="button" onClick={() => { setLanguage(v as any); setDirection(v === "ar" ? "rtl" : "ltr"); }}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${language === v ? "bg-[#4A5568] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-[#4A5568]/40"}`}
                        >
                          <span>{l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{language === "ar" ? "الاتجاه" : "Direction"}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ v: "rtl", l: "RTL" }, { v: "ltr", l: "LTR" }].map(({ v, l }) => (
                        <button key={v} type="button" onClick={() => setDirection(v as any)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${direction === v ? "bg-[#4A5568] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-[#4A5568]/40"}`}
                        >
                          {v === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                          <span>{l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Card */}
              <div className="bg-amber-50/40 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">{t.modals.noticeMessage}</h3>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs text-gray-400">{showNotice ? (language === "ar" ? "مرئي" : "Shown") : (language === "ar" ? "مخفي" : "Hidden")}</span>
                    <Toggle checked={showNotice} onChange={() => setShowNotice(!showNotice)} color="bg-amber-500" />
                  </div>
                </div>
                <textarea value={noticeMessage} onChange={e => setNoticeMessage(e.target.value)} rows={2}
                  className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all text-sm shadow-sm resize-none ${!showNotice ? "opacity-50" : ""}`}
                  placeholder={t.modals.arrivalAirportNotice} dir={language === "ar" ? "rtl" : "ltr"} disabled={!showNotice}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="p-6 space-y-4">
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-base font-bold text-gray-800">{language === "ar" ? "الرحلات الجوية" : "Flight Segments"}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {language === "ar" ? `${flights.length} رحلة` : `${flights.length} flight${flights.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <button type="button" onClick={addFlight}
                  className={`flex items-center gap-2 px-4 py-2.5 bg-[#4A5568] text-white rounded-xl hover:bg-[#2D3748] transition-all text-sm font-medium shadow-sm ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.modals.addFlight}
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(65vh-100px)] overflow-y-auto pr-1 pb-2">
                {flights.map((flight, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Flight Card Header */}
                    <div className={`bg-gradient-to-r from-[#4A5568] to-[#3D4A5C] px-4 py-3 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <p className="text-white text-sm font-semibold">
                            {flight.fromAirport && flight.toAirport
                              ? `${flight.fromAirport} → ${flight.toAirport}`
                              : language === "ar" ? `رحلة ${index + 1}` : `Flight ${index + 1}`}
                          </p>
                          {flight.date && <p className="text-white/50 text-xs">{flight.date}</p>}
                        </div>
                      </div>
                      {flights.length > 1 && (
                        <button type="button" onClick={() => removeFlight(index)}
                          className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-all text-xs font-medium"
                        >
                          {t.modals.removeFlight}
                        </button>
                      )}
                    </div>

                    {/* Flight Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Date + Times */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t.modals.date}</label>
                          <input type="date" value={flight.date} onChange={e => updateFlight(index, "date", e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 focus:border-[#4A5568] text-sm transition-all ${errors[`flight_${index}_date`] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><PlaneLanding className="w-3.5 h-3.5" /> {language === "ar" ? "وقت الوصول" : "Arrival"}</label>
                          <input type="time" value={flight.arrivalTime || ""} onChange={e => updateFlight(index, "arrivalTime", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><PlaneTakeoff className="w-3.5 h-3.5" /> {language === "ar" ? "وقت الإقلاع" : "Departure"}</label>
                          <input type="time" value={flight.departureTime || ""} onChange={e => updateFlight(index, "departureTime", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                          />
                        </div>
                      </div>

                      {/* Airline Company */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {t.modals.airlineCompany}</label>
                        <div className="relative">
                          <select value={flight.airlineCompany || ""} onChange={e => updateFlight(index, "airlineCompany", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm appearance-none pr-10 transition-all"
                          >
                            <option value="">{t.modals.selectAirlineCompany}</option>
                            {airlineCompanies.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                          </select>
                          {user && (
                            <button type="button" onClick={() => setShowAddAirlineModal(true)}
                              className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 p-1.5 bg-[#4A5568] text-white rounded-lg hover:bg-[#2D3748] transition-all`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Airline Link */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.airlineCompanyLink}</label>
                        <input type="url" value={flight.airlineCompanyLink || ""} onChange={e => updateFlight(index, "airlineCompanyLink", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                          placeholder={t.modals.airlineCompanyLink}
                        />
                      </div>

                      {/* From / To */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t.modals.fromAirport}</label>
                          <input type="text" value={flight.fromAirport} onChange={e => updateFlight(index, "fromAirport", e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all ${errors[`flight_${index}_from`] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                            placeholder={t.modals.fromAirport}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> {t.modals.toAirport}</label>
                          <input type="text" value={flight.toAirport} onChange={e => updateFlight(index, "toAirport", e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all ${errors[`flight_${index}_to`] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                            placeholder={t.modals.toAirport}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.fromAirportLink}</label>
                          <input type="url" value={flight.fromAirportLink || ""} onChange={e => updateFlight(index, "fromAirportLink", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                            placeholder={t.modals.fromAirportLink}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.toAirportLink}</label>
                          <input type="url" value={flight.toAirportLink || ""} onChange={e => updateFlight(index, "toAirportLink", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                            placeholder={t.modals.toAirportLink}
                          />
                        </div>
                      </div>

                      {/* Luggage */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {t.modals.luggage}</label>
                        <input type="text" value={flight.luggage} onChange={e => updateFlight(index, "luggage", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                          placeholder="20 كيلو"
                        />
                      </div>

                      {/* Travelers */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {language === "ar" ? "المسافرون" : "Travelers"}</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { field: "adults", label: t.modals.adults, icon: <User className="w-3.5 h-3.5 inline" /> },
                            { field: "children", label: t.modals.children, icon: <Users className="w-3.5 h-3.5 inline" /> },
                            { field: "infants", label: t.modals.infants, icon: <Baby className="w-3.5 h-3.5 inline" /> },
                          ].map(({ field, label, icon }) => (
                            <div key={field} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                              <label className="block text-xs text-gray-500 mb-1.5 text-center">{icon} {label}</label>
                              <input type="number" min="0" value={(flight.travelers as any)[field]}
                                onChange={e => updateFlight(index, "travelers", { ...flight.travelers, [field]: parseInt(e.target.value) || 0 })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center bg-white focus:ring-2 focus:ring-[#4A5568]/20 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Columns */}
                      {columnConfig.filter((c): c is Extract<AirplaneColumnConfigItem, { kind: "custom" }> => c.kind === "custom").map(col => (
                        <div key={col.id}>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{columnLabel(col, language)}</label>
                          <input type="text" value={flight.customColumnValues?.[col.id] ?? ""} onChange={e => updateFlightCustomColumn(index, col.id, e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 text-sm transition-all"
                            dir={language === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                      ))}

                      {/* Note */}
                      <div className="bg-red-50/60 rounded-xl p-3 border border-red-100">
                        <label className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {t.modals.flightNote}</label>
                        <input type="text" value={flight.note ?? ""} onChange={e => updateFlight(index, "note", e.target.value)}
                          className="w-full px-3 py-2 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-300 text-sm bg-white placeholder:text-red-300 transition-all"
                          placeholder={t.modals.flightNotePlaceholder}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.flights && <p className="text-red-500 text-xs mt-1">{errors.flights}</p>}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={`bg-gray-50/80 px-6 py-4 flex items-center justify-between border-t border-gray-100 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            {[
              { action: handleExportJSON, title: t.modals.exportJson, path: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { action: () => fileInputRef.current?.click(), title: t.modals.importJson, path: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
              { action: () => setShowSaveTemplateModal(true), title: t.modals.saveAsTemplate, path: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
            ].map(({ action, title, path }, i) => (
              <button key={i} type="button" onClick={action} title={title}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
                </svg>
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(s => s - 1)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium shadow-sm ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {language === "ar" ? "السابق" : "Back"}
              </button>
            )}
            {currentStep < TOTAL_STEPS ? (
              <button type="button" onClick={() => {
                if (!canAdvanceStep(currentStep)) return;
                setCurrentStep(s => s + 1);
              }}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-xl hover:from-[#2D3748] hover:to-[#1A202C] transition-all text-sm font-semibold shadow-md ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {language === "ar" ? "التالي" : "Next"}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-xl hover:from-[#2D3748] hover:to-[#1A202C] transition-all text-sm font-semibold shadow-md ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {language === "ar" ? "إضافة القسم" : "Add Section"}
              </button>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </div>

      <AddAirlineCompanyModal isOpen={showAddAirlineModal} onClose={() => setShowAddAirlineModal(false)} onSuccess={handleAddAirlineCompany} language={language} />

      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" dir={dir}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSaveTemplateModal(false)} />
          <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 ${isRTL ? "text-right" : "text-left"}`} onClick={e => e.stopPropagation()} style={{ animation: "modalIn 0.2s ease-out" }}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t.modals.saveAsTemplate}</h3>
            <p className="text-sm text-gray-400 mb-4">{language === "ar" ? "أدخل اسماً مميزاً لهذا القالب" : "Enter a name to identify this template"}</p>
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSaveTemplate(); } }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A5568]/30 focus:border-[#4A5568] text-sm mb-4"
              placeholder={t.modals.enterTemplateName} autoFocus
            />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button onClick={() => setShowSaveTemplateModal(false)} disabled={isSavingTemplate}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                {t.common.cancel}
              </button>
              <button onClick={handleSaveTemplate} disabled={isSavingTemplate}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#4A5568] rounded-xl hover:bg-[#2D3748] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSavingTemplate && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {isSavingTemplate ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteTemplateModal}
        onClose={() => { setShowDeleteTemplateModal(false); setTemplateToDelete(null); }}
        onConfirm={() => { if (templateToDelete) handleDeleteTemplate(templateToDelete); }}
        title={t.modals.deleteTemplate} message={t.modals.deleteTemplateMessage} confirmButtonText={t.common.delete}
      />

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
