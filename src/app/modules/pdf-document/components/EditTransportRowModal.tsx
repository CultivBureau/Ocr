"use client";

import React, { useState, useEffect } from "react";
import type { TransportRow, TransportColumn } from '../types/TransportTypes';
import { Link as LinkIcon, Car, ArrowLeft, ArrowRight } from "lucide-react";

interface EditTransportRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (row: TransportRow) => void;
  initialRow: TransportRow | null;
  columns: TransportColumn[];
  language?: "ar" | "en";
}

export default function EditTransportRowModal({
  isOpen,
  onClose,
  onSubmit,
  initialRow,
  columns,
  language = "ar",
}: EditTransportRowModalProps) {
  const TOTAL_STEPS = 2;
  const [rowData, setRowData] = useState<TransportRow>({
    day: "",
    date: "",
    from: "",
    to: "",
    fromLink: "",
    toLink: "",
    carType: "",
    description: "",
  });
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);

  const stepConfig = [
    { label: language === "ar" ? "البيانات الأساسية" : "Core Data", sub: language === "ar" ? "اليوم والتاريخ" : "Day & Date" },
    { label: language === "ar" ? "تفاصيل إضافية" : "Details", sub: language === "ar" ? "الروابط والملاحظة" : "Links & Note" },
  ];

  // Populate form when modal opens or initialRow changes
  useEffect(() => {
    if (isOpen && initialRow) {
      const newRowData: TransportRow = { ...initialRow };
      setNote(initialRow.note || "");
      // Ensure all column values are set
      columns.forEach(col => {
        if (!newRowData[col.key]) {
          newRowData[col.key] = "";
        }
      });
      setRowData(newRowData);
      setErrors({});
      setCurrentStep(1);
    }
  }, [isOpen, initialRow, columns]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    columns.forEach((column) => {
      if (column.key === 'day' && !rowData.day?.trim()) {
        newErrors.day = language === 'ar' ? 'اليوم مطلوب' : 'Day is required';
      }
      if (column.key === 'date' && !rowData.date) {
        newErrors.date = language === 'ar' ? 'التاريخ مطلوب' : 'Date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const finalRow: TransportRow = {
      ...rowData,
      note: note.trim() || undefined,
    };

    onSubmit(finalRow);
    onClose();
  };

  const validateStep = (step: number): boolean => {
    if (step !== 1) return true;
    return validate();
  };

  const updateField = (key: string, value: any) => {
    setRowData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-lg"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {language === 'ar' ? 'تعديل الصف' : 'Edit Row'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-3 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] border-t border-white/20">
          <div className="flex items-center justify-center text-xs text-white/70 mb-3">
            {language === "ar" ? `الخطوة ${currentStep} من ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}
          </div>
          <div className="flex items-start justify-center gap-0">
            {stepConfig.map((step, i) => (
              <React.Fragment key={i}>
                <button
                  type="button"
                  onClick={() => i + 1 < currentStep && setCurrentStep(i + 1)}
                  className="flex flex-col items-center"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${currentStep > i + 1 ? "bg-emerald-400 border-emerald-400 text-white" : currentStep === i + 1 ? "bg-white border-white text-[#1E3A8A] shadow-lg" : "bg-transparent border-white/30 text-white/40"}`}>
                    {currentStep > i + 1 ? "✓" : i + 1}
                  </div>
                  <div className="text-center mt-1 px-1">
                    <p className={`text-xs font-semibold transition-all ${currentStep >= i + 1 ? "text-white" : "text-white/40"}`}>{step.label}</p>
                    <p className="text-[10px] text-white/50 whitespace-nowrap">{step.sub}</p>
                  </div>
                </button>
                {i < stepConfig.length - 1 && <div className={`flex-1 h-0.5 mt-[18px] transition-all duration-500 ${currentStep > i + 1 ? "bg-emerald-400" : "bg-white/20"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map((column) => (
                <div key={column.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {column.label}
                  </label>
                  {column.key === 'date' ? (
                    <input
                      type="date"
                      value={rowData[column.key] || ''}
                      onChange={(e) => updateField(column.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent ${errors[column.key] ? "border-red-500" : "border-gray-300"}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={rowData[column.key] || ''}
                      onChange={(e) => updateField(column.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent ${errors[column.key] ? "border-red-500" : "border-gray-300"}`}
                      placeholder={column.label}
                    />
                  )}
                  {errors[column.key] && <p className="text-red-500 text-xs mt-1">{errors[column.key]}</p>}
                </div>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'رابط من (اختياري)' : 'From Link (Optional)'}
                    </span>
                  </label>
                  <input
                    type="url"
                    value={rowData.fromLink || ''}
                    onChange={(e) => updateField('fromLink', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder={language === 'ar' ? 'رابط الموقع' : 'Location link'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'رابط إلى (اختياري)' : 'To Link (Optional)'}
                    </span>
                  </label>
                  <input
                    type="url"
                    value={rowData.toLink || ''}
                    onChange={(e) => updateField('toLink', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder={language === 'ar' ? 'رابط الموقع' : 'Location link'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'ملاحظة (اختياري)' : 'Note (Optional)'}
                  </span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  rows={3}
                  placeholder={language === 'ar' ? 'أضف ملاحظة...' : 'Add note...'}
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {language === 'ar' ? 'السابق' : 'Back'}
            </button>
          )}
          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => {
                if (!validateStep(currentStep)) return;
                setCurrentStep((s) => s + 1);
              }}
              className="px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
              {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

