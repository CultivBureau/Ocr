/**
 * Type definitions for PDF extraction and processing
 */

// Bounding box type: [x0, y0, x1, y1]
export type BoundingBox = [number, number, number, number];

export interface Section {
  type: "section";
  id: string;
  title: string;
  content: string;
  order: number;
  parent_id: string | null;
  // Layout-based fields
  bbox?: BoundingBox;
  direction?: "LTR" | "RTL";
  page?: number;
  font_size?: number;
}

// Union type for all elements
export type Element = Section | Table | Image;

// Page structure with elements
export interface Page {
  page_number: number;
  elements: Element[];
}

export interface Structure {
  sections: Section[];
  tables: Table[];
  images?: Image[];
  pages?: Page[];
  elements?: Element[]; // Sorted flat list
  meta: {
    generated_at?: string;
    sections_count?: number;
    tables_count?: number;
    images_count?: number;
    pages_count?: number;
    has_layout_info?: boolean;
    [key: string]: any;
  };
}

export interface UploadResponse {
  message: string;
  file_path: string;
  filename: string;
  original_filename: string;
}

export interface Image {
  type: "image";
  id: string;
  src: string; // base64 data URL (data:image/png;base64,...)
  bbox: BoundingBox;
  page: number;
  width: number;
  height: number;
  section_id?: string | null;
  // Legacy fields (optional for backward compatibility)
  path?: string;
  format?: string;
  size_bytes?: number;
}

export interface ExtractResponse {
  sections: Section[];
  tables: Table[];
  images?: Image[];
  pages?: Page[];
  elements?: Element[]; // Sorted flat list from backend
  meta: {
    sections_count?: number;
    tables_count?: number;
    images_count?: number;
    pages_count?: number;
    has_layout_info?: boolean;
    [key: string]: any;
  };
}

// Block format for frontend rendering
export interface Block {
  id: string;
  type: "section" | "table" | "image";
  page: number;
  bbox?: BoundingBox;
  data: Section | Table | Image;
}

export interface CleanStructureResponse extends ExtractResponse {
  meta: {
    improvements?: string[];
    original_sections_count?: number;
    cleaned_sections_count?: number;
    claude_processed_at?: string;
    claude_model?: string;
    [key: string]: any;
  };
}

export interface GenerateJSXResponse {
  jsxCode: string;
  componentsUsed: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

export interface FixJSXResponse {
  fixedCode: string;
  explanation: string;
  errors: string[];
  warnings: string[];
  changes: Array<{
    type: string;
    description: string;
    line: number;
  }>;
  metadata: Record<string, any>;
}

