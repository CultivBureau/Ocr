/**
 * Blocks Slice - State management for layout-based blocks
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Block } from "@/app/types/ExtractTypes";

export interface BlocksState {
  items: Block[];
  sorted: boolean;
}

const initialState: BlocksState = {
  items: [],
  sorted: false,
};

const blocksSlice = createSlice({
  name: "blocks",
  initialState,
  reducers: {
    setBlocks(state, action: PayloadAction<Block[]>) {
      state.items = action.payload;
      state.sorted = true;
    },
    addBlock(state, action: PayloadAction<Block>) {
      state.items.push(action.payload);
      state.sorted = false; // Needs re-sorting
    },
    removeBlock(state, action: PayloadAction<string>) {
      state.items = state.items.filter((block) => block.id !== action.payload);
    },
    updateBlock(state, action: PayloadAction<{ id: string; block: Block }>) {
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload.block;
      }
    },
    reorderBlocks(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, removed);
      state.sorted = false; // Manual reorder, not layout-sorted
    },
    clearBlocks(state) {
      state.items = [];
      state.sorted = false;
    },
  },
});

export const {
  setBlocks,
  addBlock,
  removeBlock,
  updateBlock,
  reorderBlocks,
  clearBlocks,
} = blocksSlice.actions;

export default blocksSlice.reducer;

