"use client";

import React, { useState, useEffect } from "react";
import LayoutRenderer from "./LayoutRenderer";
import type { Block, ExtractResponse } from "@/app/types/ExtractTypes";
import { mapJsonToBlocks } from "@/app/utils/mapJsonToBlocks";
import { moveBlockUp, moveBlockDown, deleteBlock } from "@/app/utils/blockManipulator";

/**
 * Layout Preview Page
 * Displays extracted blocks sorted by layout position
 */
export default function LayoutPreviewPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"flat" | "pages">("flat");
  const [editMode, setEditMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Load blocks from sessionStorage or extract state
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try to load from sessionStorage
      const extractedDataStr = sessionStorage.getItem("extract.data");
      if (extractedDataStr) {
        try {
          const extractedData: ExtractResponse = JSON.parse(extractedDataStr);
          const mappedBlocks = mapJsonToBlocks(extractedData);
          setBlocks(mappedBlocks);
          if (extractedData.pages) {
            setPages(extractedData.pages);
          }
        } catch (error) {
          console.error("Error loading blocks:", error);
        }
      }
    }
  }, []);

  const handleEdit = (block: Block) => {
    // TODO: Implement edit modal/dialog
    console.log("Edit block:", block);
  };

  const handleDelete = (blockId: string) => {
    const updatedBlocks = deleteBlock(blocks, blockId);
    setBlocks(updatedBlocks);
    // Update sessionStorage
    if (typeof window !== "undefined") {
      const extractedDataStr = sessionStorage.getItem("extract.data");
      if (extractedDataStr) {
        try {
          const extractedData: ExtractResponse = JSON.parse(extractedDataStr);
          // Remove block from elements if present
          if (extractedData.elements) {
            extractedData.elements = extractedData.elements.filter(
              (el) => el.id !== blockId
            );
          }
          // Also remove from sections/tables/images
          if (extractedData.sections) {
            extractedData.sections = extractedData.sections.filter(
              (s) => s.id !== blockId
            );
          }
          if (extractedData.tables) {
            extractedData.tables = extractedData.tables.filter(
              (t) => t.id !== blockId
            );
          }
          if (extractedData.images) {
            extractedData.images = extractedData.images.filter(
              (img) => img.id !== blockId
            );
          }
          sessionStorage.setItem("extract.data", JSON.stringify(extractedData));
        } catch (error) {
          console.error("Error updating sessionStorage:", error);
        }
      }
    }
  };

  const handleMoveUp = (index: number) => {
    const updatedBlocks = moveBlockUp(blocks, index);
    setBlocks(updatedBlocks);
  };

  const handleMoveDown = (index: number) => {
    const updatedBlocks = moveBlockDown(blocks, index);
    setBlocks(updatedBlocks);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Layout Preview
          </h1>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "flat"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Flat
              </button>
              <button
                onClick={() => setViewMode("pages")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "pages"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                By Pages
              </button>
            </div>

            {/* Edit Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Edit Mode:</label>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editMode
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {editMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Debug Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Debug:</label>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  debugMode
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {debugMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Stats */}
            <div className="ml-auto text-sm text-gray-600">
              <span className="font-medium">{blocks.length}</span> blocks
              {pages.length > 0 && (
                <> across <span className="font-medium">{pages.length}</span> pages</>
              )}
            </div>
          </div>
        </div>

        {/* Layout Renderer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LayoutRenderer
            blocks={blocks}
            pages={pages}
            viewMode={viewMode}
            editable={editMode}
            debugMode={debugMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>
      </div>
    </div>
  );
}

