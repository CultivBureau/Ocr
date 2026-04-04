/**
 * PDF Export Utility using html2pdf.js
 * 
 * Better than html2canvas + jsPDF because:
 * - Automatic page breaks
 * - Better quality
 * - Simpler API
 * - Better multi-page handling
 */

import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  /**
   * Page format: 'a4', 'letter', or custom [width, height] in mm
   */
  format?: 'a4' | 'letter' | [number, number];
  
  /**
   * Page orientation
   */
  orientation?: 'portrait' | 'landscape';
  
  /**
   * Margins in mm
   */
  margin?: number | [number, number, number, number];
  
  /**
   * Image quality (0-1)
   */
  image?: {
    type?: 'jpeg' | 'png';
    quality?: number;
  };
  
  /**
   * HTML2Canvas options
   */
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    backgroundColor?: string;
    width?: number;
    height?: number;
  };
  
  /**
   * jsPDF options
   */
  jsPDF?: {
    unit?: 'mm' | 'pt' | 'px' | 'in';
    format?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
  };
  
  /**
   * Enable page breaks
   */
  enableLinks?: boolean;
  
  /**
   * Page break mode
   */
  pagebreak?: {
    mode?: 'avoid-all' | 'css' | 'legacy';
    before?: string;
    after?: string;
    avoid?: string;
  };
}

const defaultOptions: PDFExportOptions = {
  format: 'a4',
  orientation: 'portrait',
  margin: 10,
  image: {
    type: 'png',
    quality: 0.98,
  },
  html2canvas: {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    // Note: onclone will be added in error handler if needed
    // to avoid issues with unsupported color functions
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  },
  enableLinks: true,
  pagebreak: {
    mode: 'avoid-all',
  },
};

/**
 * Export HTML element to PDF using html2pdf.js
 * 
 * @param element - HTML element to export
 * @param filename - Output filename (without .pdf extension)
 * @param options - Export options
 * @returns Promise that resolves when PDF is generated
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = 'document',
  options: PDFExportOptions = {}
): Promise<void> {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    image: {
      ...defaultOptions.image,
      ...options.image,
    },
    html2canvas: {
      ...defaultOptions.html2canvas,
      ...options.html2canvas,
    },
    jsPDF: {
      ...defaultOptions.jsPDF,
      ...options.jsPDF,
      format: options.format || defaultOptions.format,
      orientation: options.orientation || defaultOptions.orientation,
    },
    pagebreak: {
      ...defaultOptions.pagebreak,
      ...options.pagebreak,
    },
  };

  try {
    // Configure html2pdf - NO browser dialogs, direct download
    const opt = {
      margin: mergedOptions.margin,
      filename: `${filename}.pdf`,
      image: mergedOptions.image,
      html2canvas: mergedOptions.html2canvas,
      jsPDF: mergedOptions.jsPDF,
      enableLinks: mergedOptions.enableLinks,
      pagebreak: mergedOptions.pagebreak,
    };

    // Convert colors to RGB and remove unsupported color functions
    const convertColorsToRGB = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      
      // Convert background colors to static RGB (skip lab/lch/oklab functions)
      if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const bgColor = computed.backgroundColor;
        if (!bgColor.includes('lab(') && !bgColor.includes('lch(') && !bgColor.includes('oklab(')) {
          el.style.backgroundColor = bgColor;
        } else {
          // Fallback to white if unsupported color function
          el.style.backgroundColor = '#ffffff';
        }
      }
      
      // Convert text colors to static RGB
      if (computed.color) {
        const textColor = computed.color;
        if (!textColor.includes('lab(') && !textColor.includes('lch(') && !textColor.includes('oklab(')) {
          el.style.color = textColor;
        } else {
          // Fallback to black if unsupported color function
          el.style.color = '#000000';
        }
      }
      
      // Convert border colors to static RGB
      if (computed.borderColor) {
        const borderColor = computed.borderColor;
        if (!borderColor.includes('lab(') && !borderColor.includes('lch(') && !borderColor.includes('oklab(')) {
          el.style.borderColor = borderColor;
        } else {
          // Fallback to gray if unsupported color function
          el.style.borderColor = '#e5e7eb';
        }
      }
      
      // Recursively process all children
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          convertColorsToRGB(child);
        }
      });
    };

    // Clone element to avoid modifying original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    convertColorsToRGB(clonedElement);

    // Remove all style tags that might contain lab() colors BEFORE export
    const styleTags = clonedElement.querySelectorAll('style');
    styleTags.forEach((style: HTMLStyleElement) => {
      if (style.textContent && (
        style.textContent.includes('lab(') ||
        style.textContent.includes('lch(') ||
        style.textContent.includes('oklab(')
      )) {
        style.remove();
      }
    });

    // Generate PDF blob with onclone to fix computed styles
    const pdfBlob: Blob = await html2pdf()
      .set({
        ...opt,
        html2canvas: {
          ...opt.html2canvas,
          onclone: (clonedDoc: Document) => {
            // Fix all elements' computed styles
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                try {
                  const computed = clonedDoc.defaultView?.getComputedStyle(el);
                  if (computed) {
                    const bgColor = computed.backgroundColor;
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                      if (bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklab(')) {
                        el.style.backgroundColor = '#ffffff';
                      } else {
                        el.style.backgroundColor = bgColor;
                      }
                    }
                    
                    const textColor = computed.color;
                    if (textColor) {
                      if (textColor.includes('lab(') || textColor.includes('lch(') || textColor.includes('oklab(')) {
                        el.style.color = '#000000';
                      } else {
                        el.style.color = textColor;
                      }
                    }
                    
                    const borderColor = computed.borderColor;
                    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                      if (borderColor.includes('lab(') || borderColor.includes('lch(') || borderColor.includes('oklab(')) {
                        el.style.borderColor = '#e5e7eb';
                      } else {
                        el.style.borderColor = borderColor;
                      }
                    }
                  }
                } catch (e) {
                  // Safe fallback
                }
              }
            });
          },
        },
      })
      .from(clonedElement)
      .outputPdf('blob');

    // Create download link and trigger download programmatically
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to export PDF. Please try again.'
    );
  }
}

/**
 * Generate PDF blob for preview (without downloading)
 * 
 * @param element - HTML element to export
 * @param options - Export options
 * @returns Promise that resolves with blob URL
 */
