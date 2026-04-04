import { isValidElement, type ReactNode } from "react";

/**
 * Extract plain text from ProseMirror/Tiptap-like JSON (nodes with `type` + optional `text` / `content`).
 * Used when API or persisted data accidentally stores JSON instead of HTML/string.
 */
function proseMirrorLikeToPlainText(input: unknown): string {
  if (input == null) return "";
  if (typeof input === "string") return input;
  if (typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }
  if (Array.isArray(input)) {
    return input.map(proseMirrorLikeToPlainText).join("");
  }
  if (typeof input !== "object") return String(input);

  const o = input as Record<string, unknown>;

  if (typeof o.text === "string" && (o.type === "text" || !Array.isArray(o.content))) {
    return o.text;
  }

  if (Array.isArray(o.content)) {
    const nodeType = o.type;
    const childTexts = (o.content as unknown[]).map(proseMirrorLikeToPlainText);
    if (nodeType === "doc" || nodeType === "bulletList" || nodeType === "orderedList") {
      return childTexts.join("\n");
    }
    return childTexts.join("");
  }

  try {
    return JSON.stringify(o);
  } catch {
    return "";
  }
}

/**
 * Coerce section content to a display/storage string (never throws on odd shapes).
 */
export function normalizeSectionContentToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return proseMirrorLikeToPlainText(value);
}

/**
 * Coerce `SectionTemplate` content prop: keep real React nodes/elements; stringify ProseMirror JSON etc.
 */
export function normalizeSectionContentProp(
  content: string | ReactNode
): string | ReactNode {
  if (typeof content === "string") return content;
  if (content == null || typeof content === "boolean") return "";
  if (isValidElement(content)) return content;
  if (Array.isArray(content)) {
    if (content.length === 0) return "";
    if (content.some((item) => isValidElement(item))) {
      return content as ReactNode;
    }
    return proseMirrorLikeToPlainText(content);
  }
  if (typeof content === "object") {
    return proseMirrorLikeToPlainText(content);
  }
  return String(content);
}
