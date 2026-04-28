import { describe, expect, it } from "vitest";

import { legacySectionContentToHtml } from "./legacySectionContentToHtml";

describe("legacySectionContentToHtml", () => {
  it("keeps decimal-like values as plain text", () => {
    expect(legacySectionContentToHtml("1.222")).toBe("<p>1.222</p>");
    expect(legacySectionContentToHtml("1.2224")).toBe("<p>1.2224</p>");
  });

  it("still parses numbered lists when marker is followed by whitespace", () => {
    expect(legacySectionContentToHtml("1. first\n2. second")).toBe(
      "<ul><li><p>first</p></li><li><p>second</p></li></ul>"
    );
  });

  it("keeps existing bullet behavior for symbols", () => {
    expect(legacySectionContentToHtml("• alpha\n• beta")).toBe(
      "<ul><li><p>alpha</p></li><li><p>beta</p></li></ul>"
    );
  });

  it("handles mixed multiline content without corrupting decimals", () => {
    expect(legacySectionContentToHtml("Total\n1.222\n1. item")).toBe(
      "<p>Total</p><p>1.222</p><ul><li><p>item</p></li></ul>"
    );
  });
});
