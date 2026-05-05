"use client";

import React from "react";
import type {
  ComponentSuggestion,
  AirplaneSectionData,
  HotelsSectionData,
  TransportSectionData,
  ExtraServiceSectionData,
  TotalPriceSectionData,
} from "../types/ExtractTypes";
import AirplaneSection from "../templates/airplaneSection";
import HotelsSection from "../templates/HotelsSection";
import TransportSection from "../templates/TransportSection";
import DynamicTableTemplate from "../templates/dynamicTableTemplate";
import SectionTemplate from "../templates/sectionTemplate";

interface SuggestionRealPreviewProps {
  suggestion: ComponentSuggestion;
  language: "ar" | "en";
  direction: "rtl" | "ltr";
}

const SuggestionRealPreview: React.FC<SuggestionRealPreviewProps> = ({
  suggestion,
  language,
  direction,
}) => {
  if (suggestion.type === "airplane") {
    const data = suggestion.data as AirplaneSectionData;
    return (
      <AirplaneSection
        id={`preview_${suggestion.id}`}
        {...data}
        direction={data.direction || direction}
        language={data.language || language}
        editable={false}
      />
    );
  }

  if (suggestion.type === "hotel") {
    const data = suggestion.data as HotelsSectionData;
    return (
      <HotelsSection
        id={`preview_${suggestion.id}`}
        {...data}
        direction={data.direction || direction}
        language={data.language || language}
        editable={false}
      />
    );
  }

  if (suggestion.type === "transport") {
    const data = suggestion.data as TransportSectionData;
    return (
      <TransportSection
        id={`preview_${suggestion.id}`}
        {...data}
        tables={data.tables || []}
        direction={data.direction || direction}
        language={data.language || language}
        editable={false}
      />
    );
  }

  if (suggestion.type === "extra_service") {
    const data = suggestion.data as ExtraServiceSectionData;
    const rows = Array.isArray(data.rows) ? data.rows : [];
    const tableRows = rows.map((r) => [
      r?.day ?? "",
      r?.date ?? "",
      r?.country ?? "",
      r?.service_name ?? "",
      String(r?.count ?? ""),
    ]);

    return (
      <DynamicTableTemplate
        title={data.title || "خدمات اخرى"}
        columns={["يوم", "التاريخ", "البلد", "اسم الخدمة", "العدد"]}
        rows={tableRows}
        editable={false}
        tableBackgroundColor="pink"
      />
    );
  }

  if (suggestion.type === "total_price") {
    const data = suggestion.data as TotalPriceSectionData;
    const totalText =
      data.formattedTotal?.trim() ||
      `${data.amount || ""} ${data.currency || ""}`.trim();

    return (
      <SectionTemplate
        title={data.title || "الاجمالي كليا"}
        content={totalText || "-"}
        editable={false}
        showUnderline={false}
        titleSize="3xl"
        contentSize="xl"
        contentAlignment="center"
        containerClassName="border rounded-lg overflow-hidden"
        backgroundColor="bg-white"
        border
        borderColor="border-green-600"
      />
    );
  }

  return null;
};

export default SuggestionRealPreview;
