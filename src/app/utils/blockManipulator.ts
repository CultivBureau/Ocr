/**
 * Block manipulation utilities
 */
import type { Block, Element } from "../types/ExtractTypes";

/**
 * Delete a block from blocks array
 * @param blocks - Array of blocks
 * @param id - Block ID to delete
 * @returns New array without the deleted block
 */
export function deleteBlock(blocks: Block[], id: string): Block[] {
  return blocks.filter((block) => block.id !== id);
}

/**
 * Reorder blocks by moving one from one index to another
 * @param blocks - Array of blocks
 * @param fromIndex - Source index
 * @param toIndex - Target index
 * @returns New array with reordered blocks
 */
export function reorderBlocks(
  blocks: Block[],
  fromIndex: number,
  toIndex: number
): Block[] {
  const newBlocks = [...blocks];
  const [removed] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, removed);
  return newBlocks;
}

/**
 * Update a block's data
 * @param blocks - Array of blocks
 * @param id - Block ID to update
 * @param data - Partial element data to update
 * @returns New array with updated block
 */
export function updateBlock(
  blocks: Block[],
  id: string,
  data: Partial<Element>
): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return {
        ...block,
        data: {
          ...block.data,
          ...data,
        } as Element,
      };
    }
    return block;
  });
}

/**
 * Update a block's bounding box
 * @param blocks - Array of blocks
 * @param id - Block ID to update
 * @param bbox - New bounding box
 * @returns New array with updated block
 */
export function updateBlockBbox(
  blocks: Block[],
  id: string,
  bbox: [number, number, number, number]
): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return {
        ...block,
        bbox,
        data: {
          ...block.data,
          bbox,
        } as Element,
      };
    }
    return block;
  });
}

/**
 * Move block up by one position
 * @param blocks - Array of blocks
 * @param index - Current index
 * @returns New array with block moved up
 */
export function moveBlockUp(blocks: Block[], index: number): Block[] {
  if (index <= 0) return blocks;
  return reorderBlocks(blocks, index, index - 1);
}

/**
 * Move block down by one position
 * @param blocks - Array of blocks
 * @param index - Current index
 * @returns New array with block moved down
 */
export function moveBlockDown(blocks: Block[], index: number): Block[] {
  if (index >= blocks.length - 1) return blocks;
  return reorderBlocks(blocks, index, index + 1);
}