export async function generatePDFBlob(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<string> {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    image: {
      ...defaultOptions.image,
      ...options.image,
    },
    html2canvas: {
      ...defaultOptions.html2canvas,
      ...options.html2canvas,
    },
    jsPDF: {
      ...defaultOptions.jsPDF,
      ...options.jsPDF,
      format: options.format || defaultOptions.format,
      orientation: options.orientation || defaultOptions.orientation,
    },
    pagebreak: {
      ...defaultOptions.pagebreak,
      ...options.pagebreak,
    },
  };

  try {
    const opt = {
      margin: mergedOptions.margin,
      image: mergedOptions.image,
      html2canvas: mergedOptions.html2canvas,
      jsPDF: mergedOptions.jsPDF,
      enableLinks: mergedOptions.enableLinks,
      pagebreak: mergedOptions.pagebreak,
    };

    // Convert colors to RGB and remove unsupported color functions
    const convertColorsToRGB = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      
      if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const bgColor = computed.backgroundColor;
        if (!bgColor.includes('lab(') && !bgColor.includes('lch(') && !bgColor.includes('oklab(')) {
          el.style.backgroundColor = bgColor;
        } else {
          el.style.backgroundColor = '#ffffff';
        }
      }
      
      if (computed.color) {
        const textColor = computed.color;
        if (!textColor.includes('lab(') && !textColor.includes('lch(') && !textColor.includes('oklab(')) {
          el.style.color = textColor;
        } else {
          el.style.color = '#000000';
        }
      }
      
      if (computed.borderColor) {
        const borderColor = computed.borderColor;
        if (!borderColor.includes('lab(') && !borderColor.includes('lch(') && !borderColor.includes('oklab(')) {
          el.style.borderColor = borderColor;
        } else {
          el.style.borderColor = '#e5e7eb';
        }
      }
      
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          convertColorsToRGB(child);
        }
      });
    };

    const clonedElement = element.cloneNode(true) as HTMLElement;
    convertColorsToRGB(clonedElement);

    // Remove all style tags that might contain lab() colors BEFORE export
    const styleTags = clonedElement.querySelectorAll('style');
    styleTags.forEach((style: HTMLStyleElement) => {
      if (style.textContent && (
        style.textContent.includes('lab(') ||
        style.textContent.includes('lch(') ||
        style.textContent.includes('oklab(')
      )) {
        style.remove();
      }
    });

    // Generate PDF as blob with onclone to fix computed styles
    const pdfBlob: Blob = await html2pdf()
      .set({
        ...opt,
        html2canvas: {
          ...opt.html2canvas,
          onclone: (clonedDoc: Document) => {
            // Fix all elements' computed styles
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                try {
                  const computed = clonedDoc.defaultView?.getComputedStyle(el);
                  if (computed) {
                    const bgColor = computed.backgroundColor;
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                      if (bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklab(')) {
                        el.style.backgroundColor = '#ffffff';
                      } else {
                        el.style.backgroundColor = bgColor;
                      }
                    }
                    
                    const textColor = computed.color;
                    if (textColor) {
                      if (textColor.includes('lab(') || textColor.includes('lch(') || textColor.includes('oklab(')) {
                        el.style.color = '#000000';
                      } else {
                        el.style.color = textColor;
                      }
                    }
                    
                    const borderColor = computed.borderColor;
                    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                      if (borderColor.includes('lab(') || borderColor.includes('lch(') || borderColor.includes('oklab(')) {
                        el.style.borderColor = '#e5e7eb';
                      } else {
                        el.style.borderColor = borderColor;
                      }
                    }
                  }
                } catch (e) {
                  // Safe fallback
                }
              }
            });
          },
        },
      })
      .from(clonedElement)
      .outputPdf('blob');

    // Create blob URL
    const url = URL.createObjectURL(pdfBlob);
    return url;
  } catch (error) {
    console.error('PDF blob generation error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate PDF preview. Please try again.'
    );
  }
}

