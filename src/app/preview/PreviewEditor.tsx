"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import CodeEditor from "@/app/components/CodeEditor";
import PreviewRenderer from "@/app/components/PreviewRenderer";
import ToggleSwitch from "@/app/components/ToggleSwitch";
import { useReducer } from "react";
import { codeReducer, initialCodeState } from "@/app/Store/codeSlice";
import {
  extractComponentName,
  extractImports,
  extractUsedComponents,
  extractProps,
  validateJSXStructure,
  cleanJSXCode,
} from "@/app/utils/parseGptCode";
import { validateJsxSyntax } from "@/app/services/PdfApi";

type PreviewMode = "code" | "preview" | "split";

interface PreviewEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onSave?: (code: string) => void;
  showToolbar?: boolean;
}

/**
 * Preview Editor Component
 * Phase 4: JSX Code Generation Preview
 * 
 * Features:
 * - Code editor with syntax highlighting
 * - Live preview
 * - Split view
 * - Code validation
 */
export default function PreviewEditor({
  initialCode = "",
  onCodeChange,
  onSave,
  showToolbar = true,
}: PreviewEditorProps) {
  const [state, dispatch] = useReducer(codeReducer, initialCodeState);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Initialize code
  useEffect(() => {
    if (initialCode) {
      const cleanedCode = cleanJSXCode(initialCode);
      dispatch({ type: "SET_ORIGINAL_CODE", payload: cleanedCode });
      
      // Extract metadata
      const componentName = extractComponentName(cleanedCode);
      const imports = extractImports(cleanedCode);
      const usedComponents = extractUsedComponents(cleanedCode);
      const props = extractProps(cleanedCode);
      
      dispatch({ type: "SET_COMPONENT_NAME", payload: componentName });
      dispatch({ type: "SET_IMPORTS", payload: imports });
      dispatch({ type: "SET_USED_COMPONENTS", payload: usedComponents });
      dispatch({ type: "SET_PROPS", payload: props });
    }
  }, [initialCode]);

  // Validate code when it changes
  useEffect(() => {
    if (!state.jsxCode) return;

    setIsValidating(true);
    
    // Basic syntax validation
    const syntaxValidation = validateJsxSyntax(state.jsxCode) as { isValid: boolean; errors: string[] };
    
    // Structure validation
    const structureValidation = validateJSXStructure(state.jsxCode);
    
    // Combine validations
    const isValid = syntaxValidation.isValid && structureValidation.isValid;
    const errors = [...syntaxValidation.errors, ...structureValidation.errors];
    const warnings = structureValidation.warnings;

    dispatch({
      type: "SET_VALIDATION",
      payload: { isValid, errors, warnings },
    });

    setIsValidating(false);
  }, [state.jsxCode]);

  // Notify parent of code changes
  useEffect(() => {
    if (onCodeChange && state.jsxCode) {
      onCodeChange(state.jsxCode);
    }
  }, [state.jsxCode, onCodeChange]);

  const handleCodeChange = useCallback((newCode: string) => {
    dispatch({ type: "UPDATE_CODE", payload: newCode });
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(state.jsxCode);
    }
    dispatch({ type: "MARK_SAVED" });
  }, [state.jsxCode, onSave]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_TO_ORIGINAL" });
  }, []);

  const handleModeChange = useCallback((mode: PreviewMode) => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: mode });
  }, []);

  const setValue = useCallback((id: string, v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }));
  }, []);

  // Render based on mode
  const renderContent = () => {
    if (state.previewMode === "code") {
      return (
        <div className="h-full">
          <CodeEditor code={state.jsxCode} onChange={handleCodeChange} />
        </div>
      );
    }

    if (state.previewMode === "preview") {
      return (
        <div className="h-full overflow-auto bg-white p-8">
          <div className="preview-content max-w-full">
            <PreviewRenderer code={state.jsxCode} values={values} setValue={setValue} />
          </div>
        </div>
      );
    }

    // Split view
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="border-r border-gray-200 pr-4">
          <CodeEditor code={state.jsxCode} onChange={handleCodeChange} />
        </div>
        <div className="overflow-auto bg-white p-8">
          <div className="preview-content max-w-full">
            <PreviewRenderer code={state.jsxCode} values={values} setValue={setValue} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="preview-editor h-full flex flex-col">
      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm text-gray-300 font-mono">
              {state.componentName || "template"}.jsx
            </span>
            {state.hasUnsavedChanges && (
              <span className="text-xs text-yellow-400">● غير محفوظ</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Validation Status */}
            {isValidating ? (
              <span className="text-xs text-gray-400">جاري التحقق...</span>
            ) : state.isValid ? (
              <span className="text-xs text-green-400">✓ صحيح</span>
            ) : (
              <span className="text-xs text-red-400">✗ أخطاء</span>
            )}

            {/* Mode Toggle */}
            <ToggleSwitch
              mode={state.previewMode === "preview" ? "preview" : "code"}
              onChange={(next: "code" | "preview" | "split") => handleModeChange(next === "preview" ? "preview" : "code")}
            />

            {/* Action Buttons */}
            <button
              onClick={handleSave}
              disabled={!state.hasUnsavedChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              حفظ
            </button>
            <button
              onClick={handleReset}
              disabled={!state.hasUnsavedChanges}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {state.errors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <h3 className="text-sm font-semibold text-red-900 mb-1">أخطاء:</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {state.errors.map((error: string, index: number) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {state.warnings.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">تحذيرات:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {state.warnings.map((warning: string, index: number) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>

      {/* Preview Error */}
      {state.previewError && (
        <div className="bg-red-50 border-t border-red-200 px-6 py-3">
          <p className="text-sm text-red-700">{state.previewError}</p>
        </div>
      )}
    </div>
  );
}

