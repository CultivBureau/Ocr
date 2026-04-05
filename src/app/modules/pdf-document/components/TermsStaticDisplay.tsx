"use client";

import React from "react";
import { sectionContentLooksLikeHtml } from "../utils/legacySectionContentToHtml";

const termsTextStyle: React.CSSProperties = {
  fontFamily: "'Cairo', 'Arial', sans-serif",
  fontSize: "14px",
  fontWeight: 900,
  lineHeight: 1.8,
  color: "#1a1a1a",
  wordBreak: "break-word",
  textAlign: "right",
  direction: "rtl",
};

/**
 * Renders company or document terms — plain text or Tiptap HTML.
 */
export default function TermsStaticDisplay({ content }: { content: string }) {
  if (!content.trim()) {
    return null;
  }
  if (sectionContentLooksLikeHtml(content)) {
    return (
      <div
        style={termsTextStyle}
        className="terms-static-html [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5 [&_li]:my-0.5 [&_p]:my-0.5"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div style={{ ...termsTextStyle, whiteSpace: "pre-wrap" }}>{content}</div>
  );
}
