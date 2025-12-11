"use client";

import React, { useState, useEffect } from "react";
import DebugViewer from "@/app/components/DebugViewer";
import type { ExtractResponse, Block } from "@/app/types/ExtractTypes";
import { mapJsonToBlocks } from "@/app/utils/mapJsonToBlocks";

/**
 * Debug Page
 * Displays extracted data in debug mode for inspection
 */
export default function DebugPage() {
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const extractedDataStr = sessionStorage.getItem("extract.data");
      if (extractedDataStr) {
        try {
          const extractedData: ExtractResponse = JSON.parse(extractedDataStr);
          setData(extractedData);
          
          // Map to blocks
          const mappedBlocks = mapJsonToBlocks(extractedData);
          setBlocks(mappedBlocks);
        } catch (error) {
          console.error("Error loading debug data:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading debug data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">No extraction data found</div>
          <div className="text-sm text-gray-500">
            Please extract a PDF first to view debug information.
          </div>
        </div>
      </div>
    );
  }

  return (
    <DebugViewer
      data={data}
      blocks={blocks}
      onElementHover={setHighlightedElementId}
      highlightedElementId={highlightedElementId}
    />
  );
}

