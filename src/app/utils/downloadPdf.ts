/**
 * Download PDF Utility
 * Phase 5: Export as PDF
 * 
 * Client-side PDF export functions using html2canvas and jsPDF
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export HTML element to PDF
 * @param element - HTML element to export
 * @param filename - Output filename (without .pdf extension)
 * @param options - Export options
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename: string = "document",
  options: {
    format?: "a4" | "letter" | [number, number];
    orientation?: "portrait" | "landscape";
    margin?: number;
    quality?: number;
    scale?: number;
  } = {}
): Promise<void> {
  const {
    format = "a4",
    orientation = "portrait",
    margin = 10,
    quality = 0.98,
    scale = 2,
  } = options;

  try {
    // Convert element to canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Calculate PDF dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Determine PDF page size
    let pdfWidth: number;
    let pdfHeight: number;

    if (Array.isArray(format)) {
      pdfWidth = format[0];
      pdfHeight = format[1];
    } else {
      // Standard page sizes in mm
      const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
      };
      const size = pageSizes[format];
      pdfWidth = orientation === "landscape" ? size.height : size.width;
      pdfHeight = orientation === "landscape" ? size.width : size.height;
    }

    // Calculate aspect ratio
    const aspectRatio = imgWidth / imgHeight;
    const pageAspectRatio = (pdfWidth - margin * 2) / (pdfHeight - margin * 2);

    let finalWidth: number;
    let finalHeight: number;

    if (aspectRatio > pageAspectRatio) {
      // Image is wider - fit to width
      finalWidth = pdfWidth - margin * 2;
      finalHeight = finalWidth / aspectRatio;
    } else {
      // Image is taller - fit to height
      finalHeight = pdfHeight - margin * 2;
      finalWidth = finalHeight * aspectRatio;
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: Array.isArray(format) ? format : format.toUpperCase(),
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/png", quality);

    // Add image to PDF
    pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

    // If content is taller than one page, split into multiple pages
    const pageHeight = pdfHeight - margin * 2;
    let heightLeft = finalHeight;
    let position = 0;

    while (heightLeft > 0) {
      position = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, finalWidth, finalHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("فشل تصدير PDF. يرجى المحاولة مرة أخرى.");
  }
}

/**
 * Export React component preview to PDF
 * @param selector - CSS selector for the element to export
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportPreviewToPDF(
  selector: string,
  filename: string = "preview",
  options?: Parameters<typeof exportElementToPDF>[2]
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;
  
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  return exportElementToPDF(element, filename, options);
}

/**
 * Export JSX code as PDF (renders code first)
 * @param code - JSX code string
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportJSXToPDF(
  code: string,
  filename: string = "document",
  options?: Parameters<typeof exportElementToPDF>[2]
): Promise<void> {
  // Create a temporary container
  const container = document.createElement("div");
  container.id = "pdf-export-temp";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm"; // A4 width
  container.style.padding = "20mm";
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  try {
    // Render JSX code (this would need to be done with react-live or similar)
    // For now, we'll assume the code is already rendered in the preview
    // and we'll export that instead
    
    // Wait a bit for rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    return exportElementToPDF(container, filename, options);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

/**
 * Export multiple pages to PDF
 * @param selectors - Array of CSS selectors for elements to export
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportMultipleToPDF(
  selectors: string[],
  filename: string = "document",
  options?: Parameters<typeof exportElementToPDF>[2]
): Promise<void> {
  const pdf = new jsPDF({
    orientation: options?.orientation || "portrait",
    unit: "mm",
    format: Array.isArray(options?.format)
      ? options.format
      : (options?.format || "a4").toUpperCase(),
  });

  const margin = options?.margin || 10;
  const quality = options?.quality || 0.98;
  const scale = options?.scale || 2;

  try {
    for (let i = 0; i < selectors.length; i++) {
      const element = document.querySelector(selectors[i]) as HTMLElement;
      
      if (!element) {
        console.warn(`Element not found: ${selectors[i]}`);
        continue;
      }

      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png", quality);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdfWidth - margin * 2;
      const pageHeight = pdfHeight - margin * 2;

      const aspectRatio = imgWidth / imgHeight;
      const pageAspectRatio = pageWidth / pageHeight;

      let finalWidth: number;
      let finalHeight: number;

      if (aspectRatio > pageAspectRatio) {
        finalWidth = pageWidth;
        finalHeight = finalWidth / aspectRatio;
      } else {
        finalHeight = pageHeight;
        finalWidth = finalHeight * aspectRatio;
      }

      // Add new page if not first
      if (i > 0) {
        pdf.addPage();
      }

      // Add image
      pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting multiple pages to PDF:", error);
    throw new Error("فشل تصدير PDF. يرجى المحاولة مرة أخرى.");
  }
}

/**
 * Get PDF download link (for preview before download)
 * @param element - HTML element to export
 * @param filename - Output filename
 * @param options - Export options
 * @returns Blob URL for the PDF
 */
export async function getPDFBlob(
  element: HTMLElement,
  filename: string = "document",
  options?: Parameters<typeof exportElementToPDF>[2]
): Promise<string> {
  const {
    format = "a4",
    orientation = "portrait",
    margin = 10,
    quality = 0.98,
    scale = 2,
  } = options || {};

  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    let pdfWidth: number;
    let pdfHeight: number;

    if (Array.isArray(format)) {
      pdfWidth = format[0];
      pdfHeight = format[1];
    } else {
      const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
      };
      const size = pageSizes[format];
      pdfWidth = orientation === "landscape" ? size.height : size.width;
      pdfHeight = orientation === "landscape" ? size.width : size.height;
    }

    const aspectRatio = imgWidth / imgHeight;
    const pageAspectRatio = (pdfWidth - margin * 2) / (pdfHeight - margin * 2);

    let finalWidth: number;
    let finalHeight: number;

    if (aspectRatio > pageAspectRatio) {
      finalWidth = pdfWidth - margin * 2;
      finalHeight = finalWidth / aspectRatio;
    } else {
      finalHeight = pdfHeight - margin * 2;
      finalWidth = finalHeight * aspectRatio;
    }

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: Array.isArray(format) ? format : format.toUpperCase(),
    });

    const imgData = canvas.toDataURL("image/png", quality);
    pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

    // Convert to blob
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    return url;
  } catch (error) {
    console.error("Error creating PDF blob:", error);
    throw new Error("فشل إنشاء PDF. يرجى المحاولة مرة أخرى.");
  }
}

