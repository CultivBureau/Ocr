"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent, useEditorState, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { mergeAttributes, posToDOMRect, Node as TiptapNode, type Editor, type NodeViewRendererProps } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyleKit } from "@tiptap/extension-text-style/text-style-kit";
import TextAlign from "@tiptap/extension-text-align";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  Eraser,
  ImagePlus,
  Paperclip,
  LoaderCircle,
  Link2,
  Pencil,
  LayoutGrid,
  Trash2,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
  Images,
  Monitor,
  Square,
  Rows3,
} from "lucide-react";
import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { legacySectionContentToHtml } from "../utils/legacySectionContentToHtml";
import { uploadEditorAssetWithProgress } from "../services/PdfApi";

/* ─────────────────────────────────────────
   Bidi / language (dominant doc hint + block-level dir="auto")
───────────────────────────────────────── */

const DIR_AUTO = { dir: "auto" as const };

/** Strip HTML for analysis — SSR-safe fallback avoids document. */
function plainTextFromHtml(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").replace(/\u00a0/g, " ");
}

function isStrongRtlCodePoint(cp: number): boolean {
  if (cp >= 0x0590 && cp <= 0x08ff) return true;
  if (cp >= 0xfb1d && cp <= 0xfdff) return true;
  if (cp >= 0xfe70 && cp <= 0xfeff) return true;
  return false;
}

function isStrongLtrLetter(cp: number): boolean {
  if (cp >= 0x0041 && cp <= 0x005a) return true;
  if (cp >= 0x0061 && cp <= 0x007a) return true;
  if (cp >= 0x00c0 && cp <= 0x024f) return true;
  if (cp >= 0x0400 && cp <= 0x052f) return true;
  return false;
}

/**
 * Scores plain text for dominant direction and a best-effort `lang` for the editor root
 * (accessibility). Per-block `dir="auto"` on paragraphs/lists handles mixed RTL/LTR inside the doc.
 */
function analyzeEditorPlainText(text: string): {
  dir: "rtl" | "ltr";
  lang: string;
} {
  let rtl = 0;
  let ltr = 0;
  let hebrew = 0;
  let arabicScript = 0;

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (isStrongRtlCodePoint(cp)) {
      rtl++;
      if (cp >= 0x0590 && cp <= 0x05ff) hebrew++;
      if (
        (cp >= 0x0600 && cp <= 0x06ff) ||
        (cp >= 0x0750 && cp <= 0x077f) ||
        (cp >= 0x08a0 && cp <= 0x08ff)
      ) {
        arabicScript++;
      }
    } else if (isStrongLtrLetter(cp)) {
      ltr++;
    }
  }

  const dir: "rtl" | "ltr" = rtl > ltr ? "rtl" : "ltr";
  let lang = "";
  if (!text.trim()) {
    lang = "";
  } else if (dir === "rtl") {
    lang = hebrew > arabicScript ? "he" : "ar";
  } else {
    lang = "en";
  }

  return { dir, lang };
}

function syncProseMirrorRootBidi(dom: HTMLElement, plain: string): void {
  const { dir, lang } = analyzeEditorPlainText(plain);
  dom.setAttribute("dir", dir);
  if (lang) dom.setAttribute("lang", lang);
  else dom.removeAttribute("lang");
}

const BidiParagraph = Paragraph.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, DIR_AUTO),
      0,
    ];
  },
});

const BidiListItem = ListItem.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, DIR_AUTO),
      0,
    ];
  },
});

const BidiBulletList = BulletList.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "ul",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, DIR_AUTO),
      0,
    ];
  },
});

const BidiOrderedList = OrderedList.extend({
  renderHTML({ HTMLAttributes }) {
    const { start, ...attributesWithoutStart } = HTMLAttributes;
    return start === 1
      ? [
          "ol",
          mergeAttributes(
            this.options.HTMLAttributes,
            attributesWithoutStart,
            DIR_AUTO,
          ),
          0,
        ]
      : [
          "ol",
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, DIR_AUTO),
          0,
        ];
  },
});

/** Keyboard hint for undo (safe on SSR — defaults to Ctrl until client). */
function getUndoRedoHints(): { undo: string; redo: string } {
  if (typeof navigator === "undefined") {
    return { undo: "Ctrl+Z", redo: "Ctrl+Y" };
  }
  const mac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform ?? navigator.userAgent);
  return mac
    ? { undo: "⌘Z", redo: "⇧⌘Z" }
    : { undo: "Ctrl+Z", redo: "Ctrl+Y" };
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const FONT_SIZES = [
  "11px", "12px", "13px", "14px", "15px",
  "16px", "18px", "20px", "24px", "28px", "32px",
] as const;

const PRESET_TEXT_COLORS = [
  "#111827", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
];

const PRESET_HIGHLIGHTS = [
  "#FEF9C3", "#BBF7D0", "#BAE6FD", "#EDE9FE",
  "#FECACA", "#FED7AA", "#D1FAE5", "#DBEAFE",
  "#FCE7F3", "#F3F4F6", "transparent",
];

function normalizeIncomingHtml(raw: string): string {
  return legacySectionContentToHtml(raw || "");
}

const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const IMAGE_MIME_PREFIX = "image/";
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
const ACCEPTED_ATTACHMENT_TYPES =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-rar-compressed";
const MAX_EDITOR_ASSET_SIZE_BYTES = 20 * 1024 * 1024;

type GridLayoutOption = {
  id: string;
  label: string;
  description: string;
  rows: number;
  cols: number;
};

const GRID_LAYOUT_OPTIONS: GridLayoutOption[] = [
  { id: "1x2", label: "1 x 2", description: "Wide pair", rows: 1, cols: 2 },
  { id: "2x2", label: "2 x 2", description: "Balanced grid", rows: 2, cols: 2 },
  { id: "2x3", label: "2 x 3", description: "Story layout", rows: 2, cols: 3 },
  { id: "3x3", label: "3 x 3", description: "Dense gallery", rows: 3, cols: 3 },
];

type GridAspectOption = {
  id: "16/9" | "4/3" | "1/1";
  label: string;
  description: string;
};

