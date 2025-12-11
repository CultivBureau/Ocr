/**
 * Map backend JSON response to frontend blocks format
 */
import type { ExtractResponse, Block, Element } from "@/app/types/ExtractTypes";

/**
 * Convert backend ExtractResponse to frontend Block array
 * @param json - ExtractResponse from backend
 * @returns Array of blocks for rendering
 */
export function mapJsonToBlocks(json: ExtractResponse): Block[] {
  const blocks: Block[] = [];
  
  // Map sections
  if (json.sections && Array.isArray(json.sections)) {
    json.sections.forEach((section) => {
      blocks.push({
        id: section.id,
        type: "section",
        page: section.page || 1,
        bbox: section.bbox,
        data: section,
      });
    });
  }
  
  // Map tables
  if (json.tables && Array.isArray(json.tables)) {
    json.tables.forEach((table) => {
      blocks.push({
        id: table.id,
        type: "table",
        page: table.page || 1,
        bbox: table.bbox,
        data: table,
      });
    });
  }
  
  // Map images
  if (json.images && Array.isArray(json.images)) {
    json.images.forEach((image) => {
      blocks.push({
        id: image.id,
        type: "image",
        page: image.page || 1,
        bbox: image.bbox,
        data: image,
      });
    });
  }
  
  // If backend provides pre-sorted elements, use them
  // Otherwise, sort blocks by page and layout
  if (json.elements && Array.isArray(json.elements) && json.elements.length > 0) {
    // Backend already sorted, just map to blocks
    return json.elements.map((element: Element) => ({
      id: element.id,
      type: element.type,
      page: element.page || 1,
      bbox: element.bbox,
      data: element,
    }));
  }
  
  // Sort blocks by layout if not pre-sorted
  return sortBlocksByLayout(blocks);
}

/**
 * Sort blocks by layout position
 * @param blocks - Blocks to sort
 * @returns Sorted blocks
 */
export function sortBlocksByLayout(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => {
    // First, sort by page
    if (a.page !== b.page) {
      return a.page - b.page;
    }
    
    // If same page, sort by Y position (top to bottom)
    if (a.bbox && b.bbox) {
      const yDiff = a.bbox[1] - b.bbox[1];
      if (Math.abs(yDiff) > 1) {
        return yDiff;
      }
      
      // If similar Y, sort by X position (left to right)
      return a.bbox[0] - b.bbox[0];
    }
    
    // If no bbox, maintain order
    return 0;
  });
}

