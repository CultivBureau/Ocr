/**
 * Extract Slice - State management for PDF extraction
 * Using a simple state pattern (can be replaced with Redux/Zustand later)
 */

import type { Section, Table, Structure } from "@/app/types/ExtractTypes";

export interface ExtractState {
  // Upload state
  filePath: string | null;
  filename: string | null;
  originalFilename: string | null;
  isUploading: boolean;
  uploadError: string | null;

  // Extract state - Phase 3: Receiving Extracted Data
  sections: Section[];
  tables: Table[];
  structure: Structure | null; // Complete structure JSON
  meta: Record<string, any> | null;
  isExtracting: boolean;
  extractError: string | null;

  // Component mapping for rendering
  sectionMap: Map<string, Section>; // Map section ID to Section
  tableMap: Map<string, Table>; // Map table ID to Table

  // Processing state
  isProcessing: boolean;
  processingStep: string | null;
}

export const initialExtractState: ExtractState = {
  filePath: null,
  filename: null,
  originalFilename: null,
  isUploading: false,
  uploadError: null,
  sections: [],
  tables: [],
  structure: null,
  meta: null,
  isExtracting: false,
  extractError: null,
  sectionMap: new Map(),
  tableMap: new Map(),
  isProcessing: false,
  processingStep: null,
};

// Action types
export type ExtractAction =
  | { type: "UPLOAD_START" }
  | { type: "UPLOAD_SUCCESS"; payload: { file_path: string; filename: string; original_filename: string } }
  | { type: "UPLOAD_ERROR"; payload: string }
  | { type: "EXTRACT_START" }
  | { type: "EXTRACT_SUCCESS"; payload: { sections: Section[]; tables: Table[]; meta: Record<string, any> } }
  | { type: "SET_STRUCTURE"; payload: Structure }
  | { type: "UPDATE_SECTION"; payload: { id: string; section: Section } }
  | { type: "UPDATE_TABLE"; payload: { id: string; table: Table } }
  | { type: "EXTRACT_ERROR"; payload: string }
  | { type: "SET_PROCESSING"; payload: { isProcessing: boolean; step: string | null } }
  | { type: "RESET" };

// Reducer
export function extractReducer(state: ExtractState, action: ExtractAction): ExtractState {
  switch (action.type) {
    case "UPLOAD_START":
      return {
        ...state,
        isUploading: true,
        uploadError: null,
      };

    case "UPLOAD_SUCCESS":
      return {
        ...state,
        isUploading: false,
        filePath: action.payload.file_path,
        filename: action.payload.filename,
        originalFilename: action.payload.original_filename,
        uploadError: null,
      };

    case "UPLOAD_ERROR":
      return {
        ...state,
        isUploading: false,
        uploadError: action.payload,
      };

    case "EXTRACT_START":
      return {
        ...state,
        isExtracting: true,
        extractError: null,
      };

    case "EXTRACT_SUCCESS":
      // Create maps for quick lookup
      const sectionMap = new Map<string, Section>();
      const tableMap = new Map<string, Table>();
      
      action.payload.sections.forEach((section) => {
        sectionMap.set(section.id, section);
      });
      
      action.payload.tables.forEach((table) => {
        tableMap.set(table.id, table);
      });
      
      // Create complete structure
      const structure: Structure = {
        sections: action.payload.sections,
        tables: action.payload.tables,
        meta: action.payload.meta,
      };
      
      return {
        ...state,
        isExtracting: false,
        sections: action.payload.sections,
        tables: action.payload.tables,
        structure,
        meta: action.payload.meta,
        sectionMap,
        tableMap,
        extractError: null,
      };

    case "SET_STRUCTURE":
      const newSectionMap = new Map<string, Section>();
      const newTableMap = new Map<string, Table>();
      
      action.payload.sections.forEach((section: Section) => {
        newSectionMap.set(section.id, section);
      });
      
      action.payload.tables.forEach((table: Table) => {
        newTableMap.set(table.id, table);
      });
      
      return {
        ...state,
        structure: action.payload,
        sections: action.payload.sections,
        tables: action.payload.tables,
        meta: action.payload.meta,
        sectionMap: newSectionMap,
        tableMap: newTableMap,
      };

    case "UPDATE_SECTION":
      const updatedSections = state.sections.map((s) =>
        s.id === action.payload.id ? action.payload.section : s
      );
      const updatedSectionMap = new Map(state.sectionMap);
      updatedSectionMap.set(action.payload.id, action.payload.section);
      
      return {
        ...state,
        sections: updatedSections,
        sectionMap: updatedSectionMap,
        structure: state.structure
          ? {
              ...state.structure,
              sections: updatedSections,
            }
          : null,
      };

    case "UPDATE_TABLE":
      const updatedTables = state.tables.map((t) =>
        t.id === action.payload.id ? action.payload.table : t
      );
      const updatedTableMap = new Map(state.tableMap);
      updatedTableMap.set(action.payload.id, action.payload.table);
      
      return {
        ...state,
        tables: updatedTables,
        tableMap: updatedTableMap,
        structure: state.structure
          ? {
              ...state.structure,
              tables: updatedTables,
            }
          : null,
      };

    case "EXTRACT_ERROR":
      return {
        ...state,
        isExtracting: false,
        extractError: action.payload,
      };

    case "SET_PROCESSING":
      return {
        ...state,
        isProcessing: action.payload.isProcessing,
        processingStep: action.payload.step,
      };

    case "RESET":
      return initialExtractState;

    default:
      return state;
  }
}

