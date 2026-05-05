"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Hotel as HotelIcon, Building2, Moon, Calendar, BedDouble, Link as LinkIcon, ArrowLeft, ArrowRight, MapPin, Tag } from "lucide-react";
import { useAuth } from "@/app/modules/auth/contexts/AuthContext";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";
import type { Hotel } from '../templates/HotelsSection';
import { getCompanySettings, getIncludesAllOptions, addIncludesAllOptionUser } from "@/app/modules/company-settings/services/CompanySettingsApi";
import {
  getHotelTemplates,
  saveHotelTemplate,
  deleteHotelTemplate,
  Template,
} from "@/app/modules/pdf-document/services/TemplatesApi";
import AddIncludesAllOptionModal from "./AddIncludesAllOptionModal";
import DeleteConfirmationModal from "@/app/modules/shared/components/DeleteConfirmationModal";

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    showTitle?: boolean;
    hotels: Hotel[];
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
    labels?: {
      nights: string;
      includes: string;
      checkIn: string;
      checkOut: string;
      details: string;
      count: string;
    };
  }) => void;
}

const TOTAL_STEPS = 2;

const Toggle = ({ checked, onChange, color = "bg-[#3B5998]" }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? color : "bg-gray-200"}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
  </button>
);

const StepIndicator = ({
  steps,
  current,
  onClickStep,
}: {
  steps: { label: string; sub: string }[];
  current: number;
  onClickStep: (n: number) => void;
}) => (
  <div className="flex items-start justify-center pb-4 gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <button
          type="button"
          onClick={() => i + 1 < current && onClickStep(i + 1)}
          className="flex flex-col items-center"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              current > i + 1
                ? "bg-emerald-400 border-emerald-400 text-white"
                : current === i + 1
                ? "bg-white border-white text-[#3B5998] shadow-lg"
                : "bg-transparent border-white/30 text-white/40"
            }`}
          >
            {current > i + 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <div className="text-center mt-1 px-1">
            <p className={`text-xs font-semibold transition-all ${current === i + 1 ? "text-white" : current > i + 1 ? "text-emerald-300" : "text-white/40"}`}>
              {step.label}
            </p>
            <p className="text-[10px] text-white/50 whitespace-nowrap">{step.sub}</p>
          </div>
        </button>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mt-[18px] transition-all duration-500 ${current > i + 1 ? "bg-emerald-400" : "bg-white/20"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default function AddHotelModal({
  isOpen,
  onClose,
  onSubmit,
}: AddHotelModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [title, setTitle] = useState("حجز الفنادق");
  const [showTitle, setShowTitle] = useState(true);
  const { user } = useAuth();
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [includesAllOptions, setIncludesAllOptions] = useState<string[]>(["Includes All"]);
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([
    {
      city: "",
      nights: 1,
      hotelName: "",
      hasDetailsLink: false,
      roomDescription: {
        includesAll: "Includes All",
        bedType: "سرير اضافي/ عدد: 2",
        roomType: ""
      },
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date().toISOString().split('T')[0],
      dayInfo: {
        checkInDay: "اليوم الاول",
        checkOutDay: "اليوم الثاني"
      }
    }
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedTemplates, setExpandedTemplates] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchIncludesAllOptions = async () => {
    try {
      const result = await getIncludesAllOptions();
      const options = result.includes_all_options || ["Includes All"];
      setIncludesAllOptions(options);
      if (hotels.length > 0 && hotels[0].roomDescription.includesAll === "Includes All") {
        setHotels(prev => prev.map(h => ({
          ...h,
          roomDescription: { ...h.roomDescription, includesAll: options[0] || "Includes All" }
        })));
      }
    } catch (err) {
      setIncludesAllOptions(["Includes All"]);
    }
  };

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const result = await getHotelTemplates();
      setTemplates(result.templates || []);
    } catch (err) {
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIncludesAllOptions();
      fetchTemplates();
    }
  }, [isOpen]);

  const handleAddIncludesAllOption = async (optionText: string) => {
    try {
      const result = await addIncludesAllOptionUser(optionText);
      if (result && result.includes_all_options) {
        setIncludesAllOptions(result.includes_all_options);
        if (hotels.length > 0) {
          updateHotel(0, 'roomDescription', { ...hotels[0].roomDescription, includesAll: optionText });
        }
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("حجز الفنادق");
      setShowTitle(true);
      setDirection("rtl");
      setLanguage("ar");
      setCurrentStep(1);
      setHotels([
        {
          city: "",
          nights: 1,
          hotelName: "",
          hasDetailsLink: false,
          roomDescription: {
            includesAll: includesAllOptions[0] || "Includes All",
            bedType: "سرير اضافي/ عدد: 2",
            roomType: ""
          },
          checkInDate: new Date().toISOString().split('T')[0],
          checkOutDate: new Date().toISOString().split('T')[0],
          dayInfo: { checkInDay: "اليوم الاول", checkOutDay: "اليوم الثاني" }
        }
      ]);
      setErrors({});
      setShowTemplateSelection(false);
      setShowSaveTemplateModal(false);
      setTemplateName("");
    }
  }, [isOpen, includesAllOptions]);

  const loadTemplate = (template: Template) => {
    const data = template.data as any;
    if (data.title !== undefined) setTitle(data.title || "حجز الفنادق");
    if (data.showTitle !== undefined) setShowTitle(data.showTitle);
    if (data.direction) setDirection(data.direction);
    if (data.language) setLanguage(data.language);
    if (data.hotels && data.hotels.length > 0) setHotels(data.hotels);
    setShowTemplateSelection(false);
    setExpandedTemplates(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم القالب' : 'Please enter a template name');
      return;
    }
    if (isSavingTemplate) return;
    try {
      setIsSavingTemplate(true);
      await saveHotelTemplate(templateName.trim(), { title, showTitle, hotels, direction, language, labels: undefined });
      setShowSaveTemplateModal(false);
      setTemplateName("");
      await fetchTemplates();
      toast.success(language === 'ar' ? 'تم حفظ القالب بنجاح' : 'Template saved successfully');
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل حفظ القالب' : 'Failed to save template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      name: title || "Hotel Section",
      template_type: "hotel",
      data: { title, showTitle, hotels, direction, language, labels: undefined },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotel-template-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      if (!importData.data || !importData.data.hotels) {
        toast.error(language === 'ar' ? 'ملف JSON غير صالح' : 'Invalid JSON file');
        return;
      }
      const data = importData.data;
      if (data.title !== undefined) setTitle(data.title || "حجز الفنادق");
      if (data.showTitle !== undefined) setShowTitle(data.showTitle);
      if (data.direction) setDirection(data.direction);
      if (data.language) setLanguage(data.language);
      if (data.hotels && data.hotels.length > 0) setHotels(data.hotels);
      toast.success(language === 'ar' ? 'تم استيراد القالب بنجاح' : 'Template imported successfully');
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل استيراد القالب' : 'Failed to import template');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteHotelTemplate(templateId);
      setShowDeleteTemplateModal(false);
      setTemplateToDelete(null);
      await fetchTemplates();
      toast.success(language === 'ar' ? 'تم حذف القالب بنجاح' : 'Template deleted successfully');
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل حذف القالب' : 'Failed to delete template');
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (hotels.length === 0) newErrors.hotels = "At least one hotel is required";
    hotels.forEach((hotel, index) => {
      if (!hotel.city.trim()) newErrors[`hotel_${index}_city`] = "City is required";
      if (!hotel.hotelName.trim()) newErrors[`hotel_${index}_hotelName`] = "Hotel name is required";
      if (!hotel.checkInDate) newErrors[`hotel_${index}_checkIn`] = "Check-in date is required";
      if (!hotel.checkOutDate) newErrors[`hotel_${index}_checkOut`] = "Check-out date is required";
      if (hotel.nights < 1) newErrors[`hotel_${index}_nights`] = "Nights must be at least 1";
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
    onSubmit({ title: title.trim() || undefined, showTitle, hotels, direction, language });
    onClose();
  };

  const addHotel = () => {
    setHotels([...hotels, {
      city: "",
      nights: 1,
      hotelName: "",
      hasDetailsLink: false,
      roomDescription: { includesAll: "شامل الافطار", bedType: "سرير اضافي/ عدد: 2", roomType: "" },
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date().toISOString().split('T')[0],
      dayInfo: { checkInDay: "اليوم الاول", checkOutDay: "اليوم الثاني" }
    }]);
  };

  const removeHotel = (index: number) => {
    if (hotels.length > 1) setHotels(hotels.filter((_, i) => i !== index));
  };

  const updateHotel = (index: number, field: keyof Hotel | 'roomDescription' | 'dayInfo', value: any) => {
    const newHotels = [...hotels];
    if (field === 'roomDescription') {
      newHotels[index] = { ...newHotels[index], roomDescription: { ...newHotels[index].roomDescription, ...value } };
    } else if (field === 'dayInfo') {
      newHotels[index] = { ...newHotels[index], dayInfo: { ...newHotels[index].dayInfo, ...value } };
    } else {
      newHotels[index] = { ...newHotels[index], [field]: value };
    }
    setHotels(newHotels);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  const stepConfig = [
    {
      label: language === "ar" ? "إعداد القسم" : "Setup",
      sub: language === "ar" ? "العنوان والإعدادات" : "Title & Settings",
    },
    {
      label: language === "ar" ? "الفنادق" : "Hotels",
      sub: `${hotels.length} ${language === "ar" ? "فنادق" : "hotels"}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      dir={dir}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
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
                <h2 className="text-lg font-bold text-white">{t.modals.addHotelSection}</h2>
                <p className="text-xs text-white/60">
                  {language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={t.modals.exportJson}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={t.modals.importJson}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(true)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={t.modals.saveAsTemplate}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <StepIndicator steps={stepConfig} current={currentStep} onClickStep={setCurrentStep} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Step 1 — Section Setup */}
          {currentStep === 1 && (
            <div className="p-6 space-y-5">
              {/* Templates collapsible */}
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedTemplates(!expandedTemplates)}
                  className={`w-full px-4 py-3 bg-blue-50 flex items-center justify-between text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {t.modals.savedTemplates}
                    {templates.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-800">{templates.length}</span>
                    )}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${expandedTemplates ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTemplates && (
                  <div className="p-4 bg-white">
                    {templates.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                            onClick={() => loadTemplate(template)}
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate">{template.name}</p>
                              <p className="text-xs text-gray-500">{(template.data as any)?.hotels?.length || 0} {t.modals.hotelsCount}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setTemplateToDelete(template.id); setShowDeleteTemplateModal(true); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">{t.modals.noSavedTemplates}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Section title card */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <HotelIcon className="w-4 h-4 text-[#3B5998]" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "عنوان القسم" : "Section Title"}</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B5998] focus:border-transparent bg-white text-sm"
                  placeholder={t.modals.hotelBooking}
                />
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm text-gray-600">{t.modals.showTitle}</span>
                  <Toggle checked={showTitle} onChange={() => setShowTitle(!showTitle)} />
                </div>
              </div>

              {/* Language & Direction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ${isRTL ? "text-right" : ""}`}>
                    {t.modals.language}
                  </p>
                  <div className="flex gap-2">
                    {(["ar", "en"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => { setLanguage(lang); setDirection(lang === "ar" ? "rtl" : "ltr"); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                          language === lang
                            ? "bg-[#3B5998] text-white border-[#3B5998] shadow"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#3B5998]"
                        }`}
                      >
                        {lang === "ar" ? "AR" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ${isRTL ? "text-right" : ""}`}>
                    {t.modals.direction}
                  </p>
                  <div className="flex gap-2">
                    {(["rtl", "ltr"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDirection(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                          direction === d
                            ? "bg-[#3B5998] text-white border-[#3B5998] shadow"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#3B5998]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {d === "rtl" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          {d.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Hotels */}
          {currentStep === 2 && (
            <div className="p-6 space-y-4">
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <h3 className="text-sm font-bold text-gray-700">
                  {t.modals.hotels} ({hotels.length})
                </h3>
                <button
                  type="button"
                  onClick={addHotel}
                  className={`px-4 py-2 bg-[#3B5998] text-white rounded-lg hover:bg-[#2E4A7A] transition-colors text-sm font-semibold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.modals.addHotel}
                </button>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {hotels.map((hotel, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Hotel card header */}
                    <div className="bg-gradient-to-r from-[#3B5998] to-[#2E4A7A] px-4 py-3">
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <HotelIcon className="w-4 h-4 text-white" />
                          <div>
                            <p className="text-sm font-bold text-white">
                              {hotel.hotelName || (language === "ar" ? `فندق ${index + 1}` : `Hotel ${index + 1}`)}
                            </p>
                            <p className="text-xs text-white/70">
                              {hotel.city || (language === "ar" ? "المدينة" : "City")} · {hotel.nights} {language === "ar" ? "ليالي" : "nights"}
                            </p>
                          </div>
                        </div>
                        {hotels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHotel(index)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hotel form body */}
                    <div className="p-4 bg-white space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t.modals.city}</label>
                          <input
                            type="text"
                            value={hotel.city}
                            onChange={(e) => updateHotel(index, 'city', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors[`hotel_${index}_city`] ? "border-red-400" : "border-gray-200"}`}
                            placeholder={t.modals.cityPlaceholder}
                          />
                          {errors[`hotel_${index}_city`] && <p className="text-red-500 text-xs mt-1">{errors[`hotel_${index}_city`]}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> {t.modals.nights}</label>
                          <input
                            type="number"
                            min="1"
                            value={hotel.nights}
                            onChange={(e) => updateHotel(index, 'nights', parseInt(e.target.value) || 1)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors[`hotel_${index}_nights`] ? "border-red-400" : "border-gray-200"}`}
                          />
                          {errors[`hotel_${index}_nights`] && <p className="text-red-500 text-xs mt-1">{errors[`hotel_${index}_nights`]}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {t.modals.cityBadge}</label>
                        <input
                          type="text"
                          value={hotel.cityBadge || ""}
                          onChange={(e) => updateHotel(index, 'cityBadge', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                          placeholder={t.modals.cityBadgePlaceholder}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {t.modals.hotelName}</label>
                        <input
                          type="text"
                          value={hotel.hotelName}
                          onChange={(e) => updateHotel(index, 'hotelName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors[`hotel_${index}_hotelName`] ? "border-red-400" : "border-gray-200"}`}
                          placeholder={t.modals.hotelNamePlaceholder}
                        />
                        {errors[`hotel_${index}_hotelName`] && <p className="text-red-500 text-xs mt-1">{errors[`hotel_${index}_hotelName`]}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t.modals.checkInDate}</label>
                          <input
                            type="date"
                            value={hotel.checkInDate}
                            onChange={(e) => updateHotel(index, 'checkInDate', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors[`hotel_${index}_checkIn`] ? "border-red-400" : "border-gray-200"}`}
                          />
                          {errors[`hotel_${index}_checkIn`] && <p className="text-red-500 text-xs mt-1">{errors[`hotel_${index}_checkIn`]}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t.modals.checkOutDate}</label>
                          <input
                            type="date"
                            value={hotel.checkOutDate}
                            onChange={(e) => updateHotel(index, 'checkOutDate', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent ${errors[`hotel_${index}_checkOut`] ? "border-red-400" : "border-gray-200"}`}
                          />
                          {errors[`hotel_${index}_checkOut`] && <p className="text-red-500 text-xs mt-1">{errors[`hotel_${index}_checkOut`]}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.modals.checkInDay}</label>
                          <input
                            type="text"
                            value={hotel.dayInfo.checkInDay}
                            onChange={(e) => updateHotel(index, 'dayInfo', { ...hotel.dayInfo, checkInDay: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                            placeholder={t.modals.checkInDayPlaceholder}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.modals.checkOutDay}</label>
                          <input
                            type="text"
                            value={hotel.dayInfo.checkOutDay}
                            onChange={(e) => updateHotel(index, 'dayInfo', { ...hotel.dayInfo, checkOutDay: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                            placeholder={t.modals.checkOutDayPlaceholder}
                          />
                        </div>
                      </div>

                      {/* Room info */}
                      <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {language === "ar" ? "تفاصيل الغرفة" : "Room Details"}</p>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">{t.modals.includesAll}</label>
                          <div className="relative">
                            <select
                              value={hotel.roomDescription.includesAll}
                              onChange={(e) => updateHotel(index, 'roomDescription', { ...hotel.roomDescription, includesAll: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                            >
                              {includesAllOptions.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </select>
                            {user && (
                              <button
                                type="button"
                                onClick={() => setShowAddOptionModal(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-[#3B5998] text-white rounded hover:bg-[#2E4A7A] transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t.modals.roomType}</label>
                            <input
                              type="text"
                              value={hotel.roomDescription.roomType || ""}
                              onChange={(e) => updateHotel(index, 'roomDescription', { ...hotel.roomDescription, roomType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent bg-white"
                              placeholder={t.modals.roomTypePlaceholder}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t.modals.bedType}</label>
                            <input
                              type="text"
                              value={hotel.roomDescription.bedType}
                              onChange={(e) => updateHotel(index, 'roomDescription', { ...hotel.roomDescription, bedType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent bg-white"
                              placeholder={t.modals.bedTypePlaceholder}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Details link */}
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-sm text-gray-600 inline-flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.hasDetailsLink}</span>
                        <Toggle
                          checked={hotel.hasDetailsLink || false}
                          onChange={() => updateHotel(index, 'hasDetailsLink', !hotel.hasDetailsLink)}
                        />
                      </div>
                      {hotel.hasDetailsLink && (
                        <input
                          type="url"
                          value={hotel.detailsLink || ""}
                          onChange={(e) => updateHotel(index, 'detailsLink', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                          placeholder="https://..."
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.hotels && <p className="text-red-500 text-xs">{errors.hotels}</p>}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className={`bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {t.common.cancel}
          </button>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className={`px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {language === "ar" ? "السابق" : "Back"}
              </button>
            )}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => {
                  if (!canAdvanceStep(currentStep)) return;
                  setCurrentStep((s) => s + 1);
                }}
                className={`px-5 py-2 bg-gradient-to-r from-[#3B5998] to-[#2E4A7A] text-white rounded-lg hover:from-[#2E4A7A] hover:to-[#1E3A5A] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {language === "ar" ? "التالي" : "Next"} {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className={`px-5 py-2 bg-gradient-to-r from-[#3B5998] to-[#2E4A7A] text-white rounded-lg hover:from-[#2E4A7A] hover:to-[#1E3A5A] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.modals.addSection}
              </button>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <AddIncludesAllOptionModal
        isOpen={showAddOptionModal}
        onClose={() => setShowAddOptionModal(false)}
        onSuccess={handleAddIncludesAllOption}
        language={language}
      />

      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSaveTemplateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()} dir={dir}>
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? "text-right" : ""}`}>{t.modals.saveAsTemplate}</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveTemplate(); } }}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5998] focus:border-transparent mb-4 ${isRTL ? "text-right" : ""}`}
              placeholder={t.modals.enterTemplateName}
              autoFocus
            />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button onClick={() => setShowSaveTemplateModal(false)} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                {t.common.cancel}
              </button>
              <button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#3B5998] rounded-lg hover:bg-[#2E4A7A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSavingTemplate && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
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
        title={t.modals.deleteTemplate}
        message={t.modals.deleteTemplateConfirm}
        confirmButtonText={t.common.delete}
      />
    </div>
  );
}
