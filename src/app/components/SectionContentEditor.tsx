"use client";

import { useEffect } from "react";
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
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
} from "lucide-react";
import { legacySectionContentToHtml } from "../utils/legacySectionContentToHtml";

const FONT_SIZES = ["12px", "14px", "15px", "16px", "18px", "20px", "24px"] as const;

function normalizeIncomingHtml(raw: string): string {
  return legacySectionContentToHtml(raw || "");
}

export interface SectionContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  editable?: boolean;
  className?: string;
}

function MenuBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-colors ${
        active
          ? "bg-slate-200 text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function FontSizeSelect({ editor }: { editor: Editor }) {
  const fontSize =
    useEditorState({
      editor,
      selector: (s) =>
        (s.editor.getAttributes("textStyle").fontSize as string | undefined) ??
        "",
    }) ?? "";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200/90 bg-slate-50/90 px-1.5 py-0.5">
      <Type className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
      <select
        title="Font size"
        className="max-w-22 cursor-pointer bg-transparent text-xs font-medium text-slate-700 outline-none"
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(v).run();
          }
        }}
        value={fontSize}
      >
        <option value="">Default</option>
        {FONT_SIZES.map((sz) => (
          <option key={sz} value={sz}>
            {sz.replace("px", " px")}
          </option>
        ))}
      </select>
    </div>
  );
}

function BubbleMenuInner({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: (s) => ({
      bold: s.editor.isActive("bold"),
      italic: s.editor.isActive("italic"),
      underline: s.editor.isActive("underline"),
      bulletList: s.editor.isActive("bulletList"),
      orderedList: s.editor.isActive("orderedList"),
      alignLeft: s.editor.isActive({ textAlign: "left" }),
      alignCenter: s.editor.isActive({ textAlign: "center" }),
      alignRight: s.editor.isActive({ textAlign: "right" }),
    }),
  });

  if (!state) return null;

  return (
    <>
      <MenuBtn
        title="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <MenuBtn
        title="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <MenuBtn
        title="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden />
      <MenuBtn
        title="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <MenuBtn
        title="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden />
      <MenuBtn
        title="Align left"
        active={state.alignLeft}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <MenuBtn
        title="Align center"
        active={state.alignCenter}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <MenuBtn
        title="Align right"
        active={state.alignRight}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" strokeWidth={2.25} />
      </MenuBtn>
      <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden />
      <FontSizeSelect editor={editor} />
    </>
  );
}

export default function SectionContentEditor({
  value,
  onChange,
  editable = true,
  className = "",
}: SectionContentEditorProps) {
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
        color: false,
        backgroundColor: false,
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
          "max-w-none min-h-[8rem] rounded-xl px-1 py-2 text-[15px] leading-relaxed text-gray-700",
          "focus:outline-none",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_li]:my-0.5 [&_p]:my-1",
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
        className={`min-h-[8rem] rounded-xl border border-slate-200/90 bg-white/50 ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {editable && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top", offset: 8, flip: true }}
          className="flex max-w-[min(100vw-2rem,28rem)] flex-wrap items-center gap-0.5 rounded-2xl border border-slate-200/95 bg-white/98 px-2 py-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-sm"
        >
          <BubbleMenuInner editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