const GRID_ASPECT_OPTIONS: GridAspectOption[] = [
  { id: "16/9", label: "Wide", description: "Best for landscape travel shots" },
  { id: "4/3", label: "Classic", description: "Balanced photo frame" },
  { id: "1/1", label: "Square", description: "Compact social-style cards" },
];

type GridFitOption = {
  id: "contain" | "cover";
  label: string;
  description: string;
};

const GRID_FIT_OPTIONS: GridFitOption[] = [
  { id: "cover", label: "Fill", description: "Edge-to-edge crop" },
  { id: "contain", label: "Fit", description: "Show full image" },
];

type GridGapOption = {
  id: "tight" | "normal" | "loose";
  label: string;
  px: number;
};

const GRID_GAP_OPTIONS: GridGapOption[] = [
  { id: "tight", label: "Tight", px: 4 },
  { id: "normal", label: "Normal", px: 8 },
  { id: "loose", label: "Loose", px: 12 },
];

function suggestGridLayoutId(filesCount: number): string {
  if (filesCount <= 2) return GRID_LAYOUT_OPTIONS[0].id;
  if (filesCount <= 4) return GRID_LAYOUT_OPTIONS[1].id;
  if (filesCount <= 6) return GRID_LAYOUT_OPTIONS[2].id;
  return GRID_LAYOUT_OPTIONS[3].id;
}

function gapPxForOption(gapId: GridGapOption["id"]): number {
  return GRID_GAP_OPTIONS.find((option) => option.id === gapId)?.px ?? GRID_GAP_OPTIONS[1].px;
}

/* ─────────────────────────────────────────
   Image Grid — custom TipTap node
───────────────────────────────────────── */

interface ImageGridImage {
  src: string;
  alt: string;
}

interface ImageGridViewProps extends NodeViewRendererProps {
  deleteNode: () => void;
  selected: boolean;
}

function ImageGridView({ node, deleteNode, selected }: ImageGridViewProps) {
  const cols = node.attrs.cols as number;
  const rows = node.attrs.rows as number;
  const fit = (node.attrs.fit as "contain" | "cover") ?? "contain";
  const aspectRatio = (node.attrs.aspectRatio as "16/9" | "4/3" | "1/1") ?? "16/9";
  const gap = gapPxForOption((node.attrs.gap as GridGapOption["id"]) ?? "normal");
  const images = node.attrs.images as ImageGridImage[];

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        className={`relative my-2 group rounded-xl overflow-hidden transition-all duration-150 select-none ${
          selected
            ? "ring-2 ring-blue-400 ring-offset-2"
            : "hover:ring-2 hover:ring-blue-200 hover:ring-offset-1"
        }`}
        style={{
          background: "var(--section-grid-bg, rgba(148, 163, 184, 0.12))",
          border: "1px solid var(--section-grid-border, rgba(148, 163, 184, 0.35))",
          padding: `${gap}px`,
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); deleteNode(); }}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-red-500 shadow-md hover:bg-red-50 transition-all duration-150"
          title="Remove image grid"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: `${gap}px`,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg"
              style={{
                aspectRatio,
                background: "var(--section-grid-cell-bg, rgba(241, 245, 249, 0.9))",
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                data-grid-image="true"
                className="block"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: fit,
                  objectPosition: "center",
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const ImageGridNode = TiptapNode.create({
  name: "imageGrid",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute("data-cols") ?? "2", 10),
        renderHTML: (attrs) => ({ "data-cols": String(attrs.cols) }),
      },
      rows: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute("data-rows") ?? "2", 10),
        renderHTML: (attrs) => ({ "data-rows": String(attrs.rows) }),
      },
      fit: {
        default: "contain",
        parseHTML: (element) => element.getAttribute("data-fit") ?? "contain",
        renderHTML: (attrs) => ({ "data-fit": String(attrs.fit) }),
      },
      aspectRatio: {
        default: "16/9",
        parseHTML: (element) => element.getAttribute("data-aspect-ratio") ?? "16/9",
        renderHTML: (attrs) => ({ "data-aspect-ratio": String(attrs.aspectRatio) }),
      },
      gap: {
        default: "normal",
        parseHTML: (element) => element.getAttribute("data-gap") ?? "normal",
        renderHTML: (attrs) => ({ "data-gap": String(attrs.gap) }),
      },
      images: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute("data-images") ?? "[]") as ImageGridImage[];
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({
          "data-images": JSON.stringify(attrs.images as ImageGridImage[]),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-image-grid]" }];
  },

  renderHTML({ node }) {
    const cols = node.attrs.cols as number;
    const rows = node.attrs.rows as number;
    const fit = (node.attrs.fit as "contain" | "cover") ?? "contain";
    const aspectRatio = (node.attrs.aspectRatio as "16/9" | "4/3" | "1/1") ?? "16/9";
    const gap = gapPxForOption((node.attrs.gap as GridGapOption["id"]) ?? "normal");
    const images = node.attrs.images as ImageGridImage[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cellNodes: any[] = images.map((img) => [
      "div",
      {
          style:
          `overflow:hidden;border-radius:8px;aspect-ratio:${aspectRatio};background:var(--section-grid-cell-bg, rgba(241,245,249,.9));`,
      },
      [
        "img",
        {
          src: img.src,
          alt: img.alt,
          "data-grid-image": "true",
          style: `display:block;width:100%;height:100%;object-fit:${fit};object-position:center;`,
        },
      ],
    ]);

    return [
      "div",
      {
        "data-image-grid": "true",
        "data-cols": String(cols),
        "data-rows": String(rows),
        "data-fit": fit,
        "data-aspect-ratio": aspectRatio,
        "data-gap": String(node.attrs.gap ?? "normal"),
        "data-images": JSON.stringify(images),
        style: `display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));grid-template-rows:repeat(${rows},minmax(0,1fr));gap:${gap}px;margin:8px 0;background:var(--section-grid-bg, rgba(148,163,184,.12));border:1px solid var(--section-grid-border, rgba(148,163,184,.35));border-radius:12px;padding:${gap}px;`,
      },
      ...cellNodes,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGridView);
  },
});

