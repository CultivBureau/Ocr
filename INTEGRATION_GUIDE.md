# Frontend-Backend Integration Guide

## ✅ Integration Complete!

The frontend has been successfully integrated with the backend API.

## What Was Updated

### 1. API Service (`app/services/PdfApi.js`)
- ✅ Updated base URL from port 5001 → 8000
- ✅ Fixed upload endpoint: `/api/upload` → `/upload/`
- ✅ Added `extractContent()` function
- ✅ Added `cleanStructure()` function
- ✅ Updated `generateJsx()` to match backend API
- ✅ Updated `fixJsx()` to match backend API format
- ✅ Improved error handling for backend response format

### 2. PdfConverter Page (`app/pages/PdfConverter/page.tsx`)
- ✅ Updated to use new API flow: Upload → Extract → Clean → Generate JSX
- ✅ Removed old table extraction logic (now handled by backend)
- ✅ Added proper error handling
- ✅ Added progress status updates for each step

## New API Flow

```
1. Upload PDF → Get file_path
   POST /upload/
   
2. Extract Content → Get sections & tables
   POST /extract/
   
3. Clean Structure (optional) → Improve quality
   POST /ai/clean-structure
   
4. Generate JSX → Get React code
   POST /ai/generate-jsx
   
5. Validate & Fix JSX (if needed) → Fix syntax errors
   POST /ai/fix-jsx
```

## Setup Instructions

### 1. Create Environment File

Create `.env.local` in the frontend root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Or create manually:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Start Backend Server

```bash
cd /Users/mac/Documents/GitHub/Pdf-Converter-backend
./run.sh
# or
uvicorn app.main:app --reload
```

### 3. Start Frontend

```bash
cd /Users/mac/Documents/GitHub/Pdf-Converter
npm run dev
```

## API Functions Available

### Upload & Extract
```javascript
import { uploadFile, extractContent } from '@/app/services/PdfApi';

// Upload
const { file_path } = await uploadFile(file);

// Extract
const { sections, tables, meta } = await extractContent(file_path);
```

### AI Operations
```javascript
import { cleanStructure, generateJsx, fixJsx } from '@/app/services/PdfApi';

// Clean structure
const cleaned = await cleanStructure(structure);

// Generate JSX
const { jsxCode, componentsUsed, warnings } = await generateJsx(structure);

// Fix JSX
const { fixedCode, explanation } = await fixJsx(jsxCode, errorMessage);
```

## Response Formats

### Upload Response
```json
{
  "message": "File uploaded successfully",
  "file_path": "/app/static/temp_uploads/abc123_document.pdf",
  "filename": "abc123_document.pdf",
  "original_filename": "document.pdf"
}
```

### Extract Response
```json
{
  "sections": [
    {
      "type": "section",
      "id": "section_1",
      "title": "Introduction",
      "content": "Content...",
      "order": 0,
      "parent_id": null
    }
  ],
  "tables": [
    {
      "type": "table",
      "id": "table_1",
      "columns": ["Col1", "Col2"],
      "rows": [["Val1", "Val2"]],
      "order": 0,
      "section_id": null
    }
  ],
  "meta": {
    "generated_at": "2024-01-01T00:00:00",
    "sections_count": 1,
    "tables_count": 1
  }
}
```

### Generate JSX Response
```json
{
  "jsxCode": "import React from 'react';\n...",
  "componentsUsed": ["SectionTemplate", "DynamicTableTemplate"],
  "warnings": [],
  "metadata": {
    "model": "gpt-4o",
    "tokens_used": 500
  }
}
```

## Error Handling

All API functions throw errors that can be caught:

```javascript
try {
  const result = await uploadFile(file);
} catch (error) {
  // error.message contains the error message
  console.error('Upload failed:', error.message);
}
```

## Testing the Integration

1. **Start both servers:**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Upload a PDF:**
   - Go to `/pages/PdfConverter`
   - Select a PDF file
   - Click "Upload & Generate Template"

3. **Check the flow:**
   - Watch status messages for each step
   - Should redirect to CodePreview when complete

## Troubleshooting

### CORS Errors
- Make sure backend is running on port 8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Backend CORS is configured to allow localhost:3000

### Connection Errors
- Verify backend is running: `curl http://localhost:8000/health`
- Check browser console for detailed error messages
- Verify API_BASE_URL in `.env.local`

### Upload Fails
- Check file is PDF format
- Check file size (max 50MB)
- Check backend logs for errors

## Next Steps

1. ✅ Upload integration - DONE
2. ✅ Extract integration - DONE
3. ✅ Clean structure integration - DONE
4. ✅ Generate JSX integration - DONE
5. ✅ Fix JSX integration - DONE

The frontend is now fully integrated with the backend API! 🎉

