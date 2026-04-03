/**
 * Detects stored section content that is already HTML (e.g. from Tiptap).
 */
export function sectionContentLooksLikeHtml(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  return t.startsWith("<") && /<[a-z][\s\S]*>/i.test(t);
}

function lineToInnerHtml(line: string): string {
  return line
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(
      /\[CENTER\](.*?)\[\/CENTER\]/g,
      '<span style="display:block;text-align:center;width:100%">$1</span>'
    );
}

/**
 * One-time migration from plain-text / marker-based section content to HTML for ProseMirror/Tiptap.
 * Preserves bullets, **bold**, __underline__, and [CENTER]...[/CENTER] where present.
 */
export function legacySectionContentToHtml(content: string): string {
  if (!content.trim()) {
    return "<p></p>";
  }
  if (sectionContentLooksLikeHtml(content)) {
    return content;
  }

  let processed = content;
  const bulletsOnNewLines = /\n\s*•/.test(processed);
  if (processed.includes("•") && !bulletsOnNewLines) {
    const parts = processed.split("•");
    const formatted: string[] = [];
    if (parts[0]?.trim()) formatted.push(parts[0].trim());
    for (let i = 1; i < parts.length; i++) {
      const trimmed = parts[i].trim();
      if (trimmed) formatted.push(`• ${trimmed}`);
    }
    processed = formatted.join("\n");
  }

  const rawLines = processed.split("\n");
  const blocks: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        "<ul>" +
          listItems
            .map((inner) => `<li><p>${inner}</p></li>`)
            .join("") +
          "</ul>"
      );
      listItems = [];
    }
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const bulletMatch = trimmed.match(/^([\s]*[•\-\*]\s*|\d+\.\s*)(.*)$/);
    if (bulletMatch) {
      const body = (bulletMatch[2] ?? "").trim();
      listItems.push(lineToInnerHtml(body));
    } else {
      flushList();
      blocks.push(`<p>${lineToInnerHtml(trimmed)}</p>`);
    }
  }
  flushList();

  return blocks.length ? blocks.join("") : "<p></p>";
}
