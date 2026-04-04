/**
 * Structure Migration Utilities
 * 
 * Migrates old structure format (v1) to new separated structure format (v2)
 */

import type { Structure, SeparatedStructure } from "../types/ExtractTypes";

/**
 * Migrate old structure format to new separated structure
 * Handles:
 * - section_1 → gen_sec_1
 * - table_1 → gen_tbl_1
 * - Updates section_id references in tables
 * - Updates parent_id references in sections
 */
export function migrateToSeparatedStructure(oldStructure: Structure): SeparatedStructure {
  // Helper to normalize section IDs: "section_1" -> "gen_sec_1"
  const normalizeSectionId = (id: string): string => {
    if (!id) return id;
    if (id.startsWith('gen_sec_')) return id;
    if (id.startsWith('section_')) return id.replace('section_', 'gen_sec_');
    if (id.startsWith('gen_')) return id;
    return `gen_sec_${id}`;
  };

  // Helper to normalize table IDs: "table_1" -> "gen_tbl_1"
  const normalizeTableId = (id: string): string => {
    if (!id) return id;
    if (id.startsWith('gen_tbl_')) return id;
    if (id.startsWith('table_')) return id.replace('table_', 'gen_tbl_');
    if (id.startsWith('gen_')) return id;
    return `gen_tbl_${id}`;
  };

  // Migrate sections with normalized IDs
  const migratedSections = oldStructure.sections.map(s => ({
    ...s,
    id: normalizeSectionId(s.id),
    parent_id: s.parent_id ? normalizeSectionId(s.parent_id) : null
  }));

  // Migrate tables with normalized IDs and updated section_id references
  const migratedTables = oldStructure.tables.map(t => ({
    ...t,
    id: normalizeTableId(t.id),
    section_id: t.section_id ? normalizeSectionId(t.section_id) : null
  }));

  // Build layout order: sections first, then tables
  const layout: string[] = [
    ...migratedSections.map(s => s.id),
    ...migratedTables.map(t => t.id)
  ];

  return {
    generated: {
      sections: migratedSections,
      tables: migratedTables
    },
    user: { elements: [] },
    layout,
    meta: {
      ...oldStructure.meta,
      structure_version: 2,
      migrated_from_legacy: true
    }
  };
}

/**
 * Check if a structure is in the new format (v2)
 */
export function isSeparatedStructure(structure: any): structure is SeparatedStructure {
  return (
    structure &&
    typeof structure === 'object' &&
    'generated' in structure &&
    'user' in structure &&
    'layout' in structure &&
    Array.isArray(structure.layout)
  );
}

/**
 * Check if a structure is in the old format (v1)
 */
export function isLegacyStructure(structure: any): structure is Structure {
  return (
    structure &&
    typeof structure === 'object' &&
    'sections' in structure &&
    'tables' in structure &&
    Array.isArray(structure.sections) &&
    Array.isArray(structure.tables) &&
    !('generated' in structure)
  );
}
