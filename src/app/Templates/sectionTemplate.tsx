"use client";

import React, { useState } from "react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SectionColorPaletteModal, {
  ColorPalette,
  PREDEFINED_PALETTES,
} from "../components/SectionColorPaletteModal";
import SectionContentEditor from "../components/SectionContentEditor";
import {
  legacySectionContentToHtml,
  sectionContentLooksLikeHtml,
} from "../utils/legacySectionContentToHtml";

/**
 * Customizable Section Template Component
 *
 * Section body copy is edited with Tiptap (per section). Stored `content` is HTML
 * compatible with the backend `Section.content: string` field.
 */
export interface SectionTemplateProps {
  title?: string;
  content: string | React.ReactNode;
  type?: "section" | "day" | "included" | "excluded" | "notes";

  editable?: boolean;
  onContentChange?: (newContent: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onDelete?: () => void;
  onAddAfter?: () => void;

  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  titleClassName?: string;
  titleSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  titleColor?: string;
  titleWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  showTitle?: boolean;

  contentClassName?: string;
  contentSize?: "xs" | "sm" | "base" | "lg" | "xl";
  contentColor?: string;
  contentAlignment?: "left" | "center" | "right" | "justify";
  preserveWhitespace?: boolean;
  parseParagraphs?: boolean;

  showUnderline?: boolean;
  underlineColor?: string;
  underlineWidth?: string;
  underlineGradient?: {
    from: string;
    to: string;
  };
  showDivider?: boolean;
  dividerPosition?: "top" | "bottom";

  marginBottom?: string;
  padding?: string;
  titleMarginBottom?: string;
  contentMarginTop?: string;

  containerClassName?: string;
  backgroundColor?: string;
  border?: boolean;
  borderColor?: string;
  rounded?: boolean;
  shadow?: boolean;

  className?: string;
  style?: React.CSSProperties;

  colorPalette?: ColorPalette;
  onColorPaletteChange?: (palette: ColorPalette) => void;
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  content,
  type = "section",
  editable = true,
  onContentChange,
  onTitleChange,
  onDelete,
  onAddAfter,
  titleLevel = 2,
  titleClassName = "",
  titleColor = "text-gray-900",
  titleWeight = "bold",
  showTitle = true,
  contentClassName = "",
  contentColor = "text-gray-700",
  contentAlignment = "justify",
  showUnderline = true,
  underlineColor,
  underlineWidth = "w-20",
  underlineGradient,
  showDivider = false,
  dividerPosition = "bottom",
  marginBottom = "mb-10",
  padding = "",
  titleMarginBottom = "mb-6",
  contentMarginTop = "",
  containerClassName = "",
  backgroundColor,
  border = false,
  borderColor = "border-gray-200",
  rounded = false,
  shadow = false,
  className = "",
  style,
  colorPalette,
  onColorPaletteChange,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showColorPaletteModal, setShowColorPaletteModal] = useState(false);

  const currentPalette = colorPalette || PREDEFINED_PALETTES.default;