function resolveUploadedAssetUrl(filePath: string): string {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${PUBLIC_API_BASE_URL}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

function createSafeAttachmentLabel(name: string): string {
  return name.replace(/[<>]/g, "").trim() || "Attachment";
}

function isSupportedEditorAsset(file: File): boolean {
  if (file.type.startsWith(IMAGE_MIME_PREFIX)) return true;
  return file.size > 0;
}

function getEditorAssetValidationError(file: File): string | null {
  if (file.size > MAX_EDITOR_ASSET_SIZE_BYTES) {
    return `${file.name} is too large. Maximum upload size is 20MB.`;
  }
  if (!isSupportedEditorAsset(file)) {
    return `${file.name} is not a supported file type.`;
  }
  return null;
}

export interface SectionContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  editable?: boolean;
  className?: string;
  /** When false, hides the keyboard/hint strip under the editor (e.g. table cell modal with explicit Save). */
  showFooterHint?: boolean;
}

/* ─────────────────────────────────────────
   Shared UI primitives
───────────────────────────────────────── */
function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" aria-hidden />;
}

/**
 * Undo / Redo with labels, disabled states from editor history stack, and keyboard hints.
 */
function HistoryControls({ editor }: { editor: Editor }) {
  const hints = getUndoRedoHints();

  const { canUndo, canRedo } =
    useEditorState({
      editor,
      selector: (s) => ({
        canUndo: undoDepth(s.editor.state) > 0,
        canRedo: redoDepth(s.editor.state) > 0,
        transactionNumber: s.transactionNumber,
      }),
    }) ?? { canUndo: false, canRedo: false, transactionNumber: 0 };

  const baseBtn =
    "flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold tracking-tight transition-all duration-150";
  const enabled = "text-slate-700 hover:bg-blue-50 hover:text-blue-800 active:scale-[0.98]";
  const disabled = "cursor-not-allowed text-slate-300 opacity-60";

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-slate-200/90 bg-linear-to-b from-white to-slate-50/95 px-0.5 py-0.5 shadow-sm"
      role="group"
      aria-label="Edit history"
    >
      <button
        type="button"
        disabled={!canUndo}
        title={`Undo last change (${hints.undo})`}
        aria-label={`Undo last change, ${hints.undo}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().undo().run()}
        className={`${baseBtn} ${canUndo ? enabled : disabled}`}
      >
        <Undo2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        <span className="hidden min-[380px]:inline">Undo</span>
      </button>
      <span className="h-4 w-px shrink-0 bg-slate-200" aria-hidden />
      <button
        type="button"
        disabled={!canRedo}
        title={`Redo (${hints.redo})`}
        aria-label={`Redo, ${hints.redo}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().redo().run()}
        className={`${baseBtn} ${canRedo ? enabled : disabled}`}
      >
        <Redo2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        <span className="hidden min-[380px]:inline">Redo</span>
      </button>
    </div>
  );
}

