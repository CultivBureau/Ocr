/**
 * When a user approves an AI component suggestion, the structured component is added
 * as a user element while the same information often still exists in generated sections/tables.
 * We soft-hide matching generated layout IDs (no deletion) so content is not duplicated;
 * removing the user element restores visibility of those blocks.
 */

import type { ComponentSuggestion, SeparatedStructure } from "../types/ExtractTypes";

const MIN_SCORE = 0.28;
const TOP_SCORE_FUZZ = 0.14;
const MAX_IDS = 4;
/** Transport is split across multiple generated tables (one per city); allow a higher cap. */
const MAX_IDS_TRANSPORT_TABLES = 32;

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Generated transport tables in this product use Arabic headings like "المواصلات - …".
 * Matching by title avoids missing tables when fuzzy scoring ranks one table far above the rest.
 */
function isGeneratedTransportTableTitle(title: string | undefined): boolean {
  if (!title?.trim()) return false;
  const t = normalizeText(stripHtml(title));
  if (t.includes("مواصلات")) return true;
  if (t.includes("transport")) return true;
  return false;
}

function tokenize(text: string): string[] {
  return normalizeText(stripHtml(text))
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function collectSearchWords(suggestion: ComponentSuggestion): string[] {
  const words: string[] = [];
  if (suggestion.source_text?.trim()) {
    words.push(...tokenize(suggestion.source_text));
  }
  const raw = JSON.stringify(suggestion.data ?? {});
  const fromData = normalizeText(raw)
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  words.push(...fromData);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const k = normalizeText(w);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out.slice(0, 220);
}

function scoreAgainstText(sourceWords: string[], targetText: string): number {
  const nt = normalizeText(targetText);
  if (!sourceWords.length || !nt) return 0;
  const meaningful = sourceWords.filter((w) => w.length >= 3);
  const use = meaningful.length >= 4 ? meaningful : sourceWords;
  let hits = 0;
  for (const w of use) {
    if (nt.includes(w)) hits++;
  }
  return hits / use.length;
}

function typeMultiplier(
  kind: "section" | "table",
  componentType: ComponentSuggestion["type"]
): number {
  if (componentType === "transport" && kind === "table") return 1.12;
  if (componentType !== "transport" && kind === "section") return 1.08;
  return 1;
}

/**
 * Returns generated section/table IDs that should be hidden while the approved
 * AI user element is shown. Does not mutate the structure.
 */
export function findSupersedesGeneratedIds(
  structure: SeparatedStructure,
  suggestion: ComponentSuggestion,
  alreadyClaimed: ReadonlySet<string>
): string[] {
  const sourceWords = collectSearchWords(suggestion);
  if (sourceWords.length === 0) return [];

  // One approved transport suggestion replaces the whole extracted transport block, which may be
  // multiple generated tables. Prefer all tables whose titles indicate transport.
  if (suggestion.type === "transport") {
    const byTitle = structure.generated.tables
      .filter(
        (tbl) =>
          !alreadyClaimed.has(tbl.id) &&
          isGeneratedTransportTableTitle(tbl.title)
      )
      .map((tbl) => tbl.id);
    if (byTitle.length > 0) {
      return [...byTitle].sort();
    }
  }

  const scored: { id: string; score: number; kind: "section" | "table" }[] = [];

  for (const section of structure.generated.sections) {
    if (alreadyClaimed.has(section.id)) continue;
    const blob = `${section.title || ""} ${section.content || ""}`;
    const s =
      scoreAgainstText(sourceWords, blob) *
      typeMultiplier("section", suggestion.type);
    if (s >= MIN_SCORE) {
      scored.push({ id: section.id, score: s, kind: "section" });
    }
  }

  for (const table of structure.generated.tables) {
    if (alreadyClaimed.has(table.id)) continue;
    const rowText = (table.rows || []).map((r) => r.join(" ")).join(" ");
    const blob = `${table.title || ""} ${(table.columns || []).join(" ")} ${rowText}`;
    const s =
      scoreAgainstText(sourceWords, blob) *
      typeMultiplier("table", suggestion.type);
    if (s >= MIN_SCORE) {
      scored.push({ id: table.id, score: s, kind: "table" });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) return [];

  // Transport: include every generated table that clears the bar (titles may not match in edge cases).
  // Do not apply top-score banding — it drops sibling city tables that still duplicate the AI block.
  if (suggestion.type === "transport") {
    const tableIds = scored
      .filter((c) => c.kind === "table" && c.score >= MIN_SCORE)
      .map((c) => c.id);
    if (tableIds.length > 0) {
      return tableIds.slice(0, MAX_IDS_TRANSPORT_TABLES);
    }
  }

  const top = scored[0].score;
  return scored
    .filter((c) => c.score >= Math.max(MIN_SCORE, top - TOP_SCORE_FUZZ))
    .slice(0, MAX_IDS)
    .map((c) => c.id);
}

export function collectClaimedSupersedesIds(
  elements: SeparatedStructure["user"]["elements"]
): Set<string> {
  const claimed = new Set<string>();
  for (const el of elements) {
    for (const id of el.supersedesGeneratedIds ?? []) {
      claimed.add(id);
    }
  }
  return claimed;
}

/**
 * Fixes documents saved when transport approval only stored one `gen_tbl_*` id.
 * AI-approved transport elements (sourceSuggestionId set) should supersede every generated
 * transport table so duplicates do not reappear after reload.
 */
export function repairTransportSupersedes(structure: SeparatedStructure): SeparatedStructure {
  const transportTableIds = structure.generated.tables
    .filter((t) => isGeneratedTransportTableTitle(t.title))
    .map((t) => t.id);
  if (transportTableIds.length === 0) return structure;

  let changed = false;
  const elements = structure.user.elements.map((el) => {
    if (el.type !== "transport" || !el.sourceSuggestionId) return el;
    const cur = el.supersedesGeneratedIds ?? [];
    const missing = transportTableIds.filter((id) => !cur.includes(id));
    if (missing.length === 0) return el;
    changed = true;
    return {
      ...el,
      supersedesGeneratedIds: [...new Set([...cur, ...missing])].sort(),
    };
  });
  if (!changed) return structure;
  return { ...structure, user: { ...structure.user, elements } };
}
