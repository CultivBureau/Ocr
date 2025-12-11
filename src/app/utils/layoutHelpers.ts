/**
 * Layout helper functions for bbox and positioning
 */
import type { BoundingBox } from "@/app/types/ExtractTypes";
import { CSSProperties } from "react";

/**
 * Convert bbox to CSS positioning style
 * @param bbox - Bounding box [x0, y0, x1, y1]
 * @param scale - Optional scale factor (default: 1)
 * @returns CSS properties for positioning
 */
export function getBboxStyle(
  bbox: BoundingBox,
  scale: number = 1
): CSSProperties {
  if (!bbox || bbox.length !== 4) {
    return {};
  }

  const [x0, y0, x1, y1] = bbox;
  const width = (x1 - x0) * scale;
  const height = (y1 - y0) * scale;

  return {
    position: "absolute",
    left: `${x0 * scale}px`,
    top: `${y0 * scale}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

/**
 * Check if two bboxes overlap
 * @param bbox1 - First bounding box
 * @param bbox2 - Second bounding box
 * @returns True if bboxes overlap
 */
export function bboxesOverlap(
  bbox1: BoundingBox,
  bbox2: BoundingBox
): boolean {
  if (!bbox1 || !bbox2) return false;

  const [x1_min, y1_min, x1_max, y1_max] = bbox1;
  const [x2_min, y2_min, x2_max, y2_max] = bbox2;

  return !(
    x1_max < x2_min ||
    x2_max < x1_min ||
    y1_max < y2_min ||
    y2_max < y1_min
  );
}

/**
 * Calculate overlap percentage between two bboxes
 * @param bbox1 - First bounding box
 * @param bbox2 - Second bounding box
 * @returns Overlap percentage (0-1)
 */
export function calculateOverlap(
  bbox1: BoundingBox,
  bbox2: BoundingBox
): number {
  if (!bbox1 || !bbox2) return 0;

  const [x1_min, y1_min, x1_max, y1_max] = bbox1;
  const [x2_min, y2_min, x2_max, y2_max] = bbox2;

  // Calculate intersection
  const x_overlap = Math.max(0, Math.min(x1_max, x2_max) - Math.max(x1_min, x2_min));
  const y_overlap = Math.max(0, Math.min(y1_max, y2_max) - Math.max(y1_min, y2_min));
  const intersection = x_overlap * y_overlap;

  // Calculate union
  const area1 = (x1_max - x1_min) * (y1_max - y1_min);
  const area2 = (x2_max - x2_min) * (y2_max - y2_min);
  const union = area1 + area2 - intersection;

  if (union === 0) return 0;

  return intersection / union;
}

/**
 * Check if bbox1 is inside bbox2
 * @param bbox1 - Inner bounding box
 * @param bbox2 - Outer bounding box
 * @returns True if bbox1 is completely inside bbox2
 */
export function isBboxInside(
  bbox1: BoundingBox,
  bbox2: BoundingBox
): boolean {
  if (!bbox1 || !bbox2) return false;

  const [x1_min, y1_min, x1_max, y1_max] = bbox1;
  const [x2_min, y2_min, x2_max, y2_max] = bbox2;

  return (
    x1_min >= x2_min &&
    y1_min >= y2_min &&
    x1_max <= x2_max &&
    y1_max <= y2_max
  );
}

/**
 * Get center point of bbox
 * @param bbox - Bounding box
 * @returns [x, y] center coordinates
 */
export function getBboxCenter(bbox: BoundingBox): [number, number] {
  if (!bbox || bbox.length !== 4) return [0, 0];

  const [x0, y0, x1, y1] = bbox;
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

