"use client";

import React from "react";
import type { Block, Page } from "@/app/types/ExtractTypes";
import BlockWrapper from "@/app/components/BlockWrapper";
import { sortBlocksByLayout } from "@/app/utils/mapJsonToBlocks";

interface LayoutRendererProps {
  blocks: Block[];
  pages?: Page[];
  viewMode?: "flat" | "pages";
  editable?: boolean;
  debugMode?: boolean;
  onEdit?: (block: Block) => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

/**
 * Layout Renderer Component
 * Renders blocks sorted by layout position
 */
export default function LayoutRenderer({
  blocks,
  pages,
  viewMode = "flat",
  editable = false,
  debugMode = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: LayoutRendererProps) {
  // Sort blocks by layout if not already sorted
  const sortedBlocks = sortBlocksByLayout(blocks);

  // Render by pages if pages data is available and viewMode is "pages"
  if (viewMode === "pages" && pages && pages.length > 0) {
    return (
      <div className="layout-renderer pages-view">
        {pages.map((page) => (
          <div
            key={page.page_number}
            className="page-container mb-8 pb-8 border-b border-gray-300 last:border-b-0"
          >
            <div className="page-header mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Page {page.page_number}
              </h2>
              <p className="text-sm text-gray-500">
                {page.elements.length} element(s)
              </p>
            </div>
            <div className="page-elements">
              {page.elements.map((element, index) => {
                // Find corresponding block
                const block = sortedBlocks.find((b) => b.id === element.id);
                if (!block) return null;

                const blockIndex = sortedBlocks.findIndex((b) => b.id === element.id);
                return (
                  <BlockWrapper
                    key={block.id}
                    block={block}
                    index={blockIndex}
                    totalBlocks={sortedBlocks.length}
                    editable={editable}
                    debugMode={debugMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Flat view - render all blocks in order
  return (
    <div className="layout-renderer flat-view">
      {sortedBlocks.map((block, index) => (
        <BlockWrapper
          key={block.id}
          block={block}
          index={index}
          totalBlocks={sortedBlocks.length}
          editable={editable}
          debugMode={debugMode}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
      {sortedBlocks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No blocks to display
        </div>
      )}
    </div>
  );
}

