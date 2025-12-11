"use client";

import React from "react";
import Image from "next/image";
import type { Image as ImageType } from "../types/ExtractTypes";

interface ImageBlockProps {
  data: ImageType;
  bbox?: [number, number, number, number];
  page: number;
  className?: string;
  editable?: boolean;
  onEdit?: (image: ImageType) => void;
  debugMode?: boolean;
}

/**
 * Image Block Component
 * Displays an image with optional bbox visualization
 */
export default function ImageBlock({
  data,
  bbox,
  page,
  className = "",
  editable = false,
  onEdit,
  debugMode = false,
}: ImageBlockProps) {
  const isDebug = debugMode || process.env.NODE_ENV === "development";

  // Extract base64 data from src
  const imageSrc = data.src || "";
  const isBase64 = imageSrc.startsWith("data:image/");

  return (
    <div
      className={`image-block mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
      data-image-id={data.id}
      style={isDebug && bbox ? {
        position: "relative",
        border: "2px dashed #f59e0b",
      } : undefined}
    >
      {/* Image Header with Controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Image</h3>
        {editable && onEdit && (
          <button
            onClick={() => onEdit(data)}
            className="p-2 text-gray-600 hover:text-[#A4C639] hover:bg-gray-100 rounded transition-colors"
            title="Edit Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Image Display */}
      <div className="relative w-full flex justify-center items-center bg-gray-50 rounded p-4">
        {isBase64 ? (
          <img
            src={imageSrc}
            alt={`Image from page ${page}`}
            className="max-w-full h-auto rounded shadow-sm"
            style={{
              maxHeight: "500px",
            }}
          />
        ) : data.path ? (
          // Fallback to path if available
          <img
            src={data.path}
            alt={`Image from page ${page}`}
            width={data.width || 400}
            height={data.height || 300}
            className="max-w-full h-auto rounded shadow-sm"
          />
        ) : (
          <div className="text-gray-400 text-center py-8">
            Image source not available
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="mt-3 text-sm text-gray-600">
        <div className="flex gap-4">
          <span>Width: {data.width}px</span>
          <span>Height: {data.height}px</span>
          <span>Page: {page}</span>
        </div>
        {data.section_id && (
          <div className="mt-1 text-xs text-gray-500">
            Linked to section: {data.section_id}
          </div>
        )}
      </div>

      {/* Debug Info */}
      {isDebug && (
        <div className="mt-2 text-xs text-gray-400 font-mono border-t pt-2">
          <div>ID: {data.id}</div>
          {bbox && (
            <div>
              BBox: [{bbox[0]}, {bbox[1]}, {bbox[2]}, {bbox[3]}]
            </div>
          )}
          <div>Size: {data.width} × {data.height}px</div>
          {data.section_id && <div>Section ID: {data.section_id}</div>}
        </div>
      )}
    </div>
  );
}

