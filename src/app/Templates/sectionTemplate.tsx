"use client";

import React, { useState, useEffect, useRef } from "react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SectionColorPaletteModal, { ColorPalette, PREDEFINED_PALETTES, ColorPaletteType } from "../components/SectionColorPaletteModal";

/**
 * Customizable Section Template Component
 * 
 * A flexible section component for displaying document sections with customizable:
 * - Title styling and hierarchy
 * - Content formatting
 * - Spacing and layout
 * - Decorative elements
 * - Typography
 */
export interface SectionTemplateProps {
  title?: string;
  content: string | React.ReactNode;
  type?: 'section' | 'day' | 'included' | 'excluded' | 'notes';
  
  // Editable Configuration
  editable?: boolean;
  onContentChange?: (newContent: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onDelete?: () => void;
  onAddAfter?: () => void;
  
  // Title Configuration
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  titleClassName?: string;
  titleSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  titleColor?: string;
  titleWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  showTitle?: boolean;
  
  // Content Configuration
  contentClassName?: string;
  contentSize?: "xs" | "sm" | "base" | "lg" | "xl";
  contentColor?: string;
  contentAlignment?: "left" | "center" | "right" | "justify";
  preserveWhitespace?: boolean;
  parseParagraphs?: boolean;
  
  // Decorative Elements
  showUnderline?: boolean;
  underlineColor?: string;
  underlineWidth?: string;
  underlineGradient?: {
    from: string;
    to: string;
  };
  showDivider?: boolean;
  dividerPosition?: "top" | "bottom";
  
  // Spacing Configuration
  marginBottom?: string;
  padding?: string;
  titleMarginBottom?: string;
  contentMarginTop?: string;
  
  // Layout Configuration
  containerClassName?: string;
  backgroundColor?: string;
  border?: boolean;
  borderColor?: string;
  rounded?: boolean;
  shadow?: boolean;
  
  // Additional customization
  className?: string;
  style?: React.CSSProperties;
  
  // Text Splitting Configuration
  enableTextSplitting?: boolean;
  
  // Color Palette Configuration
  colorPalette?: ColorPalette;
  onColorPaletteChange?: (palette: ColorPalette) => void;
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  content,
  type = 'section',
  // Editable
  editable = true,
  onContentChange,
  onTitleChange,
  onDelete,
  onAddAfter,
  // Title
  titleLevel = 2,
  titleClassName = "",
  titleSize = "3xl",
  titleColor = "text-gray-900",
  titleWeight = "bold",
  showTitle = true,
  // Content
  contentClassName = "",
  contentSize = "base",
  contentColor = "text-gray-700",
  contentAlignment = "justify",
  preserveWhitespace = true,
  parseParagraphs = true,
  // Decorative
  showUnderline = true,
  underlineColor,
  underlineWidth = "w-20",
  underlineGradient,
  showDivider = false,
  dividerPosition = "bottom",
  // Spacing
  marginBottom = "mb-10",
  padding = "",
  titleMarginBottom = "mb-6",
  contentMarginTop = "",
  // Layout
  containerClassName = "",
  backgroundColor,
  border = false,
  borderColor = "border-gray-200",
  rounded = false,
  shadow = false,
  // Additional
  className = "",
  style,
  // Text Splitting
  enableTextSplitting = true,
  // Color Palette
  colorPalette,
  onColorPaletteChange,
}) => {
  // Text selection and splitting state
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [showSplitButton, setShowSplitButton] = useState(false);
  const [splitButtonPosition, setSplitButtonPosition] = useState({ top: 0, left: 0 });
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Color palette modal state
  const [showColorPaletteModal, setShowColorPaletteModal] = useState(false);
  
  // Toolbar interaction tracking - prevents selection loss when clicking formatting buttons
  const isToolbarClickingRef = useRef(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(-1);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Check if content currently has bullet points
  const contentHasBullets = typeof content === 'string' && (
    content.includes('•') || /^[\s]*[\-\*]/m.test(content)
  );
  
  // Current color palette (use provided or default)
  const currentPalette = colorPalette || PREDEFINED_PALETTES.default;
  
  // Track if user is typing (to distinguish from programmatic changes)
  const [userIsTyping, setUserIsTyping] = useState(false);
  const lastContentRef = useRef<string>("");
  
  // Determine heading tag
  const HeadingTag = `h${titleLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  // Build title classes - Enhanced typography with better hierarchy
  const titleClasses = [
    "text-lg font-bold",
    titleColor || "text-gray-900",
    titleMarginBottom || "mb-4",
    "tracking-tight",
    "leading-tight",
    titleClassName,
  ].filter(Boolean).join(" ");

  // Build content classes - Improved readability
  const contentClasses = [
    contentClassName,
    "text-sm",
    contentColor || "text-gray-700",
    `text-${contentAlignment}`,
    "leading-relaxed",
    preserveWhitespace && "whitespace-pre-wrap",
    contentMarginTop,
  ].filter(Boolean).join(" ");

  // Build container classes with type-based styling - Enhanced modern design with better colors
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

    // Apply color palette if provided
    if (currentPalette && currentPalette.type !== 'default') {
      // Use custom background from palette
      baseClasses.push(
        "rounded-2xl", "p-8",
        "shadow-lg",
        "border", "border-gray-200",
        // NOTE: no backdrop-blur — causes gray tint in headless/PDF rendering
      );
    } else {
      // Type-specific styling
      if (type === 'day') {
        baseClasses.push(
          "bg-gradient-to-br", "from-cyan-50", "to-blue-50",
          "border-l-4", "border-cyan-400",
          "rounded-2xl", "p-8",
          "shadow-lg",
          "hover:from-cyan-100", "hover:to-blue-100",
          "hover:border-cyan-500",
          // NOTE: no backdrop-blur
        );
      } else if (type === 'included' || type === 'excluded') {
        const colorScheme = type === 'included' 
          ? ["from-emerald-50", "to-green-50", "border-emerald-400", "hover:from-emerald-100", "hover:to-green-100", "hover:border-emerald-500"]
          : ["from-rose-50", "to-pink-50", "border-rose-400", "hover:from-rose-100", "hover:to-pink-100", "hover:border-rose-500"];
        
        baseClasses.push(
          "bg-gradient-to-br", ...colorScheme,
          "border-l-4",
          "rounded-2xl", "p-8",
          "shadow-lg",
          // NOTE: no backdrop-blur
        );
      } else if (backgroundColor && !backgroundColor.startsWith("bg-")) {
        baseClasses.push(
          "rounded-2xl", "p-8",
          "shadow-lg",
          "border", "border-gray-200",
          "bg-white",
          "hover:shadow-xl"
        );
      } else if (backgroundColor) {
        baseClasses.push(
          backgroundColor,
          "rounded-2xl", "p-8",
          "shadow-lg",
          "border", "border-gray-200",
          "hover:shadow-xl"
        );
      } else {
        // Default section — fully opaque gradient (no alpha /50 or /30 modifiers).
        // Alpha-transparent stops blended against a dark body (#0a0a0a in dark mode)
        // produce gray tones in headless Chromium even with color-scheme overrides.
        baseClasses.push(
          "bg-gradient-to-br", "from-white", "via-gray-50", "to-blue-50",
          "border", "border-gray-200",
          "rounded-2xl", "p-8",
          "shadow-lg",
          "hover:shadow-xl",
          "hover:from-blue-50", "hover:via-white", "hover:to-purple-50",
          "hover:border-blue-200",
          // NOTE: no backdrop-blur
        );
      }
    }

    if (border && !baseClasses.some(c => c.includes('border-'))) {
      baseClasses.push(`border ${borderColor}`);
    }
    if (shadow) baseClasses.push("shadow-2xl");

    return baseClasses.filter(Boolean).join(" ");
  };

  const containerClasses = getSectionClasses();

  // Helper: find which line index the current selection belongs to
  const findLineIndexForSelection = (range: Range): number => {
    const currentContent = contentRef.current;
    if (typeof currentContent !== 'string') return -1;
    
    let contextNode: Node | null = range.startContainer;
    while (contextNode && contextNode.nodeType !== Node.ELEMENT_NODE) {
      contextNode = contextNode.parentNode;
    }
    
    let el = contextNode as HTMLElement;
    while (el && el !== contentContainerRef.current && !['LI', 'P'].includes(el.tagName)) {
      el = el.parentElement as HTMLElement;
    }
    
    if (!el || el === contentContainerRef.current) return -1;
    
    const elementText = (el.textContent || '').trim();
    const lines = currentContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const clean = lines[i]
        .replace(/^[\s]*[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim()
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\[CENTER\]/g, '')
        .replace(/\[\/CENTER\]/g, '');
      if (clean === elementText) return i;
    }
    return -1;
  };

  // Helper: clear toolbar and all selection state
  const clearToolbar = () => {
    window.getSelection()?.removeAllRanges();
    setShowSplitButton(false);
    setSelectedText("");
    setSelectionRange(null);
    setSelectedLineIndex(-1);
    isToolbarClickingRef.current = false;
  };

  // Detect text selection - robust handling that survives toolbar clicks
  useEffect(() => {
    const handleMouseUp = () => {
      // Don't process if user is clicking the toolbar
      if (isToolbarClickingRef.current) return;
      
      setTimeout(() => {
        if (isToolbarClickingRef.current) return;
        
        const selection = window.getSelection();
        if (selection && selection.toString().trim() && enableTextSplitting) {
          const text = selection.toString().trim();
          
          if (text.length > 0) {
            setSelectedText(text);
            
            try {
              const range = selection.getRangeAt(0);
              setSelectionRange(range.cloneRange());
              // Pre-capture line index while selection is still active
              setSelectedLineIndex(findLineIndexForSelection(range));
              
              const rect = range.getBoundingClientRect();
              const containerRect = contentContainerRef.current?.getBoundingClientRect();
              
              if (containerRect) {
                setSplitButtonPosition({
                  top: rect.top - containerRect.top - 45,
                  left: rect.left - containerRect.left + rect.width / 2,
                });
                setShowSplitButton(true);
              }
            } catch (err) {
              console.error('Error getting selection range:', err);
              setShowSplitButton(false);
            }
          } else {
            setShowSplitButton(false);
          }
        } else {
          setShowSplitButton(false);
        }
      }, 10);
    };
    
    // Selection change listener - guarded against toolbar interaction
    const handleSelectionChange = () => {
      if (isToolbarClickingRef.current) return;
      
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        // Delay to avoid race with toolbar clicks
        setTimeout(() => {
          if (!isToolbarClickingRef.current) {
            setShowSplitButton(false);
          }
        }, 150);
      }
    };
    
    if (enableTextSplitting && contentContainerRef.current) {
      const container = contentContainerRef.current;
      container.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('selectionchange', handleSelectionChange);
      
      return () => {
        container.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [enableTextSplitting]);
  
  // Handle text splitting — works on the ORIGINAL content string to preserve
  // all formatting markers (**bold**, __underline__, [CENTER]...[/CENTER]).
  // The old approach extracted plain text from DOM nodes, which stripped every
  // marker and caused the entire section to lose formatting on split.
  const handleSplitText = () => {
    if (!selectedText) return;
    if (typeof content !== 'string') return;

    const trimmedText = selectedText.trim();
    if (trimmedText.length === 0) { setShowSplitButton(false); return; }

    // --- Helpers -----------------------------------------------------------

    /** Strip formatting markers to get the "rendered" plain text */
    const stripMarkers = (text: string): string => {
      return text
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\[CENTER\]/g, '')
        .replace(/\[\/CENTER\]/g, '');
    };

    /**
     * Build a position map: renderedIndex → sourceIndex.
     * Walking the source string, we skip over marker sequences (**, __,
     * [CENTER], [/CENTER]) and record which source index each visible
     * character corresponds to.  An extra sentinel at the end maps to the
     * source length so we can slice cleanly.
     */
    const buildRenderedToSourceMap = (source: string): number[] => {
      const map: number[] = [];
      let si = 0;
      while (si < source.length) {
        if (source.substring(si, si + 2) === '**')       { si += 2; continue; }
        if (source.substring(si, si + 2) === '__')       { si += 2; continue; }
        if (source.substring(si, si + 8) === '[CENTER]') { si += 8; continue; }
        if (source.substring(si, si + 9) === '[/CENTER]'){ si += 9; continue; }
        map.push(si);
        si++;
      }
      map.push(si); // end sentinel
      return map;
    };

    const lines = content.split('\n');

    // ── Case 1: We know which line the selection belongs to ────────────
    if (selectedLineIndex >= 0 && selectedLineIndex < lines.length) {
      const originalLine = lines[selectedLineIndex];

      // Parse bullet / number prefix so we can re-attach it later
      const bulletMatch = originalLine.match(/^([\s]*[•\-\*]\s*|\s*\d+\.\s*)/);
      const bulletPrefix = bulletMatch ? bulletMatch[0] : '';
      const lineContent = originalLine.substring(bulletPrefix.length);

      // Rendered (visible) version of the line body
      const renderedLine = stripMarkers(lineContent);
      const selStart = renderedLine.indexOf(trimmedText);

      if (selStart === -1) {
        // Selection text not found on this line — bail out safely
        clearToolbar();
        return;
      }

      const selEnd = selStart + trimmedText.length;

      // Map rendered positions → source positions
      const posMap = buildRenderedToSourceMap(lineContent);
      const srcStart = posMap[selStart];
      const srcEnd   = posMap[selEnd];

      // Split the source line into three slices (markers stay intact)
      const beforePart  = lineContent.substring(0, srcStart).trimEnd();
      const selectedPart = lineContent.substring(srcStart, srcEnd).trim();
      const afterPart   = lineContent.substring(srcEnd).trimStart();

      // Build replacement lines
      const newBulletPrefix = bulletPrefix || '• ';
      const replacementLines: string[] = [];

      if (beforePart) {
        replacementLines.push(bulletPrefix + beforePart);
      }
      replacementLines.push(newBulletPrefix + selectedPart);
      if (afterPart) {
        replacementLines.push(newBulletPrefix + afterPart);
      }

      // Splice into lines array — every OTHER line is untouched
      const newLines = [...lines];
      newLines.splice(selectedLineIndex, 1, ...replacementLines);

      const newContent = newLines.join('\n');
      if (onContentChange) onContentChange(newContent);

    // ── Case 2: Fallback — line index unknown, search full content ─────
    } else {
      const renderedContent = stripMarkers(content);
      const selStart = renderedContent.indexOf(trimmedText);

      if (selStart === -1) { clearToolbar(); return; }

      const selEnd = selStart + trimmedText.length;
      const posMap = buildRenderedToSourceMap(content);
      const srcStart = posMap[selStart];
      const srcEnd   = posMap[selEnd];

      const beforePart  = content.substring(0, srcStart).trimEnd();
      const selectedPart = content.substring(srcStart, srcEnd).trim();
      const afterPart   = content.substring(srcEnd).trimStart();

      let newContent = beforePart + '\n• ' + selectedPart;
      if (afterPart) {
        if (afterPart.startsWith('•') || afterPart.startsWith('\n')) {
          newContent += '\n' + afterPart;
        } else {
          newContent += '\n• ' + afterPart;
        }
      }

      if (onContentChange) onContentChange(newContent);
    }

    clearToolbar();
  };

  // Handle bold text formatting - uses pre-captured selection context
  const handleBoldText = () => {
    if (!selectedText || typeof content !== 'string') {
      clearToolbar();
      return;
    }
    
    const trimmedText = selectedText.trim();
    if (!trimmedText) { clearToolbar(); return; }
    
    const lines = content.split('\n');
    let newContent: string;
    
    if (selectedLineIndex >= 0 && selectedLineIndex < lines.length) {
      const line = lines[selectedLineIndex];
      if (line.includes(`**${trimmedText}**`)) {
        lines[selectedLineIndex] = line.replace(`**${trimmedText}**`, trimmedText);
      } else if (line.includes(trimmedText)) {
        lines[selectedLineIndex] = line.replace(trimmedText, `**${trimmedText}**`);
      }
      newContent = lines.join('\n');
    } else {
      if (content.includes(`**${trimmedText}**`)) {
        newContent = content.replace(`**${trimmedText}**`, trimmedText);
      } else {
        newContent = content.replace(trimmedText, `**${trimmedText}**`);
      }
    }
    
    lastContentRef.current = newContent;
    onContentChange?.(newContent);
    clearToolbar();
  };
  
  // Helper to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Handle center text formatting - uses pre-captured selection context
  const handleCenterText = () => {
    if (!selectedText || typeof content !== 'string') {
      clearToolbar();
      return;
    }
    
    const trimmedText = selectedText.trim();
    if (!trimmedText) { clearToolbar(); return; }
    
    const lines = content.split('\n');
    let newContent: string;
    
    if (selectedLineIndex >= 0 && selectedLineIndex < lines.length) {
      const line = lines[selectedLineIndex];
      if (line.includes(`[CENTER]${trimmedText}[/CENTER]`)) {
        lines[selectedLineIndex] = line.replace(`[CENTER]${trimmedText}[/CENTER]`, trimmedText);
      } else if (line.includes(trimmedText)) {
        lines[selectedLineIndex] = line.replace(trimmedText, `[CENTER]${trimmedText}[/CENTER]`);
      }
      newContent = lines.join('\n');
    } else {
      if (content.includes(`[CENTER]${trimmedText}[/CENTER]`)) {
        newContent = content.replace(`[CENTER]${trimmedText}[/CENTER]`, trimmedText);
      } else {
        newContent = content.replace(trimmedText, `[CENTER]${trimmedText}[/CENTER]`);
      }
    }
    
    lastContentRef.current = newContent;
    onContentChange?.(newContent);
    clearToolbar();
  };

  // Handle toggle all bullets in section
  const handleToggleAllBullets = () => {
    if (typeof content !== 'string' || !onContentChange) return;
    
    if (contentHasBullets) {
      // Remove all bullet points
      const lines = content.split('\n');
      const cleanedLines = lines.map(line => {
        // Remove bullet markers from start of line
        return line.replace(/^[\s]*[•\-\*]\s*/, '').trim();
      }).filter(line => line.length > 0);
      onContentChange(cleanedLines.join('\n'));
    } else {
      // Add bullet points to all lines
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const bulletLines = lines.map(line => {
        const trimmed = line.trim();
        // Don't add bullet if line already has one
        if (/^[•\-\*]/.test(trimmed)) return trimmed;
        return `• ${trimmed}`;
      });
      onContentChange(bulletLines.join('\n'));
    }
  };

  // Handle underline text formatting - uses pre-captured selection context
  const handleUnderlineText = () => {
    if (!selectedText || typeof content !== 'string') {
      clearToolbar();
      return;
    }
    
    const trimmedText = selectedText.trim();
    if (!trimmedText) { clearToolbar(); return; }
    
    const lines = content.split('\n');
    let newContent: string;
    
    if (selectedLineIndex >= 0 && selectedLineIndex < lines.length) {
      const line = lines[selectedLineIndex];
      if (line.includes(`__${trimmedText}__`)) {
        lines[selectedLineIndex] = line.replace(`__${trimmedText}__`, trimmedText);
      } else if (line.includes(trimmedText)) {
        lines[selectedLineIndex] = line.replace(trimmedText, `__${trimmedText}__`);
      }
      newContent = lines.join('\n');
    } else {
      if (content.includes(`__${trimmedText}__`)) {
        newContent = content.replace(`__${trimmedText}__`, trimmedText);
      } else {
        newContent = content.replace(trimmedText, `__${trimmedText}__`);
      }
    }
    
    lastContentRef.current = newContent;
    onContentChange?.(newContent);
    clearToolbar();
  };

  // Build underline classes
  const underlineClasses = [
    "h-1",
    underlineWidth,
    "rounded-full",
    underlineGradient
      ? `bg-gradient-to-r from-[${underlineGradient.from}] to-[${underlineGradient.to}]`
      : underlineColor
      ? `bg-[${underlineColor}]`
      : "bg-gradient-to-r from-[#A4C639] to-[#8FB02E]",
  ].filter(Boolean).join(" ");

  // Helper function to check if content contains HTML
  const hasHTML = (text: string): boolean => {
    return /<[^>]+>/.test(text);
  };

  // Helper function to extract text from HTML for bullet reconstruction
  const extractTextFromHTML = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  // Helper function to convert markdown-style bold (**text**), underline (__text__), and center ([CENTER]text[/CENTER]) to HTML
  const convertBoldMarkersToHTML = (text: string): string => {
    // Replace **text** with <strong> tags, __text__ with <u> tags, and [CENTER]text[/CENTER] with centered div
    let result = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 900">$1</strong>');
    result = result.replace(/__(.*?)__/g, '<u style="text-decoration: underline">$1</u>');
    result = result.replace(/\[CENTER\](.*?)\[\/CENTER\]/g, '<div style="text-align: center; width: 100%;">$1</div>');
    return result;
  };
  
  // Helper function to check if text contains bold or underline markers
  const hasBoldMarkers = (text: string): boolean => {
    return /\*\*.*?\*\*/.test(text) || /__.*?__/.test(text);
  };
  
  // Helper function to check if text contains center markers
  const hasCenterMarkers = (text: string): boolean => {
    return /\[CENTER\].*?\[\/CENTER\]/.test(text);
  };
  
  // Helper function to find and preserve formatting markers when rebuilding content from DOM
  // This maps displayed text back to original formatted text
  const preserveFormattingMarkers = (displayedText: string, originalContent: string): string => {
    if (!hasBoldMarkers(originalContent) && !hasCenterMarkers(originalContent)) {
      return displayedText;
    }
    
    // Build a map of plain text positions to formatted text
    // This helps us preserve **, __, and [CENTER] markers
    let result = displayedText;
    
    // Find all bold sections in original
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldRegex.exec(originalContent)) !== null) {
      const boldText = match[1];
      // If this bold text exists in the displayed text, wrap it with markers
      if (result.includes(boldText) && !result.includes(`**${boldText}**`)) {
        result = result.replace(boldText, `**${boldText}**`);
      }
    }
    
    // Find all underline sections in original
    const underlineRegex = /__([^_]+)__/g;
    while ((match = underlineRegex.exec(originalContent)) !== null) {
      const underlineText = match[1];
      if (result.includes(underlineText) && !result.includes(`__${underlineText}__`)) {
        result = result.replace(underlineText, `__${underlineText}__`);
      }
    }
    
    // Find all center sections in original
    const centerRegex = /\[CENTER\]([^\[]+)\[\/CENTER\]/g;
    while ((match = centerRegex.exec(originalContent)) !== null) {
      const centerText = match[1];
      if (result.includes(centerText) && !result.includes(`[CENTER]${centerText}[/CENTER]`)) {
        result = result.replace(centerText, `[CENTER]${centerText}[/CENTER]`);
      }
    }
    
    return result;
  };

  // Helper function to check if cursor is at the start of an element
  const isCursorAtStart = (): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    // Check if cursor is at position 0 and selection is collapsed (no text selected)
    return range.collapsed && range.startOffset === 0;
  };

  // Handle backspace at start of line to merge with previous line
  // Uses the original items array (from content string) so formatting markers are preserved.
  const handleKeyDownForMerge = (
    e: React.KeyboardEvent<HTMLElement>,
    currentIndex: number,
    items: string[],
    isBulletList: boolean
  ) => {
    if (e.key === 'Backspace' && isCursorAtStart() && currentIndex > 0) {
      e.preventDefault();
      
      // Use the original item text (which has **, __, [CENTER] markers)
      // instead of reading from DOM which strips them.
      const currentItem = items[currentIndex];
      const currentBody = currentItem
        .replace(/^[\s]*[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
      
      const previousItem = items[currentIndex - 1];
      const prevBody = previousItem
        .replace(/^[\s]*[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
      
      const mergedItems = [...items];
      
      if (isBulletList) {
        mergedItems[currentIndex - 1] = `• ${prevBody} ${currentBody}`.replace(/\s+/g, ' ').trim();
      } else {
        mergedItems[currentIndex - 1] = `${prevBody} ${currentBody}`.replace(/\s+/g, ' ').trim();
      }
      
      mergedItems.splice(currentIndex, 1);
      
      if (onContentChange) {
        const newContent = mergedItems.join('\n');
        onContentChange(newContent);
      }
    }
  };

  // Format content with bullet points and line breaks - Enhanced for our JSON structure
  const renderContent = () => {
    if (typeof content === "string") {
      const containsHTML = hasHTML(content);
      
      // Pre-process content: if it contains "•" but not on separate lines, split them
      let processedContent = content;
      // Check if bullets are already on separate lines (bullet follows newline)
      const bulletsOnNewLines = /\n\s*•/.test(content);
      if (content.includes('•') && !bulletsOnNewLines) {
        // Split by bullet point and put each on a new line
        const parts = content.split('•');
        const formatted: string[] = [];
        
        // Handle first part (might not have a bullet if content doesn't start with •)
        if (parts[0] && parts[0].trim()) {
          formatted.push(parts[0].trim());
        }
        
        // Add remaining parts with bullet prefix
        for (let i = 1; i < parts.length; i++) {
          const trimmed = parts[i].trim();
          if (trimmed) {
            formatted.push(`• ${trimmed}`);
          }
        }
        
        processedContent = formatted.join('\n');
      }
      
      if (parseParagraphs) {
        // First, check if content has bullet points (•, -, *, or numbered lists)
        const hasBullets = processedContent.includes('•') || /^[\s]*[\-\*]|^\d+\./m.test(processedContent);
        
        if (hasBullets) {
          // For bullet content, split by single newlines to get individual items
          const lines = processedContent.split(/\n/).filter(line => line.trim());
          
          if (lines.length === 0) return null;
          
          // Group consecutive bullet items together
          const items: string[] = [];
          let currentItem = '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            // Check if this line starts a new bullet item
            if (/^[\s]*[•\-\*]|^\d+\./.test(trimmed)) {
              // Save previous item if exists
              if (currentItem) {
                items.push(currentItem);
              }
              // Start new item
              currentItem = trimmed;
            } else if (trimmed && currentItem) {
              // Continue current item (wrapped text)
              currentItem += ' ' + trimmed;
            } else if (trimmed) {
              // Standalone line without bullet
              items.push(trimmed);
            }
          }
          
          // Add last item
          if (currentItem) {
            items.push(currentItem);
          }
          
          return (
            <div className="content">
              <ul className="space-y-2 text-gray-700">
                {items.map((item, index) => {
                  // Remove bullet markers and clean
                  const cleanItem = item
                    .replace(/^[\s]*[•\-\*]\s*/, "")
                    .replace(/^\d+\.\s*/, "")
                    .trim();
                  
                  if (!cleanItem) return null;
                  
                  // Check for bold markers, center markers, or HTML
                  const itemHasBoldMarkers = hasBoldMarkers(cleanItem);
                  const itemHasCenterMarkers = hasCenterMarkers(cleanItem);
                  const itemHasHTML = hasHTML(cleanItem);
                  
                  // Convert markers to HTML if present
                  const displayItem = (itemHasBoldMarkers || itemHasCenterMarkers) ? convertBoldMarkersToHTML(cleanItem) : cleanItem;
                  const shouldUseHTML = itemHasHTML || itemHasBoldMarkers || itemHasCenterMarkers;
                  
                  return (
                    <li 
                      key={index} 
                      className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-white/80 hover:to-cyan-50/30 transition-all duration-300 group border border-transparent hover:border-cyan-200/50 hover:shadow-sm" 
                      style={{ fontSize: '15px', lineHeight: '1.7' }}
                    >
                      {/* Enhanced bullet point with better colors - Use palette colors if available */}
                      <div className="flex-shrink-0 mt-1.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-md ring-2"
                          style={{
                            background: getPaletteColor('primary') && getPaletteColor('secondary')
                              ? `linear-gradient(to bottom right, ${getPaletteColor('primary')}, ${getPaletteColor('secondary')})`
                              : 'linear-gradient(to bottom right, #06B6D4, #3B82F6)',
                            boxShadow: getPaletteColor('primary')
                              ? `0 0 0 2px ${getPaletteColor('primary')}40`
                              : '0 0 0 2px #06B6D440',
                          }}
                        ></div>
                      </div>
                      <div
                        className={`flex-1 ${editable ? 'cursor-text hover:bg-blue-50/50 rounded-lg px-2 py-1.5 transition-all duration-200 min-h-[2em] border border-transparent hover:border-blue-200/30' : ''} text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300/30 focus:border-blue-300`}
                        contentEditable={editable}
                        suppressContentEditableWarning={true}
                        {...(shouldUseHTML ? { dangerouslySetInnerHTML: { __html: displayItem } } : { children: cleanItem })}
                        onKeyDown={(e) => {
                          if (editable) {
                            // Enhanced merge functionality — uses original content to preserve formatting markers
                            if (e.key === 'Backspace' && isCursorAtStart() && index > 0) {
                              e.preventDefault();
                              
                              // Work with original content lines (preserves **bold**, __underline__, [CENTER] markers)
                              const currentContent = contentRef.current;
                              if (typeof currentContent !== 'string') return;
                              
                              const allLines = currentContent.split('\n').filter(line => line.trim());
                              if (index <= 0 || index >= allLines.length) return;
                              
                              // Get previous and current lines WITH their formatting markers
                              const prevLine = allLines[index - 1];
                              const currLine = allLines[index];
                              
                              // Strip only bullet prefix, keep formatting markers
                              const prevBody = prevLine.replace(/^[\s]*[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                              const currBody = currLine.replace(/^[\s]*[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                              
                              // Merge the two lines — all other lines stay untouched
                              const mergedLines = [...allLines];
                              mergedLines[index - 1] = `• ${prevBody} ${currBody}`.replace(/\s+/g, ' ').trim();
                              mergedLines.splice(index, 1);
                              
                              if (onContentChange) {
                                onContentChange(mergedLines.join('\n'));
                              }
                              return;
                            }
                            
                            // Enter key creates new bullet point — uses original content to preserve formatting
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              
                              const currentContent = contentRef.current;
                              if (typeof currentContent !== 'string') return;
                              
                              const allLines = currentContent.split('\n').filter(line => line.trim());
                              
                              // Insert new empty bullet after current line, all other lines stay untouched
                              const newLines = [...allLines];
                              newLines.splice(index + 1, 0, '• ');
                              
                              if (onContentChange) {
                                onContentChange(newLines.join('\n'));
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (editable && onContentChange && userIsTyping) {
                            // Get all list items and reconstruct content with preserved formatting
                            const ul = e.currentTarget.closest('ul');
                            if (ul) {
                              const newItems = Array.from(ul.children).map((li, idx) => {
                                const text = (li as HTMLElement).textContent || (li as HTMLElement).innerText || '';
                                // Try to preserve formatting from original item
                                const originalItem = items[idx] || '';
                                const preservedText = preserveFormattingMarkers(text, originalItem);
                                return `• ${preservedText}`;
                              }).join('\n');
                              onContentChange(newItems);
                            }
                            setUserIsTyping(false);
                          }
                        }}
                        onInput={() => setUserIsTyping(true)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        } else {
          // For non-bullet content, split by double newlines for paragraphs
          const paragraphs = processedContent.split(/\n\n+/).filter(p => p.trim());
          
          if (paragraphs.length === 0) return null;
          
          return (
            <div className="content">
              {paragraphs.map((paragraph, pIndex) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                
                // If paragraph has single newlines, split into multiple paragraphs
                if (trimmed.includes('\n') && !hasBullets) {
                  return (
                    <div key={pIndex} className="mb-1 last:mb-0">
                      {trimmed.split(/\n/).filter(p => p.trim()).map((p, idx) => {
                        const pText = p.trim();
                        const pHasBoldMarkers = hasBoldMarkers(pText);
                        const pHasCenterMarkers = hasCenterMarkers(pText);
                        const pHasHTML = hasHTML(pText);
                        const displayPText = (pHasBoldMarkers || pHasCenterMarkers) ? convertBoldMarkersToHTML(pText) : pText;
                        const shouldUsePHTML = pHasHTML || pHasBoldMarkers || pHasCenterMarkers;
                        
                        // Get all lines for merge functionality
                        const allLines = trimmed.split(/\n/).filter(p => p.trim());
                        
                        return (
                          <p 
                            key={idx} 
                            className={`mb-3 last:mb-0 text-gray-700 leading-relaxed transition-all duration-200 ${editable ? 'cursor-text hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300/30 focus:border-blue-300 border border-transparent hover:border-blue-200/30 min-h-[2.5em]' : ''}`}
                            style={{ fontSize: '15px', lineHeight: '1.7' }}
                            contentEditable={editable}
                            suppressContentEditableWarning={true}
                            {...(shouldUsePHTML ? { dangerouslySetInnerHTML: { __html: displayPText } } : { children: pText })}
                            onKeyDown={(e) => {
                              if (editable) {
                                // Enhanced merge functionality for paragraphs — uses original lines to preserve formatting
                                if (e.key === 'Backspace' && isCursorAtStart() && idx > 0) {
                                  e.preventDefault();
                                  
                                  // Use original allLines (from content string) which have formatting markers
                                  const prevBody = allLines[idx - 1].trim();
                                  const currBody = allLines[idx].trim();
                                  
                                  const mergedLines = [...allLines];
                                  mergedLines[idx - 1] = `${prevBody} ${currBody}`.replace(/\s+/g, ' ').trim();
                                  mergedLines.splice(idx, 1);
                                  
                                  if (onContentChange) {
                                    onContentChange(mergedLines.join('\n'));
                                  }
                                }
                              }
                            }}
                            onInput={() => setUserIsTyping(true)}
                            onBlur={(e) => {
                              if (editable && onContentChange && userIsTyping) {
                                // Reconstruct all paragraphs from the parent container with preserved formatting
                                const container = e.currentTarget.parentElement;
                                if (container) {
                                  const newParagraphs = Array.from(container.children).map((p, idx) => {
                                    const text = (p as HTMLElement).textContent || (p as HTMLElement).innerText || '';
                                    const originalLine = allLines[idx] || '';
                                    return preserveFormattingMarkers(text, originalLine);
                                  }).join('\n');
                                  onContentChange(newParagraphs);
                                }
                                setUserIsTyping(false);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                }
                
                // Regular paragraph
                const paragraphHasBoldMarkers = hasBoldMarkers(trimmed);
                const paragraphHasCenterMarkers = hasCenterMarkers(trimmed);
                const paragraphHasHTML = hasHTML(trimmed);
                const displayParagraph = (paragraphHasBoldMarkers || paragraphHasCenterMarkers) ? convertBoldMarkersToHTML(trimmed) : trimmed;
                const shouldUseParagraphHTML = paragraphHasHTML || paragraphHasBoldMarkers || paragraphHasCenterMarkers;
                
                return (
                  <p
                    key={pIndex}
                    className="mb-1 last:mb-0 text-sm leading-snug text-gray-700"
                    style={{ fontSize: '11px', lineHeight: '1.4' }}
                    contentEditable={editable}
                    suppressContentEditableWarning={true}
                    {...(shouldUseParagraphHTML ? { dangerouslySetInnerHTML: { __html: displayParagraph } } : { children: trimmed })}
                    onKeyDown={(e) => {
                      if (editable) {
                        handleKeyDownForMerge(e, pIndex, paragraphs, false);
                      }
                    }}
                    onInput={() => setUserIsTyping(true)}
                    onBlur={(e) => {
                      if (editable && onContentChange && userIsTyping) {
                        // Reconstruct all paragraphs with preserved formatting
                        const container = e.currentTarget.parentElement;
                        if (container) {
                          const allParagraphs = Array.from(container.children).map((p, idx) => {
                            const text = (p as HTMLElement).textContent || (p as HTMLElement).innerText || '';
                            const originalParagraph = paragraphs[idx] || '';
                            return preserveFormattingMarkers(text, originalParagraph);
                          }).join('\n\n');
                          onContentChange(allParagraphs);
                        }
                        setUserIsTyping(false);
                      }
                    }}
                  />
                );
              })}
            </div>
          );
        }
      }
      // If parseParagraphs is false, preserve whitespace
      // Pre-process content for bullet points if needed
      let displayContent = content;
      // Check if bullets are already on separate lines (bullet follows newline)
      const bulletsOnNewLinesForDisplay = /\n\s*•/.test(content);
      if (typeof content === "string" && content.includes('•') && !bulletsOnNewLinesForDisplay) {
        // Split by bullet point and put each on a new line
        const parts = content.split('•');
        const formatted: string[] = [];
        
        // Handle first part (might not have a bullet if content doesn't start with •)
        if (parts[0] && parts[0].trim()) {
          formatted.push(parts[0].trim());
        }
        
        // Add remaining parts with bullet prefix
        for (let i = 1; i < parts.length; i++) {
          const trimmed = parts[i].trim();
          if (trimmed) {
            formatted.push(`• ${trimmed}`);
          }
        }
        
        displayContent = formatted.join('\n');
      }
      
      // Convert bold and center markers to HTML for display
      const contentHasBoldMarkers = hasBoldMarkers(displayContent);
      const contentHasCenterMarkers = hasCenterMarkers(displayContent);
      const finalDisplayContent = (contentHasBoldMarkers || contentHasCenterMarkers) ? convertBoldMarkersToHTML(displayContent) : displayContent;
      const shouldUseHTML = containsHTML || contentHasBoldMarkers || contentHasCenterMarkers;
      
      return (
        <div 
          className={`${preserveWhitespace ? "whitespace-pre-wrap leading-relaxed" : ""} ${editable ? 'cursor-text hover:bg-blue-50/30 rounded-lg px-2 py-1.5 transition-all duration-200 min-h-[1.8em]' : ''}`}
          style={{ fontSize: '14px', lineHeight: '1.6' }}
          contentEditable={editable}
          suppressContentEditableWarning={true}
          {...(shouldUseHTML ? { dangerouslySetInnerHTML: { __html: finalDisplayContent } } : { children: displayContent })}
          onInput={() => {
            // Mark that user is typing
            setUserIsTyping(true);
          }}
          onBlur={(e) => {
            if (editable && onContentChange) {
              // Only update if user was actually typing, not if bold/underline was applied
              if (userIsTyping) {
                // Extract text content, but preserve any existing formatting markers from the original
                const newText = e.currentTarget.textContent || e.currentTarget.innerText || '';
                
                // If the original content had bold markers, we need to be smart about preserving them
                // For now, only update if the text actually changed from user input
                if (typeof content === 'string') {
                  // Strip markers from original to compare
                  const originalWithoutMarkers = content.replace(/\*\*/g, '').replace(/__/g, '');
                  if (newText !== originalWithoutMarkers) {
                    // User made actual changes, update with new text
                    onContentChange(newText);
                  }
                  // If same, don't update - preserves the formatting markers
                }
                setUserIsTyping(false);
              }
              // If not typing (e.g., just clicked bold then blurred), don't overwrite
            }
          }}
          onClick={(e) => {
            if (editable && e.currentTarget !== document.activeElement) {
              e.currentTarget.focus();
            }
          }}
        />
      );
    }
    return (
      <div 
        className="content"
        contentEditable={editable}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          if (editable && onContentChange) {
            onContentChange(e.currentTarget.innerHTML || '');
          }
        }}
      >
        {content}
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    ...(backgroundColor && !backgroundColor.startsWith("bg-") && { backgroundColor }),
    // Apply color palette background if provided and applyBackground is true
    ...(currentPalette && currentPalette.type !== 'default' && currentPalette.applyBackground !== false && {
      background: currentPalette.colors.background,
    }),
    ...style,
  };
  
  // Get colors from palette for decorative elements
  const getPaletteColor = (colorType: 'primary' | 'secondary' | 'accent' | 'text') => {
    if (currentPalette && currentPalette.type !== 'default') {
      return currentPalette.colors[colorType];
    }
    return undefined;
  };

  return (
    <section className={containerClasses} style={containerStyle}>
      {/* Edit Color Palette Button - Top Left - Always visible */}
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

      {/* Toggle Bullets Button - Always visible with colored background */}
      {editable && onContentChange && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleAllBullets();
          }}
          className={`absolute top-3 right-14 p-2 rounded-full transition-all duration-200 no-pdf-export shadow-md border hover:shadow-lg hover:scale-105 z-10 ${
            contentHasBullets 
              ? 'bg-orange-100 border-orange-300 hover:bg-orange-500' 
              : 'bg-green-100 border-green-300 hover:bg-green-500'
          }`}
          title={contentHasBullets ? "Remove all bullet points" : "Add bullet points to all lines"}
          aria-label={contentHasBullets ? "Remove all bullet points" : "Add bullet points to all lines"}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              contentHasBullets 
                ? 'text-orange-600 group-hover:text-white' 
                : 'text-green-600 group-hover:text-white'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {contentHasBullets ? (
              /* X icon - remove bullets */
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              /* List icon - add bullets */
              <>
                <circle cx="5" cy="6" r="1.5" fill="currentColor" />
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="5" cy="18" r="1.5" fill="currentColor" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6h10M10 12h10M10 18h10"
                />
              </>
            )}
          </svg>
        </button>
      )}

      {/* Delete Button - Top Right - Enhanced styling */}
      {editable && onDelete && (
        <>
          <button
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
      
      {/* Top Divider */}
      {showDivider && dividerPosition === "top" && (
        <div className={`border-t ${borderColor} mb-6`} />
      )}

      {/* Section Title - Enhanced with centered layout and modern styling */}
      {showTitle && title && (
        <div className="mb-6 text-center relative">
          <h2 
            className={`${titleClasses} ${editable ? 'cursor-text hover:bg-blue-50 rounded-lg px-4 py-3 transition-all duration-200 inline-block' : ''} relative z-10 mx-auto`}
            style={{ fontSize: '20px', lineHeight: '1.3', letterSpacing: '0.5px' }}
            contentEditable={editable}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (editable && onTitleChange) {
                onTitleChange(e.currentTarget.textContent || '');
              }
            }}
            onClick={(e) => {
              if (editable && e.currentTarget !== document.activeElement) {
                e.currentTarget.focus();
              }
            }}
          >
            {title}
          </h2>
          {/* Enhanced decorative elements with better colors - Use palette colors if available */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <div 
              className="h-0.5 w-12 bg-gradient-to-r from-transparent rounded-full"
              style={{
                background: getPaletteColor('primary') 
                  ? `linear-gradient(to right, transparent, ${getPaletteColor('primary')})`
                  : 'linear-gradient(to right, transparent, #06B6D4)'
              }}
            ></div>
            <div 
              className="h-1.5 w-20 rounded-full shadow-lg"
              style={{
                background: getPaletteColor('primary') && getPaletteColor('secondary') && getPaletteColor('accent')
                  ? `linear-gradient(to right, ${getPaletteColor('primary')}, ${getPaletteColor('secondary')}, ${getPaletteColor('accent')})`
                  : 'linear-gradient(to right, #06B6D4, #3B82F6, #8B5CF6)'
              }}
            ></div>
            <div 
              className="h-0.5 w-12 bg-gradient-to-r rounded-full"
              style={{
                background: getPaletteColor('accent')
                  ? `linear-gradient(to right, ${getPaletteColor('accent')}, transparent)`
                  : 'linear-gradient(to right, #8B5CF6, transparent)'
              }}
            ></div>
          </div>
          {/* Subtle background accent with better positioning */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-12 h-12 rounded-full opacity-40 blur-sm"
            style={{
              background: getPaletteColor('primary') && getPaletteColor('secondary') && getPaletteColor('accent')
                ? `linear-gradient(to bottom right, ${getPaletteColor('primary')}40, ${getPaletteColor('secondary')}40, ${getPaletteColor('accent')}40)`
                : 'linear-gradient(to bottom right, #06B6D440, #3B82F640, #8B5CF640)'
            }}
          ></div>
        </div>
      )}

      {/* Section Content */}
      <div 
        ref={contentContainerRef}
        className={`${contentClasses} relative`}
        onMouseLeave={() => {
          // Hide toolbar when mouse leaves - but not if interacting with toolbar
          setTimeout(() => {
            if (!isToolbarClickingRef.current && !window.getSelection()?.toString().trim()) {
              setShowSplitButton(false);
            }
          }, 300);
        }}
      >
        {renderContent()}
        
        {/* Split and Bold Buttons - Appear when text is selected */}
        {/* Hide during PDF export to avoid color parsing issues */}
        {enableTextSplitting && showSplitButton && selectedText && !document.querySelector('.pdf-exporting') && (
          <div
            className="absolute flex items-center gap-1 no-pdf-export"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); isToolbarClickingRef.current = true; }}
            style={{
              top: `${Math.max(0, splitButtonPosition.top)}px`,
              left: `${splitButtonPosition.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 99999,
              pointerEvents: 'auto',
            }}
          >
            {/* Split Button - Compact design */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSplitText();
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
              className="group relative px-2 py-1.5 rounded-lg shadow-2xl active:scale-95 transition-all duration-200 flex items-center gap-1 text-xs font-semibold cursor-pointer backdrop-blur-sm border border-white/30"
              style={{
                background: getPaletteColor('primary')
                  ? `linear-gradient(135deg, ${getPaletteColor('primary')}, ${getPaletteColor('secondary') || getPaletteColor('primary')})`
                  : 'linear-gradient(135deg, #06B6D4, #0891B2)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0891B2, #0E7490)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #06B6D4, #0891B2)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
              title="Split into bullet points"
              aria-label="Split selected text into bullet points"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Split</span>
            </button>
            
            {/* Bold Button - Compact design */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBoldText();
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
              className="group relative px-2 py-1.5 rounded-lg shadow-2xl active:scale-95 transition-all duration-200 flex items-center gap-1 text-xs font-semibold cursor-pointer backdrop-blur-sm border border-white/30"
              style={{
                background: getPaletteColor('accent')
                  ? `linear-gradient(135deg, ${getPaletteColor('accent')}, ${getPaletteColor('secondary') || getPaletteColor('accent')})`
                  : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #6D28D9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #7C3AED)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
              title="Make text bold (font-weight: 900)"
              aria-label="Make selected text bold"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
              <span className="font-black">Bold</span>
            </button>
            
            {/* Underline Button - Compact design */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnderlineText();
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
              className="group relative px-2 py-1.5 rounded-lg shadow-2xl active:scale-95 transition-all duration-200 flex items-center gap-1 text-xs font-semibold cursor-pointer backdrop-blur-sm border border-white/30"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #D97706, #B45309)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
              title="Underline text"
              aria-label="Underline selected text"
            >
              <svg 
                className="w-3 h-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
              </svg>
              <span className="underline">Underline</span>
            </button>
            
            {/* Center Button - Compact design */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCenterText();
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
              className="group relative px-2 py-1.5 rounded-lg shadow-2xl active:scale-95 transition-all duration-200 flex items-center gap-1 text-xs font-semibold cursor-pointer backdrop-blur-sm border border-white/30"
              style={{
                background: getPaletteColor('secondary')
                  ? `linear-gradient(135deg, ${getPaletteColor('secondary')}, ${getPaletteColor('primary') || getPaletteColor('secondary')})`
                  : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                const hoverColor = getPaletteColor('secondary') || '#2563EB';
                e.currentTarget.style.background = `linear-gradient(135deg, ${hoverColor}, ${getPaletteColor('primary') || hoverColor})`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getPaletteColor('secondary')
                  ? `linear-gradient(135deg, ${getPaletteColor('secondary')}, ${getPaletteColor('primary') || getPaletteColor('secondary')})`
                  : 'linear-gradient(135deg, #3B82F6, #2563EB)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
              title="Center text"
              aria-label="Center selected text"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Center</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Divider */}
      {showDivider && dividerPosition === "bottom" && (
        <div className={`border-t ${borderColor} mt-6`} />
      )}
      
            {/* Color Palette Modal */}
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

      {/* Add Section Button - Enhanced modern design with better positioning */}
      {editable && onAddAfter && (
        <div className="flex justify-center mt-6 mb-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddAfter();
            }}
            className="group relative px-6 py-3 rounded-2xl border-4 border-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 no-pdf-export shadow-xl hover:shadow-2xl overflow-hidden"
            style={{
              background: getPaletteColor('primary') && getPaletteColor('secondary') && getPaletteColor('accent')
                ? `linear-gradient(to right, ${getPaletteColor('primary')}, ${getPaletteColor('secondary')}, ${getPaletteColor('accent')})`
                : 'linear-gradient(to right, #06B6D4, #3B82F6, #8B5CF6)',
            }}
            title="Add section below"
            aria-label="Add new section after this one"
          >
            {/* Background shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            {/* Icon with enhanced animation */}
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
            
            {/* Text with better typography */}
            <span className="text-white font-semibold text-sm tracking-wide relative z-10">
              Add Section Below
            </span>
            
            {/* Pulse rings for attention */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-300 animate-pulse opacity-10"></div>
          </button>
        </div>
      )}
    </section>
  );
};

export default SectionTemplate;

