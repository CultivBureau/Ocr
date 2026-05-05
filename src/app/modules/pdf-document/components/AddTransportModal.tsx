"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Bus, Car, Link as LinkIcon, ArrowLeft, ArrowRight, Palette, Columns3, Rows3 } from "lucide-react";
import type { TransportTable, TransportRow, TransportColumn } from '../types/TransportTypes';
import {
  getTransportTemplates,
  saveTransportTemplate,
  deleteTransportTemplate,
  Template,
} from "@/app/modules/pdf-document/services/TemplatesApi";
import DeleteConfirmationModal from "@/app/modules/shared/components/DeleteConfirmationModal";
import { useLanguage } from "@/app/modules/shared/contexts/LanguageContext";

interface AddTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    showTitle?: boolean;
    tables: TransportTable[];
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
  }) => void;
}

const TOTAL_STEPS = 2;

const Toggle = ({ checked, onChange, color = "bg-[#1E3A8A]" }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? color : "bg-gray-200"}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
  </button>
);

const StepIndicator = ({ steps, current, onClickStep }: { steps: { label: string; sub: string }[]; current: number; onClickStep: (n: number) => void }) => (
  <div className="flex items-start justify-center pb-4 gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <button type="button" onClick={() => i + 1 < current && onClickStep(i + 1)} className="flex flex-col items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${current > i + 1 ? "bg-emerald-400 border-emerald-400 text-white" : current === i + 1 ? "bg-white border-white text-[#1E3A8A] shadow-lg" : "bg-transparent border-white/30 text-white/40"}`}>
            {current > i + 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : i + 1}
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

export default function AddTransportModal({ isOpen, onClose, onSubmit }: AddTransportModalProps) {
  const { t, isRTL, dir } = useLanguage();
  const [title, setTitle] = useState("المواصلات");
  const [showTitle, setShowTitle] = useState(true);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [tables, setTables] = useState<TransportTable[]>([
    {
      id: `table_${Date.now()}`,
      title: "",
      backgroundColor: 'dark-blue',
      columns: [
        { key: 'day', label: language === 'ar' ? 'يوم' : 'Day' },
        { key: 'date', label: language === 'ar' ? 'التاريخ' : 'Date' },
        { key: 'from', label: language === 'ar' ? 'من' : 'From' },
        { key: 'to', label: language === 'ar' ? 'إلى' : 'To' },
        { key: 'carType', label: language === 'ar' ? 'نوع السياره' : 'Car Type' },
        { key: 'description', label: language === 'ar' ? 'الوصف' : 'Description' },
      ],
      rows: [{ day: "", date: new Date().toISOString().split('T')[0], from: "", to: "", fromLink: "", toLink: "", carType: "", description: "" }]
    }
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedTemplates, setExpandedTemplates] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const result = await getTransportTemplates();
      setTemplates(result.templates || []);
    } catch { setTemplates([]); } finally { setIsLoadingTemplates(false); }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("المواصلات");
      setShowTitle(true);
      setDirection("rtl");
      setLanguage("ar");
      setCurrentStep(1);
      setTables([{
        id: `table_${Date.now()}`,
        title: "",
        backgroundColor: 'dark-blue',
        columns: [
          { key: 'day', label: 'يوم' },
          { key: 'date', label: 'التاريخ' },
          { key: 'from', label: 'من' },
          { key: 'to', label: 'إلى' },
          { key: 'carType', label: 'نوع السياره' },
          { key: 'description', label: 'الوصف' },
        ],
        rows: [{ day: "", date: new Date().toISOString().split('T')[0], from: "", to: "", fromLink: "", toLink: "", carType: "", description: "" }]
      }]);
      setErrors({});
      setShowSaveTemplateModal(false);
      setTemplateName("");
      fetchTemplates();
    }
  }, [isOpen]);

  const loadTemplate = (template: Template) => {
    const data = template.data as any;
    if (data.title !== undefined) setTitle(data.title || "المواصلات");
    if (data.showTitle !== undefined) setShowTitle(data.showTitle);
    if (data.direction) setDirection(data.direction);
    if (data.language) setLanguage(data.language);
    if (data.tables && data.tables.length > 0) setTables(data.tables);
    setExpandedTemplates(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { toast.error(language === 'ar' ? 'يرجى إدخال اسم القالب' : 'Please enter a template name'); return; }
    if (isSavingTemplate) return;
    try {
      setIsSavingTemplate(true);
      await saveTransportTemplate(templateName.trim(), { title, showTitle, tables: tables.map(t => ({ ...t, rows: t.rows.map(r => ({ ...r, description: r.description || "" })) })), direction, language });
      setShowSaveTemplateModal(false);
      setTemplateName("");
      await fetchTemplates();
      toast.success(language === 'ar' ? 'تم حفظ القالب بنجاح' : 'Template saved successfully');
    } catch { toast.error(language === 'ar' ? 'فشل حفظ القالب' : 'Failed to save template');
    } finally { setIsSavingTemplate(false); }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ name: title || "Transport Section", template_type: "transport", data: { title, showTitle, tables, direction, language }, exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transport-template-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      if (!importData.data || !importData.data.tables) { toast.error(language === 'ar' ? 'ملف JSON غير صالح' : 'Invalid JSON file'); return; }
      const data = importData.data;
      if (data.title !== undefined) setTitle(data.title || "المواصلات");
      if (data.showTitle !== undefined) setShowTitle(data.showTitle);
      if (data.direction) setDirection(data.direction);
      if (data.language) setLanguage(data.language);
      if (data.tables && data.tables.length > 0) setTables(data.tables);
      toast.success(language === 'ar' ? 'تم استيراد القالب بنجاح' : 'Template imported successfully');
    } catch { toast.error(language === 'ar' ? 'فشل استيراد القالب' : 'Failed to import template');
    } finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTransportTemplate(templateId);
      setShowDeleteTemplateModal(false); setTemplateToDelete(null);
      await fetchTemplates();
      toast.success(language === 'ar' ? 'تم حذف القالب بنجاح' : 'Template deleted successfully');
    } catch { toast.error(language === 'ar' ? 'فشل حذف القالب' : 'Failed to delete template'); }
  };

  useEffect(() => {
    const labels = language === 'ar' ? { day: 'يوم', date: 'التاريخ', from: 'من', to: 'إلى', carType: 'نوع السياره', description: 'الوصف' }
      : { day: 'Day', date: 'Date', from: 'From', to: 'To', carType: 'Car Type', description: 'Description' };
    setTables(prev => prev.map(table => ({ ...table, columns: table.columns.map(col => ({ ...col, label: labels[col.key as keyof typeof labels] || col.label })) })));
  }, [language]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (tables.length === 0) newErrors.tables = "At least one table is required";
    tables.forEach((table, tableIndex) => {
      if (table.rows.length === 0) newErrors[`table_${tableIndex}_rows`] = "At least one row is required";
      table.rows.forEach((row, rowIndex) => {
        table.columns.forEach((column) => {
          if (column.key === 'day' && !row.day?.trim()) newErrors[`table_${tableIndex}_row_${rowIndex}_day`] = "Day is required";
          if (column.key === 'date' && !row.date) newErrors[`table_${tableIndex}_row_${rowIndex}_date`] = "Date is required";
        });
      });
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
    onSubmit({ title: title.trim() || undefined, showTitle, tables, direction, language });
    onClose();
  };

  const addTable = () => {
    setTables([...tables, {
      id: `table_${Date.now()}_${Math.random()}`,
      title: "", backgroundColor: 'dark-blue',
      columns: [
        { key: 'day', label: language === 'ar' ? 'يوم' : 'Day' },
        { key: 'date', label: language === 'ar' ? 'التاريخ' : 'Date' },
        { key: 'from', label: language === 'ar' ? 'من' : 'From' },
        { key: 'to', label: language === 'ar' ? 'إلى' : 'To' },
        { key: 'carType', label: language === 'ar' ? 'نوع السياره' : 'Car Type' },
        { key: 'description', label: language === 'ar' ? 'الوصف' : 'Description' },
      ],
      rows: [{ day: "", date: new Date().toISOString().split('T')[0], from: "", to: "", fromLink: "", toLink: "", carType: "", description: "" }]
    }]);
  };

  const removeTable = (index: number) => { if (tables.length > 1) setTables(tables.filter((_, i) => i !== index)); };

  const updateTable = (index: number, field: keyof TransportTable | 'columns' | 'rows', value: any) => {
    const newTables = [...tables];
    newTables[index] = { ...newTables[index], [field]: value };
    setTables(newTables);
  };

  const addRow = (tableIndex: number) => {
    const newTables = [...tables];
    const newRow: TransportRow = { day: "", date: new Date().toISOString().split('T')[0], from: "", to: "", fromLink: "", toLink: "", carType: "", description: "" };
    newTables[tableIndex].columns.forEach(col => { if (!newRow[col.key]) newRow[col.key] = ""; });
    newTables[tableIndex].rows.push(newRow);
    setTables(newTables);
  };

  const removeRow = (tableIndex: number, rowIndex: number) => {
    const newTables = [...tables];
    if (newTables[tableIndex].rows.length > 1) { newTables[tableIndex].rows = newTables[tableIndex].rows.filter((_, i) => i !== rowIndex); setTables(newTables); }
  };

  const updateRow = (tableIndex: number, rowIndex: number, field: string, value: any) => {
    const newTables = [...tables];
    newTables[tableIndex].rows[rowIndex] = { ...newTables[tableIndex].rows[rowIndex], [field]: value };
    setTables(newTables);
  };

  const addColumn = (tableIndex: number) => {
    const newTables = [...tables];
    const newKey = `column_${Date.now()}`;
    newTables[tableIndex].columns.push({ key: newKey, label: language === 'ar' ? 'عمود جديد' : 'New Column' });
    newTables[tableIndex].rows.forEach(row => { row[newKey] = ""; });
    setTables(newTables);
  };

  const removeColumn = (tableIndex: number, columnIndex: number) => {
    const newTables = [...tables];
    const column = newTables[tableIndex].columns[columnIndex];
    newTables[tableIndex].columns = newTables[tableIndex].columns.filter((_, i) => i !== columnIndex);
    newTables[tableIndex].rows.forEach(row => { delete row[column.key]; });
    setTables(newTables);
  };

  const updateColumn = (tableIndex: number, columnIndex: number, field: 'key' | 'label', value: string) => {
    const newTables = [...tables];
    newTables[tableIndex].columns[columnIndex] = { ...newTables[tableIndex].columns[columnIndex], [field]: value };
    setTables(newTables);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape") onClose(); };

  if (!isOpen) return null;

  const bgColorLabels: Record<string, string> = { 'dark-blue': language === 'ar' ? 'أزرق غامق' : 'Dark Blue', 'dark-red': language === 'ar' ? 'أحمر غامق' : 'Dark Red', 'pink': language === 'ar' ? 'وردي' : 'Pink' };

  const stepConfig = [
    { label: language === "ar" ? "إعداد القسم" : "Setup", sub: language === "ar" ? "العنوان والإعدادات" : "Title & Settings" },
    { label: language === "ar" ? "الجداول" : "Tables", sub: `${tables.length} ${language === "ar" ? "جداول" : "tables"}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} dir={dir}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col ${isRTL ? "text-right" : "text-left"}`}
        style={{ animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#1D4ED8] px-6 pt-5 pb-0">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t.modals.addTransportSection}</h2>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
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
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="p-6 space-y-5">
              {/* Templates */}
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setExpandedTemplates(!expandedTemplates)} className={`w-full px-4 py-3 bg-blue-50 flex items-center justify-between text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    {t.modals.savedTemplates}
                    {templates.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-800">{templates.length}</span>}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${expandedTemplates ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedTemplates && (
                  <div className="p-4 bg-white">
                    {templates.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {templates.map((template) => (
                          <div key={template.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between" onClick={() => loadTemplate(template)}>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate">{template.name}</p>
                              <p className="text-xs text-gray-500">{(template.data as any)?.tables?.length || 0} {t.modals.tablesCount}</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setTemplateToDelete(template.id); setShowDeleteTemplateModal(true); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

              {/* Title card */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Bus className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-sm font-bold text-gray-700">{language === "ar" ? "عنوان القسم" : "Section Title"}</span>
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent bg-white text-sm" placeholder={t.modals.transportation} />
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
                      <button key={lang} type="button" onClick={() => { setLanguage(lang); setDirection(lang === "ar" ? "rtl" : "ltr"); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${language === lang ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E3A8A]"}`}>
                        {lang === "ar" ? "AR" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ${isRTL ? "text-right" : ""}`}>{t.modals.direction}</p>
                  <div className="flex gap-2">
                    {(["rtl", "ltr"] as const).map((d) => (
                      <button key={d} type="button" onClick={() => setDirection(d)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${direction === d ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E3A8A]"}`}>
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

          {/* Step 2 — Tables */}
          {currentStep === 2 && (
            <div className="p-6 space-y-4">
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <h3 className="text-sm font-bold text-gray-700">{t.modals.tables} ({tables.length})</h3>
                <button type="button" onClick={addTable} className={`px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors text-sm font-semibold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t.modals.addTable}
                </button>
              </div>

              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                {tables.map((table, tableIndex) => (
                  <div key={table.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Table header */}
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-4 py-3">
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Car className="w-4 h-4 text-white" />
                          <div>
                            <p className="text-sm font-bold text-white">{table.title || (language === "ar" ? `جدول ${tableIndex + 1}` : `Table ${tableIndex + 1}`)}</p>
                            <p className="text-xs text-white/70">{table.rows.length} {language === "ar" ? "صفوف" : "rows"} · {table.columns.length} {language === "ar" ? "أعمدة" : "cols"}</p>
                          </div>
                        </div>
                        {tables.length > 1 && (
                          <button type="button" onClick={() => removeTable(tableIndex)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-white space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Rows3 className="w-3.5 h-3.5" /> {t.modals.tableTitle}</label>
                          <input type="text" value={table.title} onChange={(e) => updateTable(tableIndex, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent" placeholder={t.modals.tableTitlePlaceholder} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> {t.modals.backgroundColor}</label>
                          <div className="flex gap-1.5">
                            {(['dark-blue', 'dark-red', 'pink'] as const).map((color) => (
                              <button key={color} type="button" onClick={() => updateTable(tableIndex, 'backgroundColor', color)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${table.backgroundColor === color ? "ring-2 ring-offset-1 ring-blue-400 border-blue-300 opacity-100" : "border-gray-200 opacity-70 hover:opacity-100"}`} style={{ background: color === 'dark-blue' ? '#1E3A8A' : color === 'dark-red' ? '#7F1D1D' : '#F9A8D4', color: color === 'pink' ? '#333' : '#fff' }}>
                                {bgColorLabels[color]?.split(' ').slice(1).join(' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Columns */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><Columns3 className="w-3.5 h-3.5" /> {t.modals.columns} ({table.columns.length})</p>
                          <button type="button" onClick={() => addColumn(tableIndex)} className="px-2 py-1 bg-[#1E3A8A] text-white rounded text-xs hover:bg-[#1E40AF]">{t.modals.addColumn}</button>
                        </div>
                        <div className="space-y-1.5">
                          {table.columns.map((column, colIndex) => (
                            <div key={colIndex} className={`flex gap-2 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                              <input type="text" value={column.key} onChange={(e) => updateColumn(tableIndex, colIndex, 'key', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white" placeholder={t.modals.columnKey} />
                              <input type="text" value={column.label} onChange={(e) => updateColumn(tableIndex, colIndex, 'label', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white" placeholder={t.modals.columnLabel} />
                              <button type="button" onClick={() => removeColumn(tableIndex, colIndex)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rows */}
                      <div>
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Rows3 className="w-3.5 h-3.5" /> {t.modals.rows} ({table.rows.length})</p>
                          <button type="button" onClick={() => addRow(tableIndex)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">{t.modals.addRow}</button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {table.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <span className="text-xs font-semibold text-gray-500">{t.modals.row} {rowIndex + 1}</span>
                                {table.rows.length > 1 && (
                                  <button type="button" onClick={() => removeRow(tableIndex, rowIndex)} className="text-red-500 hover:text-red-700 text-xs font-medium">{t.modals.remove}</button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {table.columns.map((column) => (
                                  <div key={column.key}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">{column.label}</label>
                                    {column.key === 'date' ? (
                                      <input type="date" value={row[column.key] || ''} onChange={(e) => updateRow(tableIndex, rowIndex, column.key, e.target.value)} className={`w-full px-2 py-1.5 border rounded text-xs ${errors[`table_${tableIndex}_row_${rowIndex}_${column.key}`] ? "border-red-400" : "border-gray-200"}`} />
                                    ) : (
                                      <input type="text" value={row[column.key] || ''} onChange={(e) => updateRow(tableIndex, rowIndex, column.key, e.target.value)} className={`w-full px-2 py-1.5 border rounded text-xs ${errors[`table_${tableIndex}_row_${rowIndex}_${column.key}`] ? "border-red-400" : "border-gray-200"}`} placeholder={column.label} />
                                    )}
                                  </div>
                                ))}
                                <div>
                                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.fromLink}</label>
                                  <input type="url" value={row.fromLink || ''} onChange={(e) => updateRow(tableIndex, rowIndex, 'fromLink', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" placeholder={t.modals.locationLink} />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> {t.modals.toLink}</label>
                                  <input type="url" value={row.toLink || ''} onChange={(e) => updateRow(tableIndex, rowIndex, 'toLink', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" placeholder={t.modals.locationLink} />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> {t.modals.note}</label>
                                  <input type="text" value={row.note || ''} onChange={(e) => updateRow(tableIndex, rowIndex, 'note', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" placeholder={t.modals.addNote} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.tables && <p className="text-red-500 text-xs">{errors.tables}</p>}
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
              }} className={`px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg hover:from-[#1E40AF] hover:to-[#1D4ED8] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {language === "ar" ? "التالي" : "Next"} {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit} className={`px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg hover:from-[#1E40AF] hover:to-[#1D4ED8] transition-all shadow font-semibold text-sm flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t.modals.addSection}
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
            <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveTemplate(); } }} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent mb-4 ${isRTL ? "text-right" : ""}`} placeholder={t.modals.enterTemplateName} autoFocus />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button onClick={() => setShowSaveTemplateModal(false)} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">{t.common.cancel}</button>
              <button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
