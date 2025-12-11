"use client";

import React, { useState } from "react";
import type { ExtractResponse, Block } from "../types/ExtractTypes";

interface DebugViewerProps {
  data: ExtractResponse;
  blocks?: Block[];
  onElementHover?: (elementId: string | null) => void;
  highlightedElementId?: string | null;
}

/**
 * Debug Viewer Component
 * Displays JSON structure with bbox info and sorting order
 */
export default function DebugViewer({
  data,
  blocks = [],
  onElementHover,
  highlightedElementId,
}: DebugViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"json" | "blocks" | "stats">("json");

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const renderJsonValue = (value: any, depth: number = 0): React.ReactNode => {
    if (value === null) {
      return <span className="text-gray-400">null</span>;
    }
    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>;
    }
    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }
    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">[]</span>;
      }
      const key = `array-${depth}-${value.length}`;
      const isExpanded = expandedSections.has(key);
      return (
        <div className="ml-4">
          <button
            onClick={() => toggleSection(key)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "▼" : "▶"} Array ({value.length})
          </button>
          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 pl-2">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500">[{index}]:</span> {renderJsonValue(item, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-400">{`{}`}</span>;
      }
      const key = `obj-${depth}-${keys[0]}`;
      const isExpanded = expandedSections.has(key);
      return (
        <div className="ml-4">
          <button
            onClick={() => toggleSection(key)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "▼" : "▶"} Object ({keys.length} keys)
          </button>
          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 pl-2">
              {keys.map((k) => (
                <div key={k} className="my-1">
                  <span className="text-orange-600 font-mono">"{k}":</span> {renderJsonValue(value[k], depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  const renderStats = () => {
    const stats = {
      sections: data.sections?.length || 0,
      tables: data.tables?.length || 0,
      images: data.images?.length || 0,
      pages: data.pages?.length || 0,
      elements: data.elements?.length || blocks.length || 0,
      blocks: blocks.length,
      hasLayoutInfo: data.meta?.has_layout_info || false,
    };

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Extraction Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.sections}</div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.tables}</div>
            <div className="text-sm text-gray-600">Tables</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{stats.images}</div>
            <div className="text-sm text-gray-600">Images</div>
          </div>
          <div className="p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{stats.pages}</div>
            <div className="text-sm text-gray-600">Pages</div>
          </div>
          <div className="p-4 bg-indigo-50 rounded">
            <div className="text-2xl font-bold text-indigo-600">{stats.elements}</div>
            <div className="text-sm text-gray-600">Elements</div>
          </div>
          <div className="p-4 bg-pink-50 rounded">
            <div className="text-2xl font-bold text-pink-600">{stats.blocks}</div>
            <div className="text-sm text-gray-600">Blocks</div>
          </div>
        </div>
        <div className="mt-4">
          <div className={`p-4 rounded ${stats.hasLayoutInfo ? "bg-green-50" : "bg-gray-50"}`}>
            <div className="font-semibold">Layout Info:</div>
            <div className={stats.hasLayoutInfo ? "text-green-600" : "text-gray-600"}>
              {stats.hasLayoutInfo ? "✓ Available" : "✗ Not available"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlocks = () => {
    return (
      <div className="space-y-2">
        <h3 className="text-xl font-bold mb-4">Blocks ({blocks.length})</h3>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`p-4 border rounded cursor-pointer transition-colors ${
              highlightedElementId === block.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onMouseEnter={() => onElementHover?.(block.id)}
            onMouseLeave={() => onElementHover?.(null)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold">
                  [{index}] {block.type} - {block.id}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>Page: {block.page}</div>
                  {block.bbox && (
                    <div>
                      BBox: [{block.bbox[0]}, {block.bbox[1]}, {block.bbox[2]}, {block.bbox[3]}]
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {block.type.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="debug-viewer min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug Viewer</h1>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("json")}
              className={`px-4 py-2 rounded ${
                viewMode === "json"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              JSON Structure
            </button>
            <button
              onClick={() => setViewMode("blocks")}
              className={`px-4 py-2 rounded ${
                viewMode === "blocks"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Blocks List
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`px-4 py-2 rounded ${
                viewMode === "stats"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {viewMode === "json" && (
            <div className="font-mono text-sm">
              <pre className="whitespace-pre-wrap overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
          {viewMode === "blocks" && renderBlocks()}
          {viewMode === "stats" && renderStats()}
        </div>
      </div>
    </div>
  );
}

