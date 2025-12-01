"use client";

import React from "react";

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
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  content,
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
}) => {
  // Determine heading tag
  const HeadingTag = `h${titleLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  // Build title classes
  const titleClasses = [
    `text-${titleSize}`,
    `font-${titleWeight}`,
    titleColor,
    titleMarginBottom,
    "tracking-tight",
    titleClassName,
  ].filter(Boolean).join(" ");

  // Build content classes
  const contentClasses = [
    contentClassName,
    `text-${contentSize}`,
    contentColor,
    `text-${contentAlignment}`,
    "leading-relaxed",
    preserveWhitespace && "whitespace-pre-wrap",
    contentMarginTop,
  ].filter(Boolean).join(" ");

  // Build container classes
  const containerClasses = [
    "section-template",
    marginBottom,
    "last:mb-0",
    padding,
    backgroundColor && `bg-[${backgroundColor}]`,
    border && `border ${borderColor}`,
    rounded && "rounded-lg",
    shadow && "shadow-md",
    containerClassName,
    className,
  ].filter(Boolean).join(" ");

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

  // Format content
  const renderContent = () => {
    if (typeof content === "string") {
      if (parseParagraphs) {
        return (
          <div className="prose prose-lg max-w-none">
            {content.split("\n\n").map((paragraph, index) =>
              paragraph.trim() ? (
                <p
                  key={index}
                  className={`mb-4 last:mb-0 ${preserveWhitespace ? "whitespace-pre-wrap" : ""}`}
                >
                  {paragraph.trim()}
                </p>
              ) : null
            )}
          </div>
        );
      }
      return content;
    }
    return content;
  };

  const containerStyle: React.CSSProperties = {
    ...(backgroundColor && !backgroundColor.startsWith("bg-") && { backgroundColor }),
    ...style,
  };

  return (
    <section className={containerClasses} style={containerStyle}>
      {/* Top Divider */}
      {showDivider && dividerPosition === "top" && (
        <div className={`border-t ${borderColor} mb-6`} />
      )}

      {/* Section Title */}
      {showTitle && title && (
        <div className={titleMarginBottom}>
          {titleLevel === 1 && <h1 className={titleClasses}>{title}</h1>}
          {titleLevel === 2 && <h2 className={titleClasses}>{title}</h2>}
          {titleLevel === 3 && <h3 className={titleClasses}>{title}</h3>}
          {titleLevel === 4 && <h4 className={titleClasses}>{title}</h4>}
          {titleLevel === 5 && <h5 className={titleClasses}>{title}</h5>}
          {titleLevel === 6 && <h6 className={titleClasses}>{title}</h6>}
          {/* Decorative underline */}
          {showUnderline && (
            <div className={`mt-2 ${underlineClasses}`} />
          )}
        </div>
      )}

      {/* Section Content */}
      <div className={contentClasses}>
        {renderContent()}
      </div>

      {/* Bottom Divider */}
      {showDivider && dividerPosition === "bottom" && (
        <div className={`border-t ${borderColor} mt-6`} />
      )}
    </section>
  );
};

export default SectionTemplate;

