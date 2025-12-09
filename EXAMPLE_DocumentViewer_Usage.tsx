"use client";

import React, { useState, useEffect } from 'react';
import BaseTemplate from '@/app/Templates/baseTemplate';
import SectionTemplate from '@/app/Templates/sectionTemplate';
import DynamicTableTemplate from '@/app/Templates/dynamicTableTemplate';
import { extractContent } from '@/app/services/PdfApi';

/**
 * Example: How to use DocumentViewer with actual API data
 * 
 * This replaces the hardcoded English data with real extracted Arabic content
 */
const DocumentViewerExample: React.FC<{ filePath: string }> = ({ filePath }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en' | 'auto'>('auto');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Call API with language parameter (auto-detects Arabic)
        const response = await extractContent(filePath, 'auto');
        
        // ✅ Use actual extracted data from API (not hardcoded!)
        setSections(response.sections || []);
        setTables(response.tables || []);
        
        // ✅ Get detected language from meta
        const detectedLang = response.meta?.detected_language || 'auto';
        setLanguage(detectedLang === 'ar' ? 'ar' : 'en');
        
        console.log('Extracted data:', {
          sections: response.sections?.length || 0,
          tables: response.tables?.length || 0,
          language: detectedLang,
          pipeline: response.meta?.extraction_pipeline
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
      loadData();
    }
  }, [filePath]);

  // Determine if content is Arabic
  const isArabic = language === 'ar' || 
    sections.some(s => {
      const text = (s.title || '') + (s.content || '');
      return /[\u0600-\u06FF]/.test(text);
    });

  // Apply RTL for Arabic
  const containerStyle: React.CSSProperties = {
    direction: isArabic ? 'rtl' : 'ltr',
    textAlign: isArabic ? 'right' : 'left',
    fontFamily: isArabic ? 'Arial, "Arabic Typesetting", "Traditional Arabic", sans-serif' : 'inherit',
  };

  if (loading) {
    return <div>جاري تحميل المحتوى... / Loading content...</div>;
  }

  if (error) {
    return <div>خطأ: {error} / Error: {error}</div>;
  }

  return (
    <div style={containerStyle}>
      <BaseTemplate>
        {/* ✅ Render sections from API response */}
        {sections.map((section, index) => (
          <SectionTemplate 
            key={section.id || `section-${index}`}
            title={section.title || ""}
            content={section.content || ""}
          />
        ))}

        {/* ✅ Render tables from API response */}
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

export default DocumentViewerExample;

/**
 * ALTERNATIVE: Use the DocumentViewer component directly
 */
export const DocumentViewerSimple: React.FC<{ filePath: string }> = ({ filePath }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ Extract with auto language detection
        const response = await extractContent(filePath, 'auto');
        setData(response);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
      loadData();
    }
  }, [filePath]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // ✅ Use DocumentViewer component (handles RTL automatically)
  return (
    <DocumentViewer 
      sections={data.sections}
      tables={data.tables}
      language={data.meta?.detected_language || 'auto'}
    />
  );
};

