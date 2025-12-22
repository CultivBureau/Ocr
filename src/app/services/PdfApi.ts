/**
 * PDF API Service
 * 
 * Provides functions for uploading PDFs, extracting structured data, and generating PDFs using Playwright.
 */

import { getToken } from "./AuthApi";
import type { SeparatedStructure } from "../types/ExtractTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    "[PdfApi] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to http://localhost:8000. " +
      "Set this in .env.local to avoid CORS mistakes when the backend runs on a different host."
  );
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      isJson && payload?.message
        ? payload.message
        : isJson && payload?.detail
        ? typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail)
        : payload || response.statusText;
    throw new Error(errorMessage || "Request failed");
  }

  return payload;
}

async function request(path: string, init: RequestInit = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    
    // Use getToken from AuthApi which reads from cookies
    const token = getToken();
    
    if (!token) {
      throw new Error("Not authenticated. Please login again.");
    }
    
    let headers: Record<string, string> = {};
    
    // Always add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Merge with any existing headers from init
    if (init.headers) {
      headers = { ...headers, ...(init.headers as Record<string, string>) };
    }
    
    // Don't set Content-Type for FormData - browser will set it with boundary automatically
    if (!(init.body instanceof FormData)) {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    } else {
      // For FormData, explicitly remove Content-Type to let browser set it with boundary
      delete headers["Content-Type"];
    }
    
    const response = await fetch(url, {
      ...init,
      mode: init.mode ?? "cors",
      headers,
      credentials: "include", // Include cookies in the request
    });
    return await handleResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[PdfApi] Network request failed for ${path}: ${message}`);
  }
}

/**
 * Upload PDF file to backend
 */
export async function uploadFile(file: File): Promise<{
  file_path: string;
  filename: string;
  original_filename: string;
  message: string;
  company_id?: string | null;
}> {
  const formData = new FormData();
  formData.append("file", file);

  // Verify token exists before making request
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated. Please login again.");
  }

  return request("/upload/", {
    method: "POST",
    body: formData,
    headers: {},
  }) as Promise<{
    file_path: string;
    filename: string;
    original_filename: string;
    message: string;
    company_id?: string | null;
  }>;
}

/**
 * Extract structured data from uploaded PDF
 * Returns v2 format: { generated: { sections, tables }, user: { elements }, layout, meta }
 */
export async function extractStructured(filePath: string): Promise<SeparatedStructure> {
  return request("/extract/structured", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_path: filePath }),
  }) as Promise<SeparatedStructure>;
}

export interface PDFGenerateRequest {
  document_id: string;
  format?: "A4" | "Letter";
  token?: string;
}

/**
 * Generate PDF using Playwright backend
 * 
 * @param documentId - Document ID to generate PDF for
 * @param format - PDF format (default: "A4")
 * @param token - Optional short-lived PDF token
 * @returns PDF blob
 */
export async function generatePDFWithPlaywright(
  documentId: string,
  format: "A4" | "Letter" = "A4",
  token?: string
): Promise<Blob> {
  const requestBody: PDFGenerateRequest = {
    document_id: documentId,
    format,
    ...(token && { token }),
  };

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  const authToken = getToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/pdf/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `PDF generation failed: ${response.status} ${errorText}`
      );
    }

    // Return PDF blob
    return await response.blob();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`[PdfApi] PDF generation failed: ${message}`);
  }
}

/**
 * Download PDF blob as file
 * 
 * @param blob - PDF blob
 * @param filename - Filename for download
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Validate JSX syntax
 * 
 * @param code - JSX code string to validate
 * @returns Validation result with isValid flag and errors array
 */
export function validateJsxSyntax(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!code || typeof code !== 'string') {
    return { isValid: false, errors: ['No code provided'] };
  }
  
  try {
    // Basic syntax checks
    const trimmedCode = code.trim();
    
    // Check for balanced brackets
    const openBrackets = (trimmedCode.match(/{/g) || []).length;
    const closeBrackets = (trimmedCode.match(/}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(`Unbalanced curly brackets: ${openBrackets} open, ${closeBrackets} close`);
    }
    
    // Check for balanced parentheses
    const openParens = (trimmedCode.match(/\(/g) || []).length;
    const closeParens = (trimmedCode.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    // Check for balanced angle brackets in JSX tags
    const openTags = (trimmedCode.match(/<[a-zA-Z]/g) || []).length;
    const closeTags = (trimmedCode.match(/<\//g) || []).length + (trimmedCode.match(/\/>/g) || []).length;
    // This is approximate - self-closing tags count as both open and close
    
    // Check for unclosed strings
    const singleQuotes = (trimmedCode.match(/'/g) || []).length;
    const doubleQuotes = (trimmedCode.match(/"/g) || []).length;
    const backticks = (trimmedCode.match(/`/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push('Unclosed single quote string');
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push('Unclosed double quote string');
    }
    if (backticks % 2 !== 0) {
      errors.push('Unclosed template literal');
    }
    
    // Check for common JSX issues
    if (trimmedCode.includes('class=') && !trimmedCode.includes('className=')) {
      errors.push('Use "className" instead of "class" in JSX');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (err) {
    return {
      isValid: false,
      errors: [err instanceof Error ? err.message : 'Unknown validation error']
    };
  }
}
