/**
 * Format Sections Utility
 * Phase 3: Receiving Extracted Data
 * 
 * Functions to format and process sections for rendering
 */

import type { Section } from "../types/ExtractTypes";

/**
 * Format section for display
 * @param section - Section object
 * @returns Formatted section with display-ready properties
 */
export function formatSection(section: Section) {
  return {
    ...section,
    displayTitle: section.title || "بدون عنوان",
    displayContent: section.content || "",
    hasContent: Boolean(section.content && section.content.trim().length > 0),
    wordCount: section.content ? section.content.split(/\s+/).length : 0,
    charCount: section.content ? section.content.length : 0,
  };
}

/**
 * Format multiple sections
 * @param sections - Array of sections
 * @returns Array of formatted sections
 */
export function formatSections(sections: Section[]) {
  return sections.map(formatSection);
}

/**
 * Sort sections by order
 * @param sections - Array of sections
 * @returns Sorted sections
 */
export function sortSectionsByOrder(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

/**
 * Group sections by parent
 * @param sections - Array of sections
 * @returns Map of parent_id to child sections
 */
export function groupSectionsByParent(sections: Section[]): Map<string | null, Section[]> {
  const grouped = new Map<string | null, Section[]>();
  
  sections.forEach((section) => {
    const parentId = section.parent_id;
    if (!grouped.has(parentId)) {
      grouped.set(parentId, []);
    }
    grouped.get(parentId)!.push(section);
  });
  
  // Sort each group by order
  grouped.forEach((children) => {
    children.sort((a, b) => a.order - b.order);
  });
  
  return grouped;
}

/**
 * Get section hierarchy (parent -> children)
 * @param sections - Array of sections
 * @returns Array of root sections with nested children
 */
export function getSectionHierarchy(sections: Section[]): Array<Section & { children?: Section[] }> {
  const sorted = sortSectionsByOrder(sections);
  const sectionMap = new Map<string, Section & { children?: Section[] }>();
  const roots: Array<Section & { children?: Section[] }> = [];
  
  // First pass: create all sections
  sorted.forEach((section) => {
    sectionMap.set(section.id, { ...section });
  });
  
  // Second pass: build hierarchy
  sorted.forEach((section) => {
    const sectionWithChildren = sectionMap.get(section.id)!;
    
    if (section.parent_id === null) {
      roots.push(sectionWithChildren);
    } else {
      const parent = sectionMap.get(section.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(sectionWithChildren);
      }
    }
  });
  
  return roots;
}

/**
 * Filter sections by search term
 * @param sections - Array of sections
 * @param searchTerm - Search term
 * @returns Filtered sections
 */
export function filterSections(sections: Section[], searchTerm: string): Section[] {
  if (!searchTerm.trim()) {
    return sections;
  }
  
  const term = searchTerm.toLowerCase();
  return sections.filter(
    (section) =>
      section.title.toLowerCase().includes(term) ||
      section.content.toLowerCase().includes(term)
  );
}

/**
 * Get section statistics
 * @param sections - Array of sections
 * @returns Statistics object
 */
export function getSectionStats(sections: Section[]) {
  const totalWords = sections.reduce(
    (sum, section) => sum + (section.content ? section.content.split(/\s+/).length : 0),
    0
  );
  const totalChars = sections.reduce(
    (sum, section) => sum + (section.content ? section.content.length : 0),
    0
  );
  
  return {
    total: sections.length,
    withContent: sections.filter((s) => s.content && s.content.trim().length > 0).length,
    withoutContent: sections.filter((s) => !s.content || s.content.trim().length === 0).length,
    totalWords,
    totalChars,
    averageWords: sections.length > 0 ? Math.round(totalWords / sections.length) : 0,
    averageChars: sections.length > 0 ? Math.round(totalChars / sections.length) : 0,
  };
}

