"use client";

import React, { useReducer, useEffect } from "react";
import { extractReducer, initialExtractState } from "@/app/Store/extractSlice";
import StructureRenderer from "@/app/components/StructureRenderer";
import type { Section, Table } from "@/app/types/ExtractTypes";

interface ExtractedDataViewProps {
  extractedData: {
    sections: Section[];
    tables: Table[];
    meta: Record<string, any>;
  } | null;
}

/**
 * Extracted Data View Component
 * Phase 3: Receiving Extracted Data
 * 
 * Displays extracted sections and tables using Redux slice
 */
export default function ExtractedDataView({ extractedData }: ExtractedDataViewProps) {
  const [state, dispatch] = useReducer(extractReducer, initialExtractState);

  useEffect(() => {
    if (extractedData) {
      // Dispatch EXTRACT_SUCCESS to update state
      dispatch({
        type: "EXTRACT_SUCCESS",
        payload: {
          sections: extractedData.sections,
          tables: extractedData.tables,
          meta: extractedData.meta,
        },
      });
    }
  }, [extractedData]);

  if (!state.structure) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>لا توجد بيانات مستخرجة للعرض</p>
      </div>
    );
  }

  const handleSectionEdit = (section: Section) => {
    console.log("Edit section:", section);
    // TODO: Implement edit functionality
  };

  const handleTableEdit = (table: Table) => {
    console.log("Edit table:", table);
    // TODO: Implement edit functionality
  };

  return (
    <div className="extracted-data-view p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">البيانات المستخرجة</h2>
        <p className="text-gray-600">
          {state.sections.length} قسم، {state.tables.length} جدول
        </p>
      </div>

      <StructureRenderer
        structure={state.structure}
        showStats={true}
        editable={false}
        onSectionEdit={handleSectionEdit}
        onTableEdit={handleTableEdit}
      />

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Sections in Map: {state.sectionMap.size}</p>
          <p>Tables in Map: {state.tableMap.size}</p>
          <p>File: {state.filename || "N/A"}</p>
        </div>
      )}
    </div>
  );
}

