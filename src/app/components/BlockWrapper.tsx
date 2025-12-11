"use client";

import React from "react";
import type { Block, BoundingBox } from "../types/ExtractTypes";
import SectionBlock from "./SectionBlock";
import TableBlock from "./TableBlock";
import ImageBlock from "./ImageBlock";
import BlockControls from "./BlockControls";

interface BlockWrapperProps {
  block: Block;
  index?: number;
  totalBlocks?: number;
  editable?: boolean;
  debugMode?: boolean;
  onEdit?: (block: Block) => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  className?: string;
}

/**
 * Block Wrapper Component
 * Wraps any block (section, table, image) with controls and styling
 */
export default function BlockWrapper({
  block,
  index = 0,
  totalBlocks = 0,
  editable = false,
  debugMode = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  className = "",
}: BlockWrapperProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(block);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to delete this ${block.type}?`)) {
      onDelete(block.id);
    }
  };

  const handleMoveUp = () => {
    if (onMoveUp && index > 0) {
      onMoveUp(index);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown && index < totalBlocks - 1) {
      onMoveDown(index);
    }
  };

  // Render block based on type
  const renderBlock = () => {
    switch (block.type) {
      case "section":
        return (
          <SectionBlock
            section={block.data as any}
            className={className}
            debugMode={debugMode}
            editable={editable}
            onEdit={editable ? handleEdit : undefined}
          />
        );
      case "table":
        return (
          <TableBlock
            data={block.data as any}
            bbox={block.bbox}
            page={block.page}
            className={className}
            debugMode={debugMode}
            editable={editable}
            onEdit={editable ? handleEdit : undefined}
          />
        );
      case "image":
        return (
          <ImageBlock
            data={block.data as any}
            bbox={block.bbox}
            page={block.page}
            className={className}
            debugMode={debugMode}
            editable={editable}
            onEdit={editable ? handleEdit : undefined}
          />
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded border border-gray-300">
            Unknown block type: {(block as any).type}
          </div>
        );
    }
  };

  return (
    <div
      className="block-wrapper relative group"
      data-block-id={block.id}
      data-block-type={block.type}
      data-block-page={block.page}
    >
      {/* Controls */}
      {editable && (
        <BlockControls
          block={block}
          index={index}
          totalBlocks={totalBlocks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      )}

      {/* Block Content */}
      <div className="block-content">
        {renderBlock()}
      </div>

      {/* Debug Overlay */}
      {debugMode && block.bbox && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 opacity-30" />
      )}
    </div>
  );
}

