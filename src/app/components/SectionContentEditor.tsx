"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
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
} from "lucide-react";
import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { legacySectionContentToHtml } from "../utils/legacySectionContentToHtml";

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

export interface SectionContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  editable?: boolean;
  className?: string;
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
          className="absolute left-1/2 top-full z-[99999] mt-1 w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10"
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
function Toolbar({ editor }: { editor: Editor }) {
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
    </div>
  );
}

/* ─────────────────────────────────────────
   Mini bubble menu (appears on selection)
───────────────────────────────────────── */
function BubbleMenuInner({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: (s) => ({
      bold: s.editor.isActive("bold"),
      italic: s.editor.isActive("italic"),
      underline: s.editor.isActive("underline"),
      strike: s.editor.isActive("strike"),
    }),
  });

  if (!state) return null;

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
}: SectionContentEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
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
    ],
    content: normalizeIncomingHtml(value ?? ""),
    editable,
    editorProps: {
      attributes: {
        class: [
          "tiptap-section-editor",
          "max-w-none min-h-28 px-4 py-3 text-[15px] leading-relaxed text-gray-700",
          "focus:outline-none",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_li]:my-1",
          "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          "[&_strong]:font-semibold",
          "[&_s]:line-through",
          "[&_mark]:rounded-sm [&_mark]:px-0.5",
        ].join(" "),
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
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={`min-h-28 rounded-xl border border-slate-200/60 bg-white/40 ${className}`}
        aria-hidden
      />
    );
  }

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
          {/* Toolbar */}
          <div
            className={`border-b transition-colors duration-200 ${
              isFocused ? "border-blue-100 bg-slate-50/80" : "border-slate-100 bg-slate-50/60"
            }`}
          >
            <Toolbar editor={editor} />
          </div>

          {/* BubbleMenu for quick selection formatting */}
          <BubbleMenu
            editor={editor}
            options={{ placement: "top", offset: 10, flip: true }}
            className="flex items-center gap-0.5 rounded-xl border border-slate-200/95 bg-white px-1.5 py-1 shadow-2xl shadow-slate-900/15 backdrop-blur-md"
          >
            <BubbleMenuInner editor={editor} />
          </BubbleMenu>

          {/* Editor content */}
          <EditorContent editor={editor} />

          {/* Character hint at bottom when focused */}
          {isFocused && (
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
    </div>
  );
}
