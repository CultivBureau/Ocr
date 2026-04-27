"use client";

import React, { useState, useEffect } from "react";
import { Building2, Hotel as HotelIcon, MapPin, Moon, Tag, Link as LinkIcon, Calendar, BedDouble, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import type { Hotel } from '../templates/HotelsSection';
import { getCompanySettings, getIncludesAllOptions, addIncludesAllOptionUser } from "@/app/modules/company-settings/services/CompanySettingsApi";
import AddIncludesAllOptionModal from "./AddIncludesAllOptionModal";

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hotel: Hotel) => void;
  initialHotel: Hotel | null;
}

const TOTAL_STEPS = 3;

const Toggle = ({ checked, onChange, color = "bg-[#3B5998]" }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? color : "bg-gray-200"}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
  </button>
);

const StepIndicator = ({ steps, current, onClickStep }: { steps: { label: string; sub: string }[]; current: number; onClickStep: (n: number) => void }) => (
  <div className="flex items-start justify-center pb-4 gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <button type="button" onClick={() => i + 1 < current && onClickStep(i + 1)} className="flex flex-col items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${current > i + 1 ? "bg-emerald-400 border-emerald-400 text-white" : current === i + 1 ? "bg-white border-white text-[#3B5998] shadow-lg" : "bg-transparent border-white/30 text-white/40"}`}>
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

export default function EditHotelModal({ isOpen, onClose, onSubmit, initialHotel }: EditHotelModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [city, setCity] = useState("");
  const [nights, setNights] = useState(1);
  const [cityBadge, setCityBadge] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [hasDetailsLink, setHasDetailsLink] = useState(false);
  const [detailsLink, setDetailsLink] = useState("");
  const [includesAll, setIncludesAll] = useState("");
  const [roomType, setRoomType] = useState("");
  const [bedType, setBedType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkInDay, setCheckInDay] = useState("");
  const [checkOutDay, setCheckOutDay] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const [includesAllOptions, setIncludesAllOptions] = useState<string[]>(["Includes All"]);
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [currentStep, setCurrentStep] = useState(1);

  const fetchIncludesAllOptions = async () => {
    try {
      const result = await getIncludesAllOptions();
      setIncludesAllOptions(result.includes_all_options || ["Includes All"]);
    } catch { setIncludesAllOptions(["Includes All"]); }
  };

  useEffect(() => { if (isOpen) fetchIncludesAllOptions(); }, [isOpen]);

  const handleAddIncludesAllOption = async (optionText: string) => {
    try {
      const result = await addIncludesAllOptionUser(optionText);
      if (result && result.includes_all_options) { setIncludesAllOptions(result.includes_all_options); setIncludesAll(optionText); }
    } catch (err) { throw err; }
  };

  useEffect(() => {
    if (isOpen && initialHotel) {
      setCity(initialHotel.city);
      setNights(initialHotel.nights);
      setCityBadge(initialHotel.cityBadge || "");
      setHotelName(initialHotel.hotelName);
      setHasDetailsLink(initialHotel.hasDetailsLink || false);
      setDetailsLink(initialHotel.detailsLink || "");
      setIncludesAll(initialHotel.roomDescription.includesAll);
      setRoomType(initialHotel.roomDescription.roomType || "");
      setBedType(initialHotel.roomDescription.bedType);
      setCheckInDate(initialHotel.checkInDate);
      setCheckOutDate(initialHotel.checkOutDate);
      setCheckInDay(initialHotel.dayInfo.checkInDay);
      setCheckOutDay(initialHotel.dayInfo.checkOutDay);
      setErrors({});
      setCurrentStep(1);
    }
  }, [isOpen, initialHotel]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!city.trim()) newErrors.city = "City is required";
    if (!hotelName.trim()) newErrors.hotelName = "Hotel name is required";
    if (!checkInDate) newErrors.checkInDate = "Check-in date is required";
    if (!checkOutDate) newErrors.checkOutDate = "Check-out date is required";
    if (nights < 1) newErrors.nights = "Nights must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAdvanceStep = (step: number): boolean => {
    if (step === 1) {
      const nextErrors: { [key: string]: string } = {};
      if (!city.trim()) nextErrors.city = "City is required";
      if (!hotelName.trim()) nextErrors.hotelName = "Hotel name is required";
      if (nights < 1) nextErrors.nights = "Nights must be at least 1";
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }
    if (step === 2) {
      const nextErrors: { [key: string]: string } = {};
      if (!checkInDate) nextErrors.checkInDate = "Check-in date is required";
      if (!checkOutDate) nextErrors.checkOutDate = "Check-out date is required";
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      city: city.trim(), nights, cityBadge: cityBadge.trim() || undefined,
      hotelName: hotelName.trim(), hasDetailsLink,
      detailsLink: hasDetailsLink ? (detailsLink.trim() || undefined) : undefined,
      roomDescription: { includesAll: includesAll.trim(), bedType: bedType.trim(), roomType: roomType.trim() || undefined },
      checkInDate, checkOutDate,
      dayInfo: { checkInDay: checkInDay.trim(), checkOutDay: checkOutDay.trim() },
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape") onClose(); };

  if (!isOpen) return null;

  const stepConfig = [
    { label: language === "ar" ? "الأساسيات" : "Basics", sub: language === "ar" ? "المدينة والفندق" : "City & Hotel" },
    { label: language === "ar" ? "التواريخ" : "Dates", sub: language === "ar" ? "الوصول والمغادرة" : "Check-in/out" },
    { label: language === "ar" ? "الغرفة" : "Room", sub: language === "ar" ? "النوع والتفاصيل" : "Type & Details" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} dir={dir}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
        style={{ animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#3B5998] via-[#2E4A7A] to-[#1E3A5A] px-6 pt-5 pb-0">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t.modals.editHotel}</h2>
                <p className="text-xs text-white/60">{language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <StepIndicator steps={stepConfig} current={currentStep} onClickStep={setCurrentStep} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Step 1 — Basics */}
          {currentStep === 1 && (
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "معلومات الموقع" : "Location Info"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.city}</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors.city ? "border-red-400" : "border-gray-200"} ${isRTL ? "text-right" : ""}`} placeholder={t.modals.cityPlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><Moon className="w-3.5 h-3.5" /> {t.modals.nights}</label>
                    <input type="number" min="1" value={nights} onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors.nights ? "border-red-400" : "border-gray-200"} ${isRTL ? "text-right" : ""}`} />
                    {errors.nights && <p className="text-red-500 text-xs mt-1">{errors.nights}</p>}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ${isRTL ? "text-right flex-row-reverse" : ""}`}><Tag className="w-3.5 h-3.5" /> {t.modals.cityBadge}</label>
                  <input type="text" value={cityBadge} onChange={(e) => setCityBadge(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.cityBadgePlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <HotelIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "الفندق" : "Hotel"}</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.hotelName}</label>
                  <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors.hotelName ? "border-red-400" : "border-gray-200"} ${isRTL ? "text-right" : ""}`} placeholder={t.modals.hotelNamePlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  {errors.hotelName && <p className="text-red-500 text-xs mt-1">{errors.hotelName}</p>}
                </div>
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm text-gray-600 inline-flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.hasDetailsLink}</span>
                  <Toggle checked={hasDetailsLink} onChange={() => setHasDetailsLink(!hasDetailsLink)} />
                </div>
                {hasDetailsLink && (
                  <input type="url" value={detailsLink} onChange={(e) => setDetailsLink(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder="https://..." />
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Dates */}
          {currentStep === 2 && (
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-bold text-blue-800">{language === "ar" ? "التواريخ" : "Dates"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.checkInDate}</label>
                    <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors.checkInDate ? "border-red-400" : "border-gray-200"}`} />
                    {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.checkOutDate}</label>
                    <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors.checkOutDate ? "border-red-400" : "border-gray-200"}`} />
                    {errors.checkOutDate && <p className="text-red-500 text-xs mt-1">{errors.checkOutDate}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "أسماء الأيام" : "Day Names"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.checkInDay}</label>
                    <input type="text" value={checkInDay} onChange={(e) => setCheckInDay(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.checkInDayPlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.checkOutDay}</label>
                    <input type="text" value={checkOutDay} onChange={(e) => setCheckOutDay(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.checkOutDayPlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Room Details */}
          {currentStep === 3 && (
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <BedDouble className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-bold text-blue-800">{language === "ar" ? "تفاصيل الغرفة" : "Room Details"}</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.includesAll}</label>
                  <div className="relative">
                    <select value={includesAll} onChange={(e) => setIncludesAll(e.target.value)} className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-[#3B5998] focus:border-transparent">
                      {includesAllOptions.map((option, idx) => <option key={idx} value={option}>{option}</option>)}
                    </select>
                    {user && (
                      <button type="button" onClick={() => setShowAddOptionModal(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#3B5998] text-white rounded-lg hover:bg-[#2E4A7A] transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.roomType}</label>
                    <input type="text" value={roomType} onChange={(e) => setRoomType(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.roomTypePlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 ${isRTL ? "text-right" : ""}`}>{t.modals.bedType}</label>
                    <input type="text" value={bedType} onChange={(e) => setBedType(e.target.value)} className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${isRTL ? "text-right" : ""}`} placeholder={t.modals.bedTypePlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  </div>
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
              <button type="button" onClick={() => {
                if (!canAdvanceStep(currentStep)) return;
                setCurrentStep((s) => s + 1);
              }} className={`px-5 py-2 bg-gradient-to-r from-[#3B5998] to-[#2E4A7A] text-white rounded-lg hover:from-[#2E4A7A] hover:to-[#1E3A5A] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {language === "ar" ? "التالي" : "Next"} {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit} className={`px-5 py-2 bg-gradient-to-r from-[#3B5998] to-[#2E4A7A] text-white rounded-lg hover:from-[#2E4A7A] hover:to-[#1E3A5A] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t.modals.saveChanges}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

      <AddIncludesAllOptionModal isOpen={showAddOptionModal} onClose={() => setShowAddOptionModal(false)} onSuccess={handleAddIncludesAllOption} language={language} />
    </div>
  );
}