/**
 * Export with progress callback
 * 
 * @param element - HTML element to export
 * @param filename - Output filename
 * @param options - Export options
 * @param onProgress - Progress callback (0-100)
 * @returns Promise that resolves when PDF is generated
 */
export async function exportToPDFWithProgress(
  element: HTMLElement,
  filename: string = 'document',
  options: PDFExportOptions = {},
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    onProgress?.(10);

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      image: {
        ...defaultOptions.image,
        ...options.image,
      },
      html2canvas: {
        ...defaultOptions.html2canvas,
        ...options.html2canvas,
      },
      jsPDF: {
        ...defaultOptions.jsPDF,
        ...options.jsPDF,
        format: options.format || defaultOptions.format,
        orientation: options.orientation || defaultOptions.orientation,
      },
      pagebreak: {
        ...defaultOptions.pagebreak,
        ...options.pagebreak,
      },
    };

    onProgress?.(30);

    const opt = {
      margin: mergedOptions.margin,
      filename: `${filename}.pdf`,
      image: mergedOptions.image,
      html2canvas: mergedOptions.html2canvas,
      jsPDF: mergedOptions.jsPDF,
      enableLinks: mergedOptions.enableLinks,
      pagebreak: mergedOptions.pagebreak,
    };

    onProgress?.(50);

    // Convert colors to RGB and remove unsupported color functions
    const convertColorsToRGB = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      
      if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const bgColor = computed.backgroundColor;
        if (!bgColor.includes('lab(') && !bgColor.includes('lch(') && !bgColor.includes('oklab(')) {
          el.style.backgroundColor = bgColor;
        } else {
          el.style.backgroundColor = '#ffffff';
        }
      }
      
      if (computed.color) {
        const textColor = computed.color;
        if (!textColor.includes('lab(') && !textColor.includes('lch(') && !textColor.includes('oklab(')) {
          el.style.color = textColor;
        } else {
          el.style.color = '#000000';
        }
      }
      
      if (computed.borderColor) {
        const borderColor = computed.borderColor;
        if (!borderColor.includes('lab(') && !borderColor.includes('lch(') && !borderColor.includes('oklab(')) {
          el.style.borderColor = borderColor;
        } else {
          el.style.borderColor = '#e5e7eb';
        }
      }
      
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          convertColorsToRGB(child);
        }
      });
    };

    const clonedElement = element.cloneNode(true) as HTMLElement;
    convertColorsToRGB(clonedElement);

    onProgress?.(60);

    // Generate PDF blob with aggressive onclone to fix all color issues
    const pdfBlob: Blob = await html2pdf()
      .set({
        ...opt,
        html2canvas: {
          ...opt.html2canvas,
          onclone: (clonedDoc: Document, element: HTMLElement) => {
            // Remove stylesheets with lab() colors - iterate backwards
            try {
              const stylesheets = Array.from(clonedDoc.styleSheets);
              stylesheets.forEach((sheet) => {
                try {
                  if (sheet.cssRules) {
                    const rules = Array.from(sheet.cssRules);
                    for (let i = rules.length - 1; i >= 0; i--) {
                      const rule = rules[i];
                      if (rule instanceof CSSStyleRule) {
                        const styleText = rule.style.cssText;
                        if (styleText && (
                          styleText.includes('lab(') ||
                          styleText.includes('lch(') ||
                          styleText.includes('oklab(')
                        )) {
                          try {
                            sheet.deleteRule(i);
                          } catch (e) {}
                        }
                      }
                    }
                  }
                } catch (e) {}
              });
            } catch (e) {}

            // Add global style override
            const globalStyle = clonedDoc.createElement('style');
            globalStyle.textContent = `* { color: inherit !important; background-color: inherit !important; border-color: inherit !important; }`;
            clonedDoc.head.appendChild(globalStyle);

            // Fix all elements
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                try {
                  const computed = clonedDoc.defaultView?.getComputedStyle(el);
                  if (computed) {
                    const bgColor = computed.backgroundColor;
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                      if (bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklab(')) {
                        el.style.backgroundColor = '#ffffff';
                      } else {
                        el.style.backgroundColor = bgColor;
                      }
                    }
                    
                    const textColor = computed.color;
                    if (textColor) {
                      if (textColor.includes('lab(') || textColor.includes('lch(') || textColor.includes('oklab(')) {
                        el.style.color = '#000000';
                      } else {
                        el.style.color = textColor;
                      }
                    }
                    
                    const borderColor = computed.borderColor;
                    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                      if (borderColor.includes('lab(') || borderColor.includes('lch(') || borderColor.includes('oklab(')) {
                        el.style.borderColor = '#e5e7eb';
                      } else {
                        el.style.borderColor = borderColor;
                      }
                    }
                  }
                } catch (e) {
                  // Safe fallback
                }
              }
            });
          },
        },
      })
      .from(clonedElement)
      .outputPdf('blob');

    onProgress?.(80);

    // Create download link and trigger download programmatically
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);

    onProgress?.(100);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to export PDF. Please try again.'
    );
  }
}

