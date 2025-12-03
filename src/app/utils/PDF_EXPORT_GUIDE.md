# 📄 PDF Export Guide

## Overview

We use **html2pdf.js** for PDF export, which is a wrapper around html2canvas + jsPDF. It provides:

✅ **Better quality** - Higher resolution output  
✅ **Automatic page breaks** - Handles multi-page content  
✅ **Simpler API** - Easy to use  
✅ **Better layout handling** - Preserves formatting  

---

## 🚀 Quick Start

### Basic Export

```typescript
import { exportToPDF } from '@/app/utils/pdfExport';

const element = document.getElementById('content-to-export');

await exportToPDF(element, 'my-document', {
  format: 'a4',
  orientation: 'portrait',
  margin: 10,
});
```

### With Preview

```typescript
import { generatePDFBlob } from '@/app/utils/pdfExport';

// Generate blob for preview
const blobUrl = await generatePDFBlob(element, {
  format: 'a4',
  orientation: 'portrait',
  margin: 10,
});

// Show in iframe or download link
<iframe src={blobUrl} />
```

### With Progress

```typescript
import { exportToPDFWithProgress } from '@/app/utils/pdfExport';

await exportToPDFWithProgress(
  element,
  'my-document',
  { format: 'a4' },
  (progress) => {
    console.log(`Progress: ${progress}%`);
  }
);
```

---

## ⚙️ Options

### Format Options

```typescript
{
  format: 'a4' | 'letter' | [width, height], // Custom size in mm
  orientation: 'portrait' | 'landscape',
  margin: 10 | [top, right, bottom, left], // in mm
}
```

### Quality Options

```typescript
{
  image: {
    type: 'png' | 'jpeg',
    quality: 0.98, // 0-1
  },
  html2canvas: {
    scale: 2, // Higher = better quality (but slower)
    useCORS: true,
    backgroundColor: '#ffffff',
  },
}
```

### Page Break Options

```typescript
{
  pagebreak: {
    mode: 'avoid-all' | 'css' | 'legacy',
    before: '.page-break-before',
    after: '.page-break-after',
    avoid: '.no-break',
  },
}
```

---

## 📋 Complete Example

```typescript
import { exportToPDF } from '@/app/utils/pdfExport';

const handleExport = async () => {
  const element = document.getElementById('preview-content');
  
  if (!element) return;
  
  try {
    await exportToPDF(element, 'travel-package', {
      format: 'a4',
      orientation: 'portrait',
      margin: [15, 10, 15, 10], // top, right, bottom, left
      image: {
        type: 'png',
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      pagebreak: {
        mode: 'avoid-all',
        avoid: '.no-break',
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

---

## 🎯 Best Practices

1. **Use Preview First**
   - Always show preview before download
   - Let users verify content

2. **Optimize Quality**
   - Use `scale: 2` for good quality
   - Use `scale: 3` for high quality (slower)

3. **Handle Page Breaks**
   - Add `.no-break` class to elements that shouldn't break
   - Use page break classes for control

4. **Progress Feedback**
   - Show progress for large documents
   - Disable buttons during export

5. **Error Handling**
   - Always wrap in try-catch
   - Show user-friendly error messages

---

## 🔧 Troubleshooting

### Issue: Low Quality Output
**Solution:** Increase `scale` in `html2canvas` options
```typescript
html2canvas: { scale: 3 }
```

### Issue: Content Cut Off
**Solution:** Check margins and element dimensions
```typescript
margin: [20, 15, 20, 15] // More margin
```

### Issue: Page Breaks in Wrong Places
**Solution:** Use page break classes
```typescript
pagebreak: {
  mode: 'css',
  avoid: '.no-break',
}
```

### Issue: Images Not Loading
**Solution:** Enable CORS
```typescript
html2canvas: { useCORS: true }
```

---

## 📦 Installation

Already installed! The package is in `package.json`:

```json
{
  "dependencies": {
    "html2pdf.js": "^0.10.2"
  }
}
```

---

**Last Updated:** 2025-12-03  
**Status:** ✅ Production Ready
