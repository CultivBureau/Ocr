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

  const scored: { id: string; score: number }[] = [];

  for (const section of structure.generated.sections) {
    if (alreadyClaimed.has(section.id)) continue;
    const blob = `${section.title || ""} ${section.content || ""}`;
    const s =
      scoreAgainstText(sourceWords, blob) *
      typeMultiplier("section", suggestion.type);
    if (s >= MIN_SCORE) {
      scored.push({ id: section.id, score: s });
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
      scored.push({ id: table.id, score: s });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) return [];

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
