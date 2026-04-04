import type { SeparatedStructure } from "../types/ExtractTypes";

/** Matches defaults in CodePreview `onSectionAddAfter` so the first section is editable (empty content skips the content editor in SectionTemplate). */
export const DEFAULT_NEW_SECTION_TITLE = "New Section";
export const DEFAULT_NEW_SECTION_CONTENT = "• Enter section content here...";

/**
 * Minimal v2 structure: one generated section with placeholder title/content, no tables, same as after PDF upload.
 */
export function createBlankDocumentStructure(): SeparatedStructure {
  const sectionId = `gen_sec_${Date.now()}`;
  return {
    generated: {
      sections: [
        {
          type: "section",
          id: sectionId,
          title: DEFAULT_NEW_SECTION_TITLE,
          content: DEFAULT_NEW_SECTION_CONTENT,
          order: 1,
          parent_id: null,
        },
      ],
      tables: [],
    },
    user: { elements: [] },
    layout: [sectionId],
    meta: {
      structure_version: 2,
      blank_document: true,
      generated_at: new Date().toISOString(),
      sections_count: 1,
      tables_count: 0,
    },
  };
}
