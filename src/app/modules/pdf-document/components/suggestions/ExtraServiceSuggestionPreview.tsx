"use client";

import React from "react";
import type { ExtraServiceSectionData } from "@/app/modules/pdf-document/types/ExtractTypes";

interface ExtraServiceSuggestionPreviewProps {
  data: ExtraServiceSectionData;
  language?: "ar" | "en";
  direction?: "rtl" | "ltr";
}

const ExtraServiceSuggestionPreview: React.FC<ExtraServiceSuggestionPreviewProps> = ({
  data,
  language = "ar",
  direction = "rtl",
}) => {
  const rows = data.rows || [];
  const title = data.title || (language === "ar" ? "خدمات اخرى" : "Extra Services");

  return (
    <div className="border-2 border-pink-300 rounded-lg p-4 bg-pink-50" dir={direction}>
      <h3 className="font-bold text-pink-800 mb-3">{title}</h3>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-pink-300 text-sm">
            <thead className="bg-pink-200 text-pink-900">
              <tr>
                <th className="border border-pink-300 px-2 py-1">{language === "ar" ? "يوم" : "Day"}</th>
                <th className="border border-pink-300 px-2 py-1">{language === "ar" ? "التاريخ" : "Date"}</th>
                <th className="border border-pink-300 px-2 py-1">{language === "ar" ? "البلد" : "Country"}</th>
                <th className="border border-pink-300 px-2 py-1">{language === "ar" ? "اسم الخدمة" : "Service Name"}</th>
                <th className="border border-pink-300 px-2 py-1">{language === "ar" ? "العدد" : "Count"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="border border-pink-200 px-2 py-1">{row.day}</td>
                  <td className="border border-pink-200 px-2 py-1">{row.date}</td>
                  <td className="border border-pink-200 px-2 py-1">{row.country}</td>
                  <td className="border border-pink-200 px-2 py-1">{row.service_name}</td>
                  <td className="border border-pink-200 px-2 py-1">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">{language === "ar" ? "لا توجد خدمات إضافية" : "No extra services"}</p>
      )}
    </div>
  );
};

export default ExtraServiceSuggestionPreview;
