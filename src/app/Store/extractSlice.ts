/**
 * Extract Slice - State management for PDF extraction
 * Using a simple state pattern (can be replaced with Redux/Zustand later)
 */

import type { Section, Table, Structure, UserElement, SeparatedStructure } from "@/app/types/ExtractTypes";
import { migrateToSeparatedStructure, isSeparatedStructure, isLegacyStructure } from "@/app/utils/structureMigration";
import { guardGeneratedContent } from "@/app/utils/contentGuards";

export interface ExtractState {
  // Upload state
  filePath: string | null;
  filename: string | null;
  originalFilename: string | null;
  isUploading: boolean;
  uploadError: string | null;

  // New separated structure (v2)
  generatedElements: {
    sections: Section[];
    tables: Table[];
  };
  userElements: UserElement[];
  layoutOrder: string[];

  // Legacy structure support (deprecated, kept for backward compatibility)
  sections: Section[];
  tables: Table[];
  structure: Structure | null; // Complete structure JSON (legacy)
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
  generatedElements: {
    sections: [],
    tables: []
  },
  userElements: [],
  layoutOrder: [],
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
  | { type: "SET_STRUCTURE"; payload: Structure | SeparatedStructure }
  | { type: "SET_SEPARATED_STRUCTURE"; payload: SeparatedStructure }
  | { type: "ADD_USER_ELEMENT"; payload: UserElement }
  | { type: "UPDATE_USER_ELEMENT"; payload: { id: string; element: UserElement } }
  | { type: "DELETE_USER_ELEMENT"; payload: string }
  | { type: "REORDER_LAYOUT"; payload: string[] }
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
      
      // Build separated structure from extracted data
      // Extract success returns sections/tables that should be treated as generated
      const generatedSections = action.payload.sections;
      const generatedTables = action.payload.tables;
      const layoutOrder = [
        ...generatedSections.map(s => s.id),
        ...generatedTables.map(t => t.id)
      ];
      
      // Create legacy structure for backward compatibility
      const structure: Structure = {
        sections: action.payload.sections,
        tables: action.payload.tables,
        meta: action.payload.meta,
      };
      
      return {
        ...state,
        isExtracting: false,
        generatedElements: {
          sections: generatedSections,
          tables: generatedTables
        },
        userElements: [],
        layoutOrder,
        sections: action.payload.sections,
        tables: action.payload.tables,
        structure,
        meta: action.payload.meta,
        sectionMap,
        tableMap,
        extractError: null,
      };

    case "SET_STRUCTURE":
      // Handle both new (SeparatedStructure) and old (Structure) formats
      let separatedStruct: SeparatedStructure;
      
      if (isSeparatedStructure(action.payload)) {
        // Already in new format
        separatedStruct = action.payload;
      } else if (isLegacyStructure(action.payload)) {
        // Migrate from old format
        separatedStruct = migrateToSeparatedStructure(action.payload);
      } else {
        // Fallback: try to extract what we can
        separatedStruct = {
          generated: { sections: [], tables: [] },
          user: { elements: [] },
          layout: [],
          meta: (action.payload as any).meta || {}
        };
      }
      
      const newSectionMap = new Map<string, Section>();
      const newTableMap = new Map<string, Table>();
      
      separatedStruct.generated.sections.forEach((section: Section) => {
        newSectionMap.set(section.id, section);
      });
      
      separatedStruct.generated.tables.forEach((table: Table) => {
        newTableMap.set(table.id, table);
      });
      
      // Build legacy structure for backward compatibility
      const legacyStructure: Structure = {
        sections: separatedStruct.generated.sections,
        tables: separatedStruct.generated.tables,
        meta: separatedStruct.meta
      };
      
      return {
        ...state,
        generatedElements: separatedStruct.generated,
        userElements: separatedStruct.user.elements,
        layoutOrder: separatedStruct.layout,
        structure: legacyStructure,
        sections: separatedStruct.generated.sections,
        tables: separatedStruct.generated.tables,
        meta: separatedStruct.meta,
        sectionMap: newSectionMap,
        tableMap: newTableMap,
      };
    
    case "SET_SEPARATED_STRUCTURE":
      const sepSectionMap = new Map<string, Section>();
      const sepTableMap = new Map<string, Table>();
      
      action.payload.generated.sections.forEach((section: Section) => {
        sepSectionMap.set(section.id, section);
      });
      
      action.payload.generated.tables.forEach((table: Table) => {
        sepTableMap.set(table.id, table);
      });
      
      // Build legacy structure for backward compatibility
      const legacyStruct: Structure = {
        sections: action.payload.generated.sections,
        tables: action.payload.generated.tables,
        meta: action.payload.meta
      };
      
      return {
        ...state,
        generatedElements: action.payload.generated,
        userElements: action.payload.user.elements,
        layoutOrder: action.payload.layout,
        structure: legacyStruct,
        sections: action.payload.generated.sections,
        tables: action.payload.generated.tables,
        meta: action.payload.meta,
        sectionMap: sepSectionMap,
        tableMap: sepTableMap,
      };
    
    case "ADD_USER_ELEMENT":
      return {
        ...state,
        userElements: [...state.userElements, action.payload],
        layoutOrder: [...state.layoutOrder, action.payload.id],
      };
    
    case "UPDATE_USER_ELEMENT":
      return {
        ...state,
        userElements: state.userElements.map(el =>
          el.id === action.payload.id ? action.payload.element : el
        ),
      };
    
    case "DELETE_USER_ELEMENT":
      // Guard: Cannot delete generated content
      guardGeneratedContent(action.payload, "delete");
      
      return {
        ...state,
        userElements: state.userElements.filter(el => el.id !== action.payload),
        layoutOrder: state.layoutOrder.filter(id => id !== action.payload),
      };
    
    case "REORDER_LAYOUT":
      return {
        ...state,
        layoutOrder: action.payload,
      };

    case "UPDATE_SECTION":
      // Guard: Cannot update generated content
      guardGeneratedContent(action.payload.id, "update");
      
      const updatedSections = state.sections.map((s) =>
        s.id === action.payload.id ? action.payload.section : s
      );
      const updatedGeneratedSections = state.generatedElements.sections.map((s) =>
        s.id === action.payload.id ? action.payload.section : s
      );
      const updatedSectionMap = new Map(state.sectionMap);
      updatedSectionMap.set(action.payload.id, action.payload.section);
      
      return {
        ...state,
        generatedElements: {
          ...state.generatedElements,
          sections: updatedGeneratedSections
        },
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
      // Guard: Cannot update generated content
      guardGeneratedContent(action.payload.id, "update");
      
      const updatedTables = state.tables.map((t) =>
        t.id === action.payload.id ? action.payload.table : t
      );
      const updatedGeneratedTables = state.generatedElements.tables.map((t) =>
        t.id === action.payload.id ? action.payload.table : t
      );
      const updatedTableMap = new Map(state.tableMap);
      updatedTableMap.set(action.payload.id, action.payload.table);
      
      return {
        ...state,
        generatedElements: {
          ...state.generatedElements,
          tables: updatedGeneratedTables
        },
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