function ToolBtn({
  active,
  disabled,
  onClick,
  title,
  children,
  danger,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-all duration-150 ${
        disabled
          ? "cursor-not-allowed opacity-30"
          : active
          ? "bg-blue-100 text-blue-700 shadow-inner"
          : danger
          ? "text-slate-500 hover:bg-red-50 hover:text-red-500"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   Font Size dropdown
───────────────────────────────────────── */
function FontSizeSelect({ editor }: { editor: Editor }) {
  const fontSize =
    useEditorState({
      editor,
      selector: (s) =>
        (s.editor.getAttributes("textStyle").fontSize as string | undefined) ?? "",
    }) ?? "";

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5">
      <Type className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
      <select
        title="Font size"
        className="cursor-pointer bg-transparent text-xs font-medium text-slate-700 outline-none"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor.chain().focus().unsetFontSize().run();
          else editor.chain().focus().setFontSize(v).run();
        }}
        value={fontSize}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((sz) => (
          <option key={sz} value={sz}>
            {sz.replace("px", "")}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─────────────────────────────────────────
   Color Picker (text color or highlight)
───────────────────────────────────────── */
type ColorMode = "color" | "backgroundColor";

function ColorPickerBtn({
  editor,
  mode,
}: {
  editor: Editor;
  mode: ColorMode;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentValue =
    useEditorState({
      editor,
      selector: (s) =>
        (s.editor.getAttributes("textStyle")[mode] as string | null | undefined) ?? "",
    }) ?? "";

  const presets = mode === "color" ? PRESET_TEXT_COLORS : PRESET_HIGHLIGHTS;
  const isTextColor = mode === "color";

  const apply = (color: string) => {
    if (!color || color === "transparent") {
      if (isTextColor) editor.chain().focus().unsetColor().run();
      else editor.chain().focus().unsetBackgroundColor().run();
    } else {
      if (isTextColor) editor.chain().focus().setColor(color).run();
      else editor.chain().focus().setBackgroundColor(color).run();
    }
    setOpen(false);
  };

  /* Close on click-outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const indicatorColor =
    currentValue && currentValue !== "transparent" ? currentValue : undefined;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        title={isTextColor ? "Text color" : "Highlight color"}
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={`flex flex-col items-center gap-0.5 rounded-md p-1.5 transition-colors ${
          open
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {isTextColor ? (
          <Palette className="h-3.5 w-3.5" />
        ) : (
          <Highlighter className="h-3.5 w-3.5" />
        )}
        <span
          className="h-0.5 w-3.5 rounded-full"
          style={{
            backgroundColor: indicatorColor
              ? indicatorColor
              : isTextColor
              ? "#374151"
              : "#FEF08A",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-50 mt-1 w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Preset swatches */}
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {isTextColor ? "Text Color" : "Highlight"}
          </p>
          <div className="grid grid-cols-6 gap-1">
            {presets.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => apply(c)}
                className={`h-5 w-5 rounded-md border transition-transform hover:scale-110 ${
                  currentValue === c
                    ? "ring-2 ring-blue-500 ring-offset-1"
                    : "border-slate-200"
                }`}
                style={{
                  backgroundColor:
                    c === "transparent"
                      ? undefined
                      : c,
                  backgroundImage:
                    c === "transparent"
                      ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)"
                      : undefined,
                  backgroundSize: c === "transparent" ? "8px 8px" : undefined,
                }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <label className="flex flex-1 cursor-pointer items-center gap-1.5 text-xs text-slate-500">
              <span>Custom</span>
              <input
                type="color"
                className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                value={
                  indicatorColor && indicatorColor !== "transparent"
                    ? indicatorColor
                    : "#000000"
                }
                onChange={(e) => {
                  if (isTextColor)
                    editor.chain().focus().setColor(e.target.value).run();
                  else
                    editor
                      .chain()
                      .focus()
                      .setBackgroundColor(e.target.value)
                      .run();
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => apply("transparent")}
              className="rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-red-500"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Full formatting toolbar (always shown in edit mode)
───────────────────────────────────────── */
function Toolbar({
  editor,
  onInsertImage,
  onAttachFile,
  onInsertImageGrid,
  isUploadingAsset,
  uploadPercent,
  uploadError,
}: {
  editor: Editor;
  onInsertImage: () => void;
  onAttachFile: () => void;
  onInsertImageGrid: () => void;
  isUploadingAsset: boolean;
  uploadPercent: number | null;
  uploadError: string | null;
}) {
  const state = useEditorState({
    editor,
    selector: (s) => ({
      bold: s.editor.isActive("bold"),
      italic: s.editor.isActive("italic"),
      underline: s.editor.isActive("underline"),
      strike: s.editor.isActive("strike"),
      bulletList: s.editor.isActive("bulletList"),
      orderedList: s.editor.isActive("orderedList"),
      alignLeft: s.editor.isActive({ textAlign: "left" }),
      alignCenter: s.editor.isActive({ textAlign: "center" }),
      alignRight: s.editor.isActive({ textAlign: "right" }),
      alignJustify: s.editor.isActive({ textAlign: "justify" }),
    }),
  });

  if (!state) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
      <HistoryControls editor={editor} />

      <Divider />

      {/* Text style */}
      <ToolBtn
        title="Bold (Ctrl+B)"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" strokeWidth={2.5} />
      </ToolBtn>
      <ToolBtn
        title="Italic (Ctrl+I)"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" strokeWidth={2.25} />
      </ToolBtn>
      <ToolBtn
        title="Underline (Ctrl+U)"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" strokeWidth={2.25} />
      </ToolBtn>
      <ToolBtn
        title="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" strokeWidth={2.25} />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn
        title="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <ToolBtn
        title="Align left"
        active={state.alignLeft}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Align center"
        active={state.alignCenter}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Align right"
        active={state.alignRight}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Justify"
        active={state.alignJustify}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Font size */}
      <FontSizeSelect editor={editor} />

      <Divider />

      {/* Colors */}
      <ColorPickerBtn editor={editor} mode="color" />
      <ColorPickerBtn editor={editor} mode="backgroundColor" />

      <Divider />

      <ToolBtn
        title="Insert image"
        disabled={isUploadingAsset}
        onClick={onInsertImage}
      >
        {isUploadingAsset ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5" />
        )}
      </ToolBtn>
      <ToolBtn
        title="Attach file"
        disabled={isUploadingAsset}
        onClick={onAttachFile}
      >
        <Paperclip className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Insert image grid"
        disabled={isUploadingAsset}
        onClick={onInsertImageGrid}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Clear formatting */}
      <ToolBtn
        title="Clear all formatting"
        danger
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
      >
        <Eraser className="h-3.5 w-3.5" />
      </ToolBtn>
      {isUploadingAsset && (
        <span className="ml-1 text-[11px] font-medium text-blue-600">
          Uploading{uploadPercent != null ? ` ${uploadPercent}%` : "..."}
        </span>
      )}
      {!isUploadingAsset && uploadError && (
        <span className="ml-1 max-w-[360px] truncate text-[11px] font-medium text-red-600" title={uploadError}>
          {uploadError}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Mini bubble menu (appears on selection)
───────────────────────────────────────── */
function BubbleMenuInner({ editor }: { editor: Editor }) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkLabelDraft, setLinkLabelDraft] = useState("");
  const [linkHrefDraft, setLinkHrefDraft] = useState("");
  const [linkRange, setLinkRange] = useState<{ from: number; to: number } | null>(null);

  const state = useEditorState({
    editor,
    selector: (s) => ({
      bold: s.editor.isActive("bold"),
      italic: s.editor.isActive("italic"),
      underline: s.editor.isActive("underline"),
      strike: s.editor.isActive("strike"),
      link: s.editor.isActive("link"),
      hasSelection: !s.editor.state.selection.empty,
    }),
  });

  if (!state) return null;

  const openLinkEditModal = () => {
    // If caret is inside a link, expand to full link so rename works.
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").run();
    }
    const { state: editorState } = editor;
    const { from, to } = editorState.selection;
    const selectedText = editorState.doc.textBetween(from, to, " ").trim();
    const currentHref = (editor.getAttributes("link").href as string | undefined) ?? "";
    setLinkRange({ from, to });
    setLinkLabelDraft(selectedText || "Attachment");
    setLinkHrefDraft(currentHref);
    setIsLinkModalOpen(true);
  };

  const closeLinkEditModal = () => {
    setIsLinkModalOpen(false);
  };

  const saveLinkChanges = () => {
    const cleanLabel = createSafeAttachmentLabel(linkLabelDraft);
    if (!cleanLabel) return;
    const cleanHref = linkHrefDraft.trim();
    if (!cleanHref) return;
    const targetRange = linkRange ?? {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };

    editor
      .chain()
      .focus()
      .insertContentAt(
        targetRange,
        `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer">${cleanLabel}</a>`,
      )
      .run();
    closeLinkEditModal();
  };

  return (
    <>
      <ToolBtn
        title="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" strokeWidth={2.5} />
      </ToolBtn>
      <ToolBtn
        title="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolBtn>
      <span className="mx-0.5 h-4 w-px bg-slate-200" aria-hidden />
      <ColorPickerBtn editor={editor} mode="color" />
      <ColorPickerBtn editor={editor} mode="backgroundColor" />
      <span className="mx-0.5 h-4 w-px bg-slate-200" aria-hidden />
      <ToolBtn
        title={
          state.link
            ? "Edit selected link"
            : state.hasSelection
            ? "Add link to selected text"
            : "Select text to add a link"
        }
        disabled={!state.link && !state.hasSelection}
        onClick={openLinkEditModal}
      >
        {state.link ? <Pencil className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </ToolBtn>

      {isLinkModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(15,23,42,0.45)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeLinkEditModal(); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/30 overflow-hidden">

            {/* ── Header ── */}
            <div className="relative overflow-hidden px-6 py-5">
              {/* gradient accent strip */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg,#E0F2FE 0%,#EDE9FE 50%,#FFF7ED 100%)",
                  opacity: 0.6,
                }}
              />
              <div className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-slate-200/70">
                  <Link2 className="h-4 w-4 text-violet-500" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold leading-tight text-slate-800">
                    Edit attachment link
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Set a readable label and the destination URL
                  </p>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="space-y-4 px-6 pb-2 pt-4">
              {/* Link text */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Link text
                </label>
                <input
                  autoFocus
                  type="text"
                  value={linkLabelDraft}
                  onChange={(e) => setLinkLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveLinkChanges();
                    if (e.key === "Escape") closeLinkEditModal();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-150 focus:border-cyan-400 focus:bg-white focus:ring-3 focus:ring-cyan-100"
                  placeholder="e.g. Download Price List"
                />
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                  Destination URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkHrefDraft}
                    onChange={(e) => setLinkHrefDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveLinkChanges();
                      if (e.key === "Escape") closeLinkEditModal();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-3.5 pr-10 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-150 focus:border-violet-400 focus:bg-white focus:ring-3 focus:ring-violet-100"
                    placeholder="https://example.com/file.pdf"
                  />
                  {linkHrefDraft.trim() && (
                    <a
                      href={linkHrefDraft}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-violet-500"
                      title="Preview link"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* live preview pill */}
              {(linkLabelDraft.trim() || linkHrefDraft.trim()) && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Preview
                  </span>
                  <span className="mx-1 h-3 w-px shrink-0 bg-slate-200" />
                  <span className="truncate text-sm font-medium text-blue-600 underline decoration-blue-200 underline-offset-2">
                    {linkLabelDraft.trim() || "—"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-[10px] text-slate-400">
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[9px]">Enter</kbd>
                {" "}to save · {" "}
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[9px]">Esc</kbd>
                {" "}to cancel
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeLinkEditModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveLinkChanges}
                  disabled={!linkLabelDraft.trim() || !linkHrefDraft.trim()}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:from-cyan-600 hover:to-violet-600 hover:shadow-violet-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  Save link
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   Main SectionContentEditor
───────────────────────────────────────── */
export default function SectionContentEditor({
  value,
  onChange,
  editable = true,
  className = "",
  showFooterHint = true,
}: SectionContentEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const initialHtmlRef = useRef<string | null>(null);
  if (initialHtmlRef.current === null) {
    initialHtmlRef.current = normalizeIncomingHtml(value ?? "");
  }
  const [isFocused, setIsFocused] = useState(false);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [selectedGridLayoutId, setSelectedGridLayoutId] = useState<string>(GRID_LAYOUT_OPTIONS[1].id);
  const [selectedGridAspectRatio, setSelectedGridAspectRatio] = useState<GridAspectOption["id"]>("16/9");
  const [selectedGridFit, setSelectedGridFit] = useState<GridFitOption["id"]>("cover");
  const [selectedGridGap, setSelectedGridGap] = useState<GridGapOption["id"]>("normal");
  const [gridFiles, setGridFiles] = useState<File[]>([]);
  const [gridFilePreviews, setGridFilePreviews] = useState<string[]>([]);
  const [isGridDragActive, setIsGridDragActive] = useState(false);
  const [assetUploadError, setAssetUploadError] = useState<string | null>(null);

  const initialBidi = useMemo(
    () => analyzeEditorPlainText(plainTextFromHtml(initialHtmlRef.current ?? "")),
    [],
  );

  const uploadAsset = async (file: File): Promise<{ url: string; fileName: string } | null> => {
    setIsUploadingAsset(true);
    setUploadPercent(null);
    setAssetUploadError(null);
    try {
      const response = await uploadEditorAssetWithProgress(file, (_, __, percent) => {
        setUploadPercent(percent);
      });
      const url = resolveUploadedAssetUrl(response.file_path);
      if (!url) return null;
      return {
        url,
        fileName: response.original_filename || file.name,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload file.";
      setAssetUploadError(message);
      return null;
    } finally {
      setIsUploadingAsset(false);
      setUploadPercent(null);
    }
  };

  const insertUploadedFile = async (file: File) => {
    if (!editor || !editable) return;
    const validationError = getEditorAssetValidationError(file);
    if (validationError) {
      setAssetUploadError(validationError);
      return;
    }
    const uploaded = await uploadAsset(file);
    if (!uploaded) return;
    const isImage = file.type.startsWith(IMAGE_MIME_PREFIX);
    if (isImage) {
      editor
        .chain()
        .focus()
        .setImage({
          src: uploaded.url,
          alt: uploaded.fileName,
          title: uploaded.fileName,
        })
        .run();
      editor.chain().focus().createParagraphNear().run();
      return;
    }
    const label = createSafeAttachmentLabel(uploaded.fileName);
    editor
      .chain()
      .focus()
      .insertContent(
        `<a href="${uploaded.url}" target="_blank" rel="noopener noreferrer">Attachment: ${label}</a> `,
      )
      .run();
  };

  const insertImageGrid = async () => {
    if (!editor || !editable || gridFiles.length === 0) return;
    setAssetUploadError(null);
    const layout =
      GRID_LAYOUT_OPTIONS.find((option) => option.id === selectedGridLayoutId) ??
      GRID_LAYOUT_OPTIONS[1];
    const maxSlots = layout.rows * layout.cols;
    const candidateFiles = gridFiles
      .filter((file) => file.type.startsWith(IMAGE_MIME_PREFIX))
      .slice(0, maxSlots);
    const validFiles: File[] = [];
    const skippedFiles: string[] = [];
    for (const file of candidateFiles) {
      const validationError = getEditorAssetValidationError(file);
      if (validationError) {
        skippedFiles.push(file.name);
        continue;
      }
      validFiles.push(file);
    }
    if (skippedFiles.length > 0) {
      const maxVisible = 3;
      const visibleNames = skippedFiles.slice(0, maxVisible);
      const extraCount = skippedFiles.length - visibleNames.length;
      const suffix = extraCount > 0 ? ` and ${extraCount} more` : "";
      setAssetUploadError(
        `Skipped oversized files: ${visibleNames.join(", ")}${suffix}. Maximum size is 20MB per file.`,
      );
    }
    if (validFiles.length === 0) return;

    const uploadedImages: ImageGridImage[] = [];
    for (const file of validFiles) {
      const uploaded = await uploadAsset(file);
      if (!uploaded) continue;
      uploadedImages.push({ src: uploaded.url, alt: uploaded.fileName });
    }
    if (uploadedImages.length === 0) return;

    editor.chain().focus().insertContent({
      type: "imageGrid",
      attrs: {
        cols: layout.cols,
        rows: layout.rows,
        fit: selectedGridFit,
        aspectRatio: selectedGridAspectRatio,
        gap: selectedGridGap,
        images: uploadedImages,
      },
    }).run();

    setIsGridModalOpen(false);
    setGridFiles([]);
    setGridFilePreviews((prev) => { prev.forEach((u) => URL.revokeObjectURL(u)); return []; });
    setIsGridDragActive(false);
  };

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        paragraph: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BidiListItem,
      BidiBulletList,
      BidiOrderedList,
      BidiParagraph,
      TextStyleKit.configure({
        color: { types: ["textStyle"] },
        backgroundColor: { types: ["textStyle"] },
        fontFamily: false,
        lineHeight: false,
        fontSize: { types: ["textStyle"] },
        textStyle: { mergeNestedSpanStyles: true },
      }),
      TextAlign.configure({
        types: ["paragraph", "listItem"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "tiptap-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-uploaded-image",
        },
      }),
      ImageGridNode,
      Table.configure({
        resizable: false,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialHtmlRef.current ?? "",
    editable,
    editorProps: {
      attributes: {
        dir: initialBidi.dir,
        ...(initialBidi.lang ? { lang: initialBidi.lang } : {}),
        class: [
          "tiptap-section-editor",
          "max-w-none min-h-28 px-4 py-3 text-[15px] leading-relaxed text-gray-700",
          "focus:outline-none",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5",
          "[&_li]:my-1",
          "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          "[&_strong]:font-semibold",
          "[&_s]:line-through",
          "[&_mark]:rounded-sm [&_mark]:px-0.5",
          "[&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-200 [&_a]:underline-offset-2",
          "[&_img:not([data-grid-image='true'])]:my-2 [&_img:not([data-grid-image='true'])]:max-h-80 [&_img:not([data-grid-image='true'])]:w-auto [&_img:not([data-grid-image='true'])]:max-w-full [&_img:not([data-grid-image='true'])]:rounded-lg [&_img:not([data-grid-image='true'])]:border [&_img:not([data-grid-image='true'])]:border-slate-200 [&_img:not([data-grid-image='true'])]:shadow-sm",
          "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse",
          "[&_table_td]:border-0 [&_table_td]:align-top [&_table_td]:p-1.5",
          "[&_table_td_img]:my-0 [&_table_td_img]:h-auto [&_table_td_img]:max-h-56 [&_table_td_img]:w-full [&_table_td_img]:object-cover",
        ].join(" "),
      },
      handleDrop: (_view, event) => {
        const fileList = Array.from(event.dataTransfer?.files ?? []);
        if (fileList.length === 0) return false;
        event.preventDefault();
        void insertUploadedFile(fileList[0]);
        return true;
      },
      handlePaste: (_view, event) => {
        const fileList = Array.from(event.clipboardData?.files ?? []);
        if (fileList.length === 0) return false;
        event.preventDefault();
        void insertUploadedFile(fileList[0]);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    const incoming = normalizeIncomingHtml(value ?? "");
    if (incoming === editor.getHTML()) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
    const dom = editor.view.dom as HTMLElement;
    syncProseMirrorRootBidi(dom, editor.getText({ blockSeparator: "\n" }));
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const run = () => {
      const plain = editor.getText({ blockSeparator: "\n" });
      syncProseMirrorRootBidi(dom, plain);
    };
    run();
    editor.on("update", run);
    return () => {
      editor.off("update", run);
    };
  }, [editor]);

  const openImagePicker = () => {
    if (!editable || isUploadingAsset) return;
    setAssetUploadError(null);
    imageInputRef.current?.click();
  };

  const openAttachmentPicker = () => {
    if (!editable || isUploadingAsset) return;
    setAssetUploadError(null);
    attachmentInputRef.current?.click();
  };

  const openGridPickerModal = () => {
    if (!editable || isUploadingAsset) return;
    setAssetUploadError(null);
    setIsGridModalOpen(true);
  };

  const closeGridPickerModal = () => {
    if (isUploadingAsset) return;
    setIsGridModalOpen(false);
    setGridFiles([]);
    setGridFilePreviews((prev) => { prev.forEach((u) => URL.revokeObjectURL(u)); return []; });
    setSelectedGridLayoutId(GRID_LAYOUT_OPTIONS[1].id);
    setSelectedGridAspectRatio("16/9");
    setSelectedGridFit("cover");
    setSelectedGridGap("normal");
    setIsGridDragActive(false);
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void insertUploadedFile(file);
    event.target.value = "";
  };

  const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void insertUploadedFile(file);
    event.target.value = "";
  };

  const handleGridFilesInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith(IMAGE_MIME_PREFIX),
    );
    setGridFilePreviews((prev) => { prev.forEach((u) => URL.revokeObjectURL(u)); return files.map((f) => URL.createObjectURL(f)); });
    setGridFiles(files);
    setSelectedGridLayoutId(suggestGridLayoutId(files.length));
    event.target.value = "";
  };

  const removeGridFile = (index: number) => {
    setGridFilePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setGridFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGridFile = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= gridFiles.length) return;
    setGridFiles((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setGridFilePreviews((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const applyGridFiles = (files: File[]) => {
    if (files.length === 0) return;
    setGridFilePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
    setGridFiles(files);
    setSelectedGridLayoutId(suggestGridLayoutId(files.length));
  };

  const handleGridDrop = (event: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsGridDragActive(false);
    const files = Array.from(event.dataTransfer.files ?? []).filter((file) =>
      file.type.startsWith(IMAGE_MIME_PREFIX),
    );
    applyGridFiles(files);
  };

  const selectedGridLayout =
    GRID_LAYOUT_OPTIONS.find((option) => option.id === selectedGridLayoutId) ??
    GRID_LAYOUT_OPTIONS[1];
  const selectedGridSlots = selectedGridLayout.rows * selectedGridLayout.cols;
  const selectedGridGapPx = gapPxForOption(selectedGridGap);
  const filesUsedInGrid = gridFiles.slice(0, selectedGridSlots);

  useEffect(() => {
    if (!isGridModalOpen || typeof document === "undefined") return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    body.dataset.gridModalOpen = "true";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      delete body.dataset.gridModalOpen;
    };
  }, [isGridModalOpen]);

  if (!editor) {
    return (
      <div
        className={`min-h-28 rounded-xl border border-slate-200/60 bg-white/40 ${className}`}
        aria-hidden
      />
    );
  }

  const gridModal = isGridModalOpen ? (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/55 backdrop-blur-[3px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeGridPickerModal(); }}
    >
      <div className="flex h-full w-full items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="flex h-[min(960px,calc(100dvh-16px))] w-full max-w-[1380px] flex-col overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/25 sm:h-[min(960px,calc(100dvh-32px))] sm:rounded-[28px]">
          <div className="relative shrink-0 overflow-hidden border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg,#E8F8FF 0%,#F5EEFF 50%,#FFF7ED 100%)", opacity: 0.8 }} />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-slate-200/70">
                    <LayoutGrid className="h-5 w-5 text-violet-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-semibold leading-tight text-slate-900 sm:text-[22px]">Insert image grid</p>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      Upload, reorder, tune the layout, then insert one polished gallery block.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
                    Full-screen workspace
                  </span>
                  <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
                    {gridFiles.length} selected
                  </span>
                  <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
                    {selectedGridLayout.label} layout
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeGridPickerModal}
                disabled={isUploadingAsset}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/70 hover:text-slate-600 disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-h-0 overflow-y-auto">
              <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6">
                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">1 · Photos</p>
                    {gridFiles.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {gridFiles.length} selected
                      </span>
                    )}
                  </div>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition sm:px-6 sm:py-10 ${
                      isGridDragActive
                        ? "border-violet-400 bg-violet-50/60"
                        : "border-slate-200 bg-slate-50/60 hover:border-violet-300 hover:bg-violet-50/30"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsGridDragActive(true);
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsGridDragActive(true);
                    }}
                    onDragLeave={(event) => {
                      if (event.target === event.currentTarget) setIsGridDragActive(false);
                    }}
                    onDrop={handleGridDrop}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <Images className="h-7 w-7 text-violet-500" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-700">Drop images here or click to browse</div>
                      <div className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP, GIF. Use multiple images at once.</div>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                      Choose images
                    </div>
                    <input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES}
                      multiple
                      onChange={handleGridFilesInputChange}
                      className="hidden"
                    />
                  </label>

                  {gridFilePreviews.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      {gridFilePreviews.map((previewUrl, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            <img
                              src={previewUrl}
                              alt={gridFiles[index]?.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-white">
                              <GripVertical className="h-3 w-3" />
                              {index + 1}
                            </div>
                          </div>
                          <div className="space-y-3 p-3">
                            <p className="truncate text-sm font-medium text-slate-700">{gridFiles[index]?.name}</p>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveGridFile(index, -1)}
                                  disabled={index === 0}
                                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-35"
                                  title="Move earlier"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveGridFile(index, 1)}
                                  disabled={index === gridFilePreviews.length - 1}
                                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-35"
                                  title="Move later"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeGridFile(index)}
                                className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">2 · Layout</p>
                    {gridFiles.length > 0 && (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                        Recommended automatically
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    {GRID_LAYOUT_OPTIONS.map((layout) => {
                      const isSelected = selectedGridLayoutId === layout.id;
                      const slots = layout.rows * layout.cols;
                      const overLimit = gridFiles.length > slots;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setSelectedGridLayoutId(layout.id)}
                          className={`rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="mb-3 grid h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-white"
                            style={{
                              gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
                              gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
                              gap: "2px",
                            }}
                          >
                            {Array.from({ length: slots }, (_, idx) => {
                              const filled = idx < gridFiles.length;
                              return (
                                <span
                                  key={`${layout.id}-${idx}`}
                                  className={`rounded-[2px] ${filled ? "bg-violet-300" : "bg-slate-200"}`}
                                />
                              );
                            })}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800">{layout.label}</span>
                            {isSelected && <Check className="h-4 w-4 text-violet-500" />}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{layout.description}</p>
                          {overLimit && <span className="mt-2 block text-[11px] font-medium text-amber-600">Only first {slots} images will be used</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">3 · Crop style</p>
                    <div className="grid gap-2">
                      {GRID_FIT_OPTIONS.map((option) => {
                        const active = selectedGridFit === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedGridFit(option.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="text-sm font-semibold text-slate-800">{option.label}</div>
                            <div className="mt-1 text-xs text-slate-500">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">4 · Frame ratio</p>
                    <div className="grid gap-2">
                      {GRID_ASPECT_OPTIONS.map((option) => {
                        const active = selectedGridAspectRatio === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedGridAspectRatio(option.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                              {option.id === "16/9" ? <Monitor className="h-4 w-4" /> : option.id === "1/1" ? <Square className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
                              {option.label}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-2 2xl:col-span-1">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">5 · Spacing</p>
                    <div className="grid gap-2">
                      {GRID_GAP_OPTIONS.map((option) => {
                        const active = selectedGridGap === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedGridGap(option.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="text-sm font-semibold text-slate-800">{option.label}</div>
                            <div className="mt-1 text-xs text-slate-500">{option.px}px gap between images</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <aside className="min-h-0 border-t border-slate-100 bg-slate-50/70 xl:border-l xl:border-t-0">
              <div className="h-full overflow-y-auto p-4 sm:p-6">
                <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">Live preview</p>
                    <p className="mt-1 text-xs text-slate-500">This is how the gallery block will be inserted.</p>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <div className="font-semibold text-slate-700">Layout</div>
                        <div>{selectedGridLayout.label}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <div className="font-semibold text-slate-700">Used</div>
                        <div>{Math.min(gridFiles.length, selectedGridSlots)} / {selectedGridSlots}</div>
                      </div>
                    </div>
                    <div
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${selectedGridLayout.cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${selectedGridLayout.rows}, minmax(0, 1fr))`,
                        gap: `${selectedGridGapPx}px`,
                      }}
                    >
                      {Array.from({ length: selectedGridSlots }, (_, index) => {
                        const previewUrl = gridFilePreviews[index];
                        return (
                          <div
                            key={`preview-slot-${index}`}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                            style={{ aspectRatio: selectedGridAspectRatio }}
                          >
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={gridFiles[index]?.name}
                                className="h-full w-full"
                                style={{ objectFit: selectedGridFit, objectPosition: "center" }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-slate-300">
                                Empty
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                      {gridFiles.length > selectedGridSlots
                        ? `The preview uses the first ${selectedGridSlots} images. Reorder selected photos to control which ones appear.`
                        : "Your current image order defines the gallery reading order in the document."}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {isUploadingAsset && uploadPercent != null ? (
                  <>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                        style={{ width: `${uploadPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{uploadPercent}%</span>
                  </>
                ) : (
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500">
                      {gridFiles.length === 0
                        ? "Select images to unlock layout and preview options."
                        : `Ready to insert ${Math.min(filesUsedInGrid.length, selectedGridSlots)} image${Math.min(filesUsedInGrid.length, selectedGridSlots) === 1 ? "" : "s"} as a ${selectedGridLayout.label} block.`}
                    </p>
                    {assetUploadError && (
                      <p className="mt-1 truncate text-xs font-medium text-red-600" title={assetUploadError}>
                        {assetUploadError}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeGridPickerModal}
                  disabled={isUploadingAsset}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void insertImageGrid()}
                  disabled={gridFiles.length === 0 || isUploadingAsset}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:from-cyan-600 hover:to-violet-600 hover:shadow-violet-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {isUploadingAsset
                    ? "Uploading…"
                    : `Insert ${Math.min(filesUsedInGrid.length, selectedGridSlots) || ""} image${Math.min(filesUsedInGrid.length, selectedGridSlots) === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      {editable ? (
        /* ── Edit mode wrapper ── */
        <div
          className={`overflow-hidden rounded-xl border transition-all duration-200 ${
            isFocused
              ? "border-blue-300 shadow-md shadow-blue-100/60 ring-2 ring-blue-200/50"
              : "border-slate-200/80 hover:border-slate-300"
          } bg-white/80`}
        >
          {/* Toolbar: stack above the bubble (floating UI is a sibling inside the editor wrapper). */}
          <div
            dir="ltr"
            className={`relative z-50 isolate border-b transition-colors duration-200 ${
              isFocused ? "border-blue-100 bg-slate-50/80" : "border-slate-100 bg-slate-50/60"
            }`}
          >
            <Toolbar
              editor={editor}
              onInsertImage={openImagePicker}
              onAttachFile={openAttachmentPicker}
              onInsertImageGrid={openGridPickerModal}
              isUploadingAsset={isUploadingAsset}
              uploadPercent={uploadPercent}
              uploadError={assetUploadError}
            />
          </div>

          {/*
            Floating menu: (1) anchor to the bottom edge of the selection so tall / "select all"
            rects do not push the menu to the side (left/right flip overlapped section controls).
            (2) disable flip so we never move to top (toolbar) or sides.
          */}
          <BubbleMenu
            dir="ltr"
            editor={editor}
            getReferencedVirtualElement={() => {
              const { view, state } = editor;
              const { selection } = state;
              if (selection.empty) return null;
              const full = posToDOMRect(view, selection.from, selection.to);
              const stripH = Math.min(20, Math.max(4, full.height * 0.06));
              const r = new DOMRect(full.left, full.bottom - stripH, full.width, stripH);
              return {
                getBoundingClientRect: () => r,
                getClientRects: () => [r],
              };
            }}
            options={{
              placement: "bottom",
              strategy: "absolute",
              offset: 10,
              flip: false,
              shift: { padding: 12 },
            }}
            className="pointer-events-auto z-10 flex max-w-[min(100vw-1rem,28rem)] flex-wrap items-center gap-0.5 rounded-xl border border-slate-200/95 bg-white px-1.5 py-1 shadow-2xl shadow-slate-900/15 backdrop-blur-md"
          >
            <BubbleMenuInner editor={editor} />
          </BubbleMenu>

          {/* Editor content */}
          <EditorContent editor={editor} />

          <input
            ref={imageInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleImageInputChange}
          />
          <input
            ref={attachmentInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            className="hidden"
            onChange={handleAttachmentInputChange}
          />

          {/* Character hint at bottom when focused */}
          {showFooterHint && isFocused && (
            <div className="border-t border-slate-100/80 px-4 py-1.5">
              <p className="text-[10px] leading-relaxed text-slate-400">
                <span className="font-medium text-slate-500">Undo / Redo</span> in the toolbar
                (or keyboard) · select text for the floating menu · saves automatically
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Read-only: no wrapper styling needed, editor handles it ── */
        <EditorContent editor={editor} />
      )}
      {gridModal && typeof document !== "undefined" ? createPortal(gridModal, document.body) : null}
    </div>
  );
}
