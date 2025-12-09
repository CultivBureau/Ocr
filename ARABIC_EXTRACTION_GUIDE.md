# Arabic PDF Extraction - Frontend Integration Guide

## Problem
The backend correctly extracts Arabic content from PDFs, but the frontend was showing hardcoded English content instead of using the API response.

## Solution

### 1. Update API Call to Include Language Parameter

The `extractContent` function in `src/app/services/PdfApi.js` has been updated to accept and pass the `language` parameter:

```javascript
export async function extractContent(filePath, language = 'auto') {
  return request("/extract/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      file_path: filePath,
      language: language  // 'auto', 'en', or 'ar'
    }),
  });
}
```

### 2. Use API Response Instead of Hardcoded Data

**Before (Wrong):**
```tsx
const sections = [
  {
    "type": "section",
    "title": "Tourism in Georgia",  // Hardcoded English
    "content": "The program includes...",  // Hardcoded English
    // ...
  }
];
```

**After (Correct):**
```tsx
// Get data from API response
const extractResponse = await extractContent(filePath, 'auto');
const sections = extractResponse.sections;  // Use actual extracted data
const tables = extractResponse.tables;     // Use actual extracted data
```

### 3. Updated DocumentViewer Component

A new `DocumentViewer.tsx` component has been created that:
- Accepts `sections` and `tables` as props (from API response)
- Automatically detects Arabic content
- Applies RTL (right-to-left) direction for Arabic content
- Properly displays Arabic text

**Usage:**
```tsx
import DocumentViewer from '@/app/Templates/DocumentViewer';

// After extracting from API
const response = await extractContent(filePath, 'auto');

<DocumentViewer 
  sections={response.sections}
  tables={response.tables}
  language={response.meta?.detected_language || 'auto'}
/>
```

### 4. Language Parameter Options

When calling `extractContent`:

- **`'auto'`** (default): Backend auto-detects language from PDF content
  ```tsx
  const response = await extractContent(filePath, 'auto');
  ```

- **`'ar'`**: Force Arabic extraction pipeline
  ```tsx
  const response = await extractContent(filePath, 'ar');
  ```

- **`'en'`**: Force English extraction pipeline
  ```tsx
  const response = await extractContent(filePath, 'en');
  ```

### 5. Check Response Meta for Language

The API response includes language information in `meta`:

```typescript
{
  sections: [...],
  tables: [...],
  meta: {
    language: "auto",
    detected_language: "ar",  // 'ar' or 'en'
    extraction_pipeline: "arabic"  // 'arabic' or 'english'
  }
}
```

### 6. RTL Support

The `DocumentViewer` component automatically:
- Detects Arabic content
- Applies `direction: 'rtl'` CSS
- Sets `textAlign: 'right'`
- Preserves Arabic text formatting

### 7. Complete Integration Example

```tsx
"use client";

import { useState } from 'react';
import { extractContent } from '@/app/services/PdfApi';
import DocumentViewer from '@/app/Templates/DocumentViewer';

export default function PdfViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExtract = async (filePath: string) => {
    setLoading(true);
    try {
      // Extract with auto language detection
      const response = await extractContent(filePath, 'auto');
      
      // Use the actual extracted data
      setData({
        sections: response.sections,
        tables: response.tables,
        language: response.meta?.detected_language || 'auto'
      });
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <DocumentViewer 
      sections={data.sections}
      tables={data.tables}
      language={data.language}
    />
  );
}
```

## Key Points

1. ✅ **Always use API response data** - Don't hardcode sections/tables
2. ✅ **Pass language parameter** - Use 'auto' for auto-detection
3. ✅ **Check meta.detected_language** - To know what language was detected
4. ✅ **Use DocumentViewer component** - It handles RTL automatically
5. ✅ **Backend preserves Arabic** - No translation happens, original Arabic is returned

## Backend Behavior

- When `language='auto'`: Backend detects Arabic PDFs and uses Arabic pipeline
- When `language='ar'`: Backend forces Arabic pipeline (even for English PDFs)
- When `language='en'`: Backend forces English pipeline (even for Arabic PDFs)

**Recommended:** Use `'auto'` to let the backend detect the language automatically.

