/**
 * Code Slice - State management for JSX code
 * Phase 4: JSX Code Generation Preview
 */

export interface CodeState {
  // Code content
  jsxCode: string;
  originalCode: string; // Original code from GPT (for reset)
  
  // Code metadata
  componentName: string | null;
  imports: string[];
  usedComponents: string[];
  props: string[];
  
  // Validation
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Editing state
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  
  // Preview state
  previewMode: "code" | "preview" | "split";
  previewError: string | null;
  
  // Generation metadata
  generatedAt: Date | null;
  generationMetadata: Record<string, any> | null;
}

export const initialCodeState: CodeState = {
  jsxCode: "",
  originalCode: "",
  componentName: null,
  imports: [],
  usedComponents: [],
  props: [],
  isValid: true,
  errors: [],
  warnings: [],
  isEditing: false,
  hasUnsavedChanges: false,
  lastSaved: null,
  previewMode: "split",
  previewError: null,
  generatedAt: null,
  generationMetadata: null,
};

// Action types
export type CodeAction =
  | { type: "SET_CODE"; payload: string }
  | { type: "UPDATE_CODE"; payload: string }
  | { type: "SET_ORIGINAL_CODE"; payload: string }
  | { type: "RESET_TO_ORIGINAL" }
  | { type: "SET_COMPONENT_NAME"; payload: string | null }
  | { type: "SET_IMPORTS"; payload: string[] }
  | { type: "SET_USED_COMPONENTS"; payload: string[] }
  | { type: "SET_PROPS"; payload: string[] }
  | { type: "SET_VALIDATION"; payload: { isValid: boolean; errors: string[]; warnings: string[] } }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_UNSAVED_CHANGES"; payload: boolean }
  | { type: "MARK_SAVED" }
  | { type: "SET_PREVIEW_MODE"; payload: "code" | "preview" | "split" }
  | { type: "SET_PREVIEW_ERROR"; payload: string | null }
  | { type: "SET_GENERATION_METADATA"; payload: { generatedAt: Date; metadata: Record<string, any> } }
  | { type: "RESET" };

// Reducer
export function codeReducer(state: CodeState, action: CodeAction): CodeState {
  switch (action.type) {
    case "SET_CODE":
      return {
        ...state,
        jsxCode: action.payload,
        hasUnsavedChanges: action.payload !== state.originalCode,
      };

    case "UPDATE_CODE":
      return {
        ...state,
        jsxCode: action.payload,
        hasUnsavedChanges: action.payload !== state.originalCode,
        isEditing: true,
      };

    case "SET_ORIGINAL_CODE":
      return {
        ...state,
        originalCode: action.payload,
        jsxCode: action.payload,
        hasUnsavedChanges: false,
      };

    case "RESET_TO_ORIGINAL":
      return {
        ...state,
        jsxCode: state.originalCode,
        hasUnsavedChanges: false,
      };

    case "SET_COMPONENT_NAME":
      return {
        ...state,
        componentName: action.payload,
      };

    case "SET_IMPORTS":
      return {
        ...state,
        imports: action.payload,
      };

    case "SET_USED_COMPONENTS":
      return {
        ...state,
        usedComponents: action.payload,
      };

    case "SET_PROPS":
      return {
        ...state,
        props: action.payload,
      };

    case "SET_VALIDATION":
      return {
        ...state,
        isValid: action.payload.isValid,
        errors: action.payload.errors,
        warnings: action.payload.warnings,
      };

    case "SET_EDITING":
      return {
        ...state,
        isEditing: action.payload,
      };

    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };

    case "MARK_SAVED":
      return {
        ...state,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        isEditing: false,
      };

    case "SET_PREVIEW_MODE":
      return {
        ...state,
        previewMode: action.payload,
      };

    case "SET_PREVIEW_ERROR":
      return {
        ...state,
        previewError: action.payload,
      };

    case "SET_GENERATION_METADATA":
      return {
        ...state,
        generatedAt: action.payload.generatedAt,
        generationMetadata: action.payload.metadata,
      };

    case "RESET":
      return initialCodeState;

    default:
      return state;
  }
}