  const HeadingTag = `h${titleLevel}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";

  const titleClasses = [
    "text-lg font-bold",
    titleColor || "text-gray-900",
    titleMarginBottom || "mb-4",
    "tracking-tight",
    "leading-tight",
    titleClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    contentClassName,
    "text-sm",
    contentColor || "text-gray-700",
    `text-${contentAlignment}`,
    "leading-relaxed",
    contentMarginTop,
  ]
    .filter(Boolean)
    .join(" ");

  const getSectionClasses = () => {
    const baseClasses = [
      "section-template",
      "mb-6",
      "last:mb-0",
      "transition-all",
      "duration-300",
      "hover:shadow-xl",
      "relative",
      containerClassName,
      className,
    ];

    if (currentPalette && currentPalette.type !== "default") {
      baseClasses.push(
        "rounded-2xl",
        "p-8",
        "shadow-lg",
        "border",
        "border-gray-200"
      );
    } else {
      if (type === "day") {
        baseClasses.push(
          "bg-gradient-to-br",
          "from-cyan-50",
          "to-blue-50",
          "border-l-4",
          "border-cyan-400",
          "rounded-2xl",
          "p-8",
          "shadow-lg",
          "hover:from-cyan-100",
          "hover:to-blue-100",
          "hover:border-cyan-500"
        );
      } else if (type === "included" || type === "excluded") {
        const colorScheme =
          type === "included"
            ? [
                "from-emerald-50",
                "to-green-50",
                "border-emerald-400",
                "hover:from-emerald-100",
                "hover:to-green-100",
                "hover:border-emerald-500",
              ]
            : [
                "from-rose-50",
                "to-pink-50",
                "border-rose-400",
                "hover:from-rose-100",
                "hover:to-pink-100",
                "hover:border-rose-500",
              ];

        baseClasses.push(
          "bg-gradient-to-br",
          ...colorScheme,
          "border-l-4",
          "rounded-2xl",
          "p-8",
          "shadow-lg"
        );
      } else if (backgroundColor && !backgroundColor.startsWith("bg-")) {
        baseClasses.push(
          "rounded-2xl",
          "p-8",
          "shadow-lg",
          "border",
          "border-gray-200",
          "bg-white",
          "hover:shadow-xl"
        );
      } else if (backgroundColor) {
        baseClasses.push(
          backgroundColor,
          "rounded-2xl",
          "p-8",
          "shadow-lg",
          "border",
          "border-gray-200",
          "hover:shadow-xl"
        );
      } else {
        baseClasses.push(
          "bg-gradient-to-br",
          "from-white",
          "via-gray-50",
          "to-blue-50",
          "border",
          "border-gray-200",
          "rounded-2xl",
          "p-8",
          "shadow-lg",
          "hover:shadow-xl",
          "hover:from-blue-50",
          "hover:via-white",
          "hover:to-purple-50",
          "hover:border-blue-200"
        );
      }
    }

    if (border && !baseClasses.some((c) => c.includes("border-"))) {
      baseClasses.push(`border ${borderColor}`);
    }
    if (shadow) baseClasses.push("shadow-2xl");

    return baseClasses.filter(Boolean).join(" ");
  };

  const containerClasses = getSectionClasses();

  const containerStyle: React.CSSProperties = {
    position: "relative",
    ...(backgroundColor &&
      !backgroundColor.startsWith("bg-") && { backgroundColor }),
    ...(currentPalette &&
      currentPalette.type !== "default" &&
      currentPalette.applyBackground !== false && {
        background: currentPalette.colors.background,
      }),
    ...style,
  };

  const getPaletteColor = (
    colorType: "primary" | "secondary" | "accent" | "text"
  ) => {
    if (currentPalette && currentPalette.type !== "default") {
      return currentPalette.colors[colorType];
    }
    return undefined;
  };

  const renderStringContent = () => {
    if (typeof content !== "string") return null;

    if (editable && onContentChange) {
      return (
        <SectionContentEditor
          value={content}
          onChange={onContentChange}
          editable
          className={contentClasses}
        />
      );
    }

    const html = sectionContentLooksLikeHtml(content)
      ? content
      : legacySectionContentToHtml(content);

    return (
      <div
        className={`section-html-content max-w-none ${contentClasses} [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:my-1`}
        style={{ fontSize: "15px", lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const renderReactNodeContent = () => {
    if (typeof content === "string") return null;
    return (
      <div className={`content ${contentClasses}`}>
        {editable && onContentChange ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              onContentChange(e.currentTarget.innerHTML || "");
            }}
          >
            {content}
          </div>
        ) : (
          content
        )}
      </div>
    );
  };

  return (
    <section className={containerClasses} style={containerStyle}>
      {editable && onColorPaletteChange && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowColorPaletteModal(true);
          }}
          className="absolute top-3 left-3 p-2 rounded-full transition-all duration-200 hover:bg-blue-500 group no-pdf-export bg-blue-100 shadow-md border border-blue-300 hover:shadow-lg hover:scale-105 z-10"
          title="Edit color palette"
          aria-label="Edit color palette"
          type="button"
        >
          <svg
            className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </button>
      )}

      {editable && onDelete && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:bg-red-500 no-pdf-export bg-gray-100 shadow-md border border-gray-300 hover:shadow-lg hover:scale-105 z-10"
            title="Delete section"
            aria-label="Delete this section"
          >
            <svg
              className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={onDelete}
            title="Delete Section"
            message="Are you sure you want to delete this section? This action cannot be undone."
          />
        </>
      )}

      {showDivider && dividerPosition === "top" && (
        <div className={`border-t ${borderColor} mb-6`} />
      )}

      {showTitle && title && (
        <div className="mb-6 text-center relative">
          <HeadingTag
            className={`${titleClasses} ${
              editable
                ? "cursor-text hover:bg-blue-50 rounded-lg px-4 py-3 transition-all duration-200 inline-block"
                : ""
            } relative z-10 mx-auto`}
            style={{
              fontSize: "20px",
              lineHeight: "1.3",
              letterSpacing: "0.5px",
            }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              if (editable && onTitleChange) {
                onTitleChange(e.currentTarget.textContent || "");
              }
            }}
            onClick={(e) => {
              if (editable && e.currentTarget !== document.activeElement) {
                e.currentTarget.focus();
              }
            }}
          >
            {title}
          </HeadingTag>
          <div className="flex items-center justify-center space-x-3 mt-4">
            <div
              className="h-0.5 w-12 bg-gradient-to-r from-transparent rounded-full"
              style={{
                background: getPaletteColor("primary")
                  ? `linear-gradient(to right, transparent, ${getPaletteColor("primary")})`
                  : "linear-gradient(to right, transparent, #06B6D4)",
              }}
            />
            <div
              className="h-1.5 w-20 rounded-full shadow-lg"
              style={{
                background:
                  getPaletteColor("primary") &&
                  getPaletteColor("secondary") &&
                  getPaletteColor("accent")
                    ? `linear-gradient(to right, ${getPaletteColor("primary")}, ${getPaletteColor("secondary")}, ${getPaletteColor("accent")})`
                    : "linear-gradient(to right, #06B6D4, #3B82F6, #8B5CF6)",
              }}
            />
            <div
              className="h-0.5 w-12 bg-gradient-to-r rounded-full"
              style={{
                background: getPaletteColor("accent")
                  ? `linear-gradient(to right, ${getPaletteColor("accent")}, transparent)`
                  : "linear-gradient(to right, #8B5CF6, transparent)",
              }}
            />
          </div>
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-12 h-12 rounded-full opacity-40 blur-sm"
            style={{
              background:
                getPaletteColor("primary") &&
                getPaletteColor("secondary") &&
                getPaletteColor("accent")
                  ? `linear-gradient(to bottom right, ${getPaletteColor("primary")}40, ${getPaletteColor("secondary")}40, ${getPaletteColor("accent")}40)`
                  : "linear-gradient(to bottom right, #06B6D440, #3B82F640, #8B5CF640)",
            }}
          />
        </div>
      )}

      <div className="relative">
        {typeof content === "string" ? renderStringContent() : renderReactNodeContent()}
      </div>

      {showDivider && dividerPosition === "bottom" && (
        <div className={`border-t ${borderColor} mt-6`} />
      )}

      {editable && onColorPaletteChange && (
        <SectionColorPaletteModal
          isOpen={showColorPaletteModal}
          onClose={() => setShowColorPaletteModal(false)}
          onSave={(palette) => {
            onColorPaletteChange(palette);
            setShowColorPaletteModal(false);
          }}
          currentPalette={currentPalette}
        />
      )}

      {editable && onAddAfter && (
        <div className="flex justify-center mt-6 mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddAfter();
            }}
            className="group relative px-6 py-3 rounded-2xl border-4 border-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 no-pdf-export shadow-xl hover:shadow-2xl overflow-hidden"
            style={{
              background:
                getPaletteColor("primary") &&
                getPaletteColor("secondary") &&
                getPaletteColor("accent")
                  ? `linear-gradient(to right, ${getPaletteColor("primary")}, ${getPaletteColor("secondary")}, ${getPaletteColor("accent")})`
                  : "linear-gradient(to right, #06B6D4, #3B82F6, #8B5CF6)",
            }}
            title="Add section below"
            aria-label="Add new section after this one"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg
              className="w-5 h-5 text-white transition-all duration-300 group-hover:scale-125 group-hover:rotate-90 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-white font-semibold text-sm tracking-wide relative z-10">
              Add Section Below
            </span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-400 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-300 animate-pulse opacity-10" />
          </button>
        </div>
      )}
    </section>
  );
};

export default SectionTemplate;
