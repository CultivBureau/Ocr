"use client";

import React from "react";
import type { Block } from "../types/ExtractTypes";

interface BlockControlsProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/**
 * Block Controls Component
 * Provides edit, delete, and reorder controls for blocks
 */
export default function BlockControls({
  block,
  index,
  totalBlocks,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: BlockControlsProps) {
  return (
    <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-1 bg-white rounded-lg shadow-lg border border-gray-300 p-1">
        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Move Up Button */}
        {onMoveUp && index > 0 && (
          <button
            onClick={onMoveUp}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}

        {/* Move Down Button */}
        {onMoveDown && index < totalBlocks - 1 && (
          <button
            onClick={onMoveDown}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

