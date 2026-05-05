"use client";

import React, { useState, useEffect } from "react";
import { Calendar, PlaneTakeoff, PlaneLanding, Building2, Link as LinkIcon, Users, Briefcase, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import { FlightData } from './AddAirplaneModal';
import { getCompanySettings, getAirlineCompanies, addAirlineCompanyUser } from "@/app/modules/company-settings/services/CompanySettingsApi";
import AddAirlineCompanyModal from "./AddAirlineCompanyModal";
import { columnLabel } from "@/app/modules/pdf-document/types/airplaneColumnConfig";
import type { AirplaneColumnConfigItem } from "@/app/modules/pdf-document/types/airplaneColumnConfig";

interface EditFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (flight: FlightData) => void;
  initialFlight: FlightData | null;
  customColumns?: Extract<AirplaneColumnConfigItem, { kind: "custom" }>[];
}

const TOTAL_STEPS = 3;

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

export default function EditFlightModal({
  isOpen, onClose, onSubmit, initialFlight, customColumns = [],
}: EditFlightModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [date, setDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [airlineCompany, setAirlineCompany] = useState("");
  const [airlineCompanyLink, setAirlineCompanyLink] = useState("");
  const [fromAirport, setFromAirport] = useState("");
  const [fromAirportLink, setFromAirportLink] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [toAirportLink, setToAirportLink] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [luggage, setLuggage] = useState("20 كيلو");
  const [note, setNote] = useState("");
  const [customVals, setCustomVals] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { user, isCompanyAdmin } = useAuth();
  const [airlineCompanies, setAirlineCompanies] = useState<string[]>([]);
  const [showAddAirlineModal, setShowAddAirlineModal] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [currentStep, setCurrentStep] = useState(1);

  const fetchAirlineCompanies = async () => {
    try {
      const result = await getAirlineCompanies();
      setAirlineCompanies(result.airline_companies || []);
    } catch { setAirlineCompanies([]); }
  };

  useEffect(() => {
    if (isOpen) fetchAirlineCompanies();
  }, [isOpen]);

  const handleAddAirlineCompany = async (companyName: string) => {
    try {
      const result = await addAirlineCompanyUser(companyName);
      if (result && result.airline_companies) {
        setAirlineCompanies(result.airline_companies);
        setAirlineCompany(companyName);
      }
    } catch (err) { throw err; }
  };

  useEffect(() => {
    if (isOpen && initialFlight) {
      setDate(initialFlight.date);
      setArrivalTime(initialFlight.arrivalTime || "");
      setDepartureTime(initialFlight.departureTime || "");
      setAirlineCompany(initialFlight.airlineCompany || "");
      setAirlineCompanyLink(initialFlight.airlineCompanyLink || "");
      setFromAirport(initialFlight.fromAirport);
      setFromAirportLink(initialFlight.fromAirportLink || "");
      setToAirport(initialFlight.toAirport);
      setToAirportLink(initialFlight.toAirportLink || "");
      setAdults(initialFlight.travelers.adults);
      setChildren(initialFlight.travelers.children);
      setInfants(initialFlight.travelers.infants);
      setLuggage(initialFlight.luggage);
      setNote(initialFlight.note ?? "");
      const cv: Record<string, string> = {};
      for (const c of customColumns) cv[c.id] = initialFlight.customColumnValues?.[c.id] ?? "";
      setCustomVals(cv);
      setErrors({});
      setCurrentStep(1);
    }
  }, [isOpen, initialFlight, customColumns]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!fromAirport.trim()) newErrors.fromAirport = "From airport is required";
    if (!toAirport.trim()) newErrors.toAirport = "To airport is required";
    if (!date) newErrors.date = "Date is required";
    if (adults < 0 || children < 0 || infants < 0) newErrors.travelers = "Traveler counts cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAdvanceStep = (step: number): boolean => {
    if (step === 1) {
      const nextErrors: { [key: string]: string } = {};
      if (!date) nextErrors.date = "Date is required";
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }
    if (step === 2) {
      const nextErrors: { [key: string]: string } = {};
      if (!fromAirport.trim()) nextErrors.fromAirport = "From airport is required";
      if (!toAirport.trim()) nextErrors.toAirport = "To airport is required";
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const customColumnValues: Record<string, string> = {};
    for (const c of customColumns) customColumnValues[c.id] = customVals[c.id]?.trim() ?? "";
    onSubmit({
      date, arrivalTime: arrivalTime.trim() || undefined, departureTime: departureTime.trim() || undefined,
      airlineCompany: airlineCompany.trim() || undefined, airlineCompanyLink: airlineCompanyLink.trim() || undefined,
      fromAirport: fromAirport.trim(), fromAirportLink: fromAirportLink.trim() || undefined,
      toAirport: toAirport.trim(), toAirportLink: toAirportLink.trim() || undefined,
      travelers: { adults, children, infants }, luggage: luggage.trim(),
      note: note.trim() || undefined,
      customColumnValues: customColumns.length > 0 ? customColumnValues : undefined,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape") onClose(); };

  if (!isOpen) return null;

  const stepConfig = [
    { label: language === "ar" ? "معلومات الرحلة" : "Flight Info", sub: language === "ar" ? "التاريخ والشركة" : "Date & Airline" },
    { label: language === "ar" ? "المسار" : "Route", sub: language === "ar" ? "المطارات والروابط" : "Airports & Links" },
    { label: language === "ar" ? "المسافرون" : "Travelers", sub: language === "ar" ? "الأمتعة والملاحظة" : "Luggage & Note" },
  ];

  const CounterInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className={`flex items-center justify-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors">−</button>
        <span className="text-xl font-bold text-gray-800 w-8 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-[#4A5568] hover:bg-[#2D3748] text-white font-bold text-lg flex items-center justify-center transition-colors">+</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} dir={dir}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
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
                <h2 className="text-lg font-bold text-white">{t.modals.editFlight}</h2>
                <p className="text-xs text-white/60">{language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <StepIndicator steps={stepConfig} current={currentStep} onClickStep={setCurrentStep} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Step 1 — Flight Info */}
          {currentStep === 1 && (
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "التاريخ والأوقات" : "Date & Times"}</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.date}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${errors.date ? "border-red-400" : "border-gray-200"}`} />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><PlaneTakeoff className="w-3.5 h-3.5" /> {language === "ar" ? "وقت الاقلاع" : "Departure"}</label>
                    <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent" />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><PlaneLanding className="w-3.5 h-3.5" /> {language === "ar" ? "وقت الوصول" : "Arrival"}</label>
                    <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{t.modals.airlineCompany}</span>
                </div>
                <div className="relative">
                  <select value={airlineCompany} onChange={(e) => setAirlineCompany(e.target.value)} className={`w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent appearance-none bg-white ${isRTL ? "text-right" : ""}`}>
                    <option value="">{t.modals.selectAirlineCompany}</option>
                    {airlineCompanies.map((company, idx) => <option key={idx} value={company}>{company}</option>)}
                  </select>
                  {user && (
                    <button type="button" onClick={() => setShowAddAirlineModal(true)} className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 p-1.5 bg-[#4A5568] text-white rounded-lg hover:bg-[#2D3748] transition-colors`} title={t.modals.addNewAirlineCompany}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  )}
                </div>
                <div>
                  <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><LinkIcon className="w-3.5 h-3.5" /> {t.modals.airlineCompanyLink}</label>
                  <input type="url" value={airlineCompanyLink} onChange={(e) => setAirlineCompanyLink(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.airlineCompanyLinkPlaceholder} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Route */}
          {currentStep === 2 && (
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <PlaneTakeoff className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-bold text-blue-800">{t.modals.fromAirport}</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{language === "ar" ? "اسم المطار" : "Airport Name"}</label>
                  <input type="text" value={fromAirport} onChange={(e) => setFromAirport(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${errors.fromAirport ? "border-red-400" : "border-gray-200"} ${isRTL ? "text-right" : ""}`} placeholder={isRTL ? "مطار..." : "Airport..."} dir={language === "ar" ? "rtl" : "ltr"} />
                  {errors.fromAirport && <p className="text-red-500 text-xs mt-1">{errors.fromAirport}</p>}
                </div>
                <div>
                  <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><LinkIcon className="w-3.5 h-3.5" /> {t.modals.fromAirportLink}</label>
                  <input type="url" value={fromAirportLink} onChange={(e) => setFromAirportLink(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.airportLocationLink} />
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <PlaneLanding className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-bold text-emerald-800">{t.modals.toAirport}</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{language === "ar" ? "اسم المطار" : "Airport Name"}</label>
                  <input type="text" value={toAirport} onChange={(e) => setToAirport(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${errors.toAirport ? "border-red-400" : "border-gray-200"} ${isRTL ? "text-right" : ""}`} placeholder={isRTL ? "مطار..." : "Airport..."} dir={language === "ar" ? "rtl" : "ltr"} />
                  {errors.toAirport && <p className="text-red-500 text-xs mt-1">{errors.toAirport}</p>}
                </div>
                <div>
                  <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><LinkIcon className="w-3.5 h-3.5" /> {t.modals.toAirportLink}</label>
                  <input type="url" value={toAirportLink} onChange={(e) => setToAirportLink(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.airportLocationLink} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Travelers, Luggage, Note */}
          {currentStep === 3 && (
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{t.modals.travelers}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <CounterInput label={t.modals.adults} value={adults} onChange={setAdults} />
                  <CounterInput label={t.modals.children} value={children} onChange={setChildren} />
                  <CounterInput label={t.modals.infants} value={infants} onChange={setInfants} />
                </div>
                {errors.travelers && <p className="text-red-500 text-xs mt-2">{errors.travelers}</p>}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className={`text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><Briefcase className="w-4 h-4" /> {t.modals.luggage}</label>
                <input type="text" value={luggage} onChange={(e) => setLuggage(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={isRTL ? "20 كيلو" : "20 kg"} dir={language === "ar" ? "rtl" : "ltr"} />
              </div>

              {customColumns.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-3">
                  <p className={`text-sm font-bold text-amber-800 ${isRTL ? "text-right" : ""}`}>{language === "ar" ? "أعمدة مخصصة" : "Custom Columns"}</p>
                  {customColumns.map((col) => (
                    <div key={col.id}>
                      <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{columnLabel(col, language)}</label>
                      <input type="text" value={customVals[col.id] ?? ""} onChange={(e) => setCustomVals((prev) => ({ ...prev, [col.id]: e.target.value }))} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A5568] focus:border-transparent ${isRTL ? "text-right" : ""}`} dir={language === "ar" ? "rtl" : "ltr"} />
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <label className={`text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><FileText className="w-4 h-4" /> {t.modals.flightNote}</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={`w-full px-4 py-2.5 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-300 placeholder:text-red-300 ${isRTL ? "text-right" : ""}`} placeholder={t.modals.flightNotePlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
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
              <button type="button" onClick={() => {
                if (!canAdvanceStep(currentStep)) return;
                setCurrentStep((s) => s + 1);
              }} className={`px-5 py-2 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-lg hover:from-[#2D3748] hover:to-[#1A202C] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {language === "ar" ? "التالي" : "Next"} {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit} className={`px-5 py-2 bg-gradient-to-r from-[#4A5568] to-[#2D3748] text-white rounded-lg hover:from-[#2D3748] hover:to-[#1A202C] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t.modals.saveChanges}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

      <AddAirlineCompanyModal isOpen={showAddAirlineModal} onClose={() => setShowAddAirlineModal(false)} onSuccess={handleAddAirlineCompany} language={language} />
    </div>
  );
}
