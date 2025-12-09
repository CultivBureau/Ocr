"use client";

import React from 'react';
import BaseTemplate from '@/app/Templates/baseTemplate';
import SectionTemplate from '@/app/Templates/sectionTemplate';
import DynamicTableTemplate from '@/app/Templates/dynamicTableTemplate';

interface Section {
  type: string;
  id?: string;
  title?: string;
  content?: string;
  order?: number;
  parent_id?: string | null;
}

interface Table {
  type: string;
  id?: string;
  columns?: string[];
  rows?: any[][];
  order?: number;
  section_id?: string | null;
}

interface DocumentViewerProps {
  sections?: Section[];
  tables?: Table[];
  language?: 'ar' | 'en' | 'auto';
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  sections = [], 
  tables = [],
  language = 'auto'
}) => {
  // Determine if content is Arabic based on language prop or content
  const isArabic = language === 'ar' || 
    (language === 'auto' && sections.some(s => {
      const text = (s.title || '') + (s.content || '');
      // Check if text contains Arabic characters
      return /[\u0600-\u06FF]/.test(text);
    }));

  // Apply RTL direction if Arabic
  const containerStyle: React.CSSProperties = {
    direction: isArabic ? 'rtl' : 'ltr',
    textAlign: isArabic ? 'right' : 'left',
  };

  return (
    <div style={containerStyle}>
      <BaseTemplate>
        {sections.map((section, index) => (
          <SectionTemplate 
            key={section.id || `section-${index}`}
            title={section.title || ""}
            content={section.content || ""}
          />
        ))}

        {tables.map((table, index) => (
          <DynamicTableTemplate
            key={table.id || `table-${index}`}
            columns={table.columns || []}
            rows={table.rows || []}
          />
        ))}
      </BaseTemplate>
    </div>
  );
};

export default DocumentViewer;

