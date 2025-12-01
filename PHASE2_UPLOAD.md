# Phase 2: Upload & API Integration ✅

## الملفات المُنشأة

### 1. ✅ `src/app/services/PdfApi.js`
- **تم التحديث**: API endpoints لتتوافق مع Backend الجديد
- **Base URL**: `http://localhost:8000` (تم التحديث من 5001)
- **Endpoints**:
  - `POST /upload/` - رفع ملف PDF
  - `POST /extract/` - استخراج المحتوى
  - `POST /ai/clean-structure` - تنظيف البنية
  - `POST /ai/generate-jsx` - توليد JSX
  - `POST /ai/fix-jsx` - إصلاح JSX

### 2. ✅ `src/app/types/ExtractTypes.ts`
- **TypeScript Types** لجميع البيانات:
  - `Section`, `Table`, `Structure`
  - `UploadResponse`, `ExtractResponse`
  - `CleanStructureResponse`, `GenerateJSXResponse`, `FixJSXResponse`

### 3. ✅ `src/app/Store/extractSlice.ts`
- **State Management** للرفع والاستخراج
- **Actions**: UPLOAD_START, UPLOAD_SUCCESS, UPLOAD_ERROR, EXTRACT_START, EXTRACT_SUCCESS, EXTRACT_ERROR
- **State**: filePath, filename, sections, tables, meta, errors, loading states

### 4. ✅ `src/app/Hooks/useUpload.ts`
- **Custom Hook** للرفع والاستخراج
- **Functions**:
  - `handleUpload(file)` - رفع ملف PDF
  - `handleExtract(filePath)` - استخراج المحتوى
  - `reset()` - إعادة تعيين الحالة
- **Returns**: State + Actions

### 5. ✅ `src/app/Upload/uploadForm.tsx`
- **Component** لنموذج الرفع
- **Features**:
  - اختيار ملف PDF
  - عرض حالة الرفع والاستخراج
  - معالجة الأخطاء
  - رسائل النجاح
  - إعادة تعيين

### 6. ✅ `src/app/Upload/page.tsx`
- **Page Component** لصفحة الرفع
- **Features**:
  - Header مع Logo
  - Upload Form
  - حفظ البيانات في sessionStorage
  - Navigation ready

## Flow العمل

```
1. المستخدم يختار ملف PDF
   ↓
2. handleUpload(file)
   → POST /upload/
   → استلام file_path
   ↓
3. handleExtract(file_path)
   → POST /extract/
   → استلام sections & tables
   ↓
4. حفظ البيانات في sessionStorage
   ↓
5. جاهز للمرحلة التالية (Preview/Processing)
```

## الاستخدام

### في Component:

```tsx
import UploadForm from "@/app/Upload/uploadForm";

export default function MyPage() {
  const handleUploadSuccess = (filePath, filename) => {
    console.log("Uploaded:", filePath);
  };

  const handleExtractSuccess = (data) => {
    console.log("Extracted:", data);
  };

  return (
    <UploadForm
      onUploadSuccess={handleUploadSuccess}
      onExtractSuccess={handleExtractSuccess}
    />
  );
}
```

### استخدام Hook مباشرة:

```tsx
import { useUpload } from "@/app/Hooks/useUpload";

function MyComponent() {
  const { handleUpload, handleExtract, isUploading, filePath } = useUpload();
  
  const processFile = async (file) => {
    const uploadResult = await handleUpload(file);
    if (uploadResult) {
      await handleExtract(uploadResult.file_path);
    }
  };
}
```

## البيانات المُرجعة

### Upload Response:
```typescript
{
  message: "File uploaded successfully",
  file_path: "/app/static/temp_uploads/abc123.pdf",
  filename: "abc123.pdf",
  original_filename: "document.pdf"
}
```

### Extract Response:
```typescript
{
  sections: [
    {
      type: "section",
      id: "section_1",
      title: "Introduction",
      content: "...",
      order: 0,
      parent_id: null
    }
  ],
  tables: [
    {
      type: "table",
      id: "table_1",
      columns: ["Name", "Age"],
      rows: [["John", "30"]],
      order: 0,
      section_id: null
    }
  ],
  meta: {
    generated_at: "2024-01-01T00:00:00",
    sections_count: 1,
    tables_count: 1
  }
}
```

## الخطوات التالية (Phase 3)

1. ✅ Phase 2: Upload & Extract - **مكتمل**
2. ⏳ Phase 3: Clean Structure (AI)
3. ⏳ Phase 4: Generate JSX
4. ⏳ Phase 5: Preview & Edit

## الاختبار

1. تأكد من تشغيل Backend على `http://localhost:8000`
2. افتح `/upload` في المتصفح
3. اختر ملف PDF
4. اضغط "رفع واستخراج"
5. تحقق من النتائج في console و sessionStorage

---

**Status**: ✅ Phase 2 Complete - Ready for testing!

