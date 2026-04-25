"use client";

import React from "react";
import type { TotalPriceSectionData } from "@/app/modules/pdf-document/types/ExtractTypes";

interface TotalPriceSuggestionPreviewProps {
  data: TotalPriceSectionData;
  language?: "ar" | "en";
  direction?: "rtl" | "ltr";
}

const TotalPriceSuggestionPreview: React.FC<TotalPriceSuggestionPreviewProps> = ({
  data,
  language = "ar",
  direction = "rtl",
}) => {
  const title = data.title || (language === "ar" ? "الاجمالي كليا" : "Grand Total");
  const totalText = data.formattedTotal?.trim() || `${data.amount || ""} ${data.currency || ""}`.trim();

  return (
    <div className="border rounded-lg overflow-hidden" dir={direction}>
      <div className="bg-green-600 text-white text-center font-bold text-2xl py-2 px-3">
        {title}
      </div>
      <div className="border border-green-600 border-t-0 bg-white text-center font-bold text-5xl py-3 px-3 text-gray-800">
        {totalText || (language === "ar" ? "—" : "-")}
      </div>
    </div>
  );
};

export default TotalPriceSuggestionPreview;
