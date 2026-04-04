"use client";

import React from "react";

/**
 * Professional Loader Component
 * 
 * Multiple variants:
 * - spinner: Circular spinner
 * - progress: Progress bar with percentage
 * - skeleton: Skeleton loading placeholders
 * - dots: Animated dots
 */
export interface LoaderProps {
  variant?: "spinner" | "progress" | "skeleton" | "dots" | "pulse";
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  text?: string;
  progress?: number; // 0-100 for progress variant
  fullScreen?: boolean;
  className?: string;
  overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  variant = "spinner",
  size = "md",
  color = "#A4C639",
  text,
  progress,
  fullScreen = false,
  className = "",
  overlay = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // Spinner variant
  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[${color}] rounded-full animate-spin`}
        style={{
          borderTopColor: color,
        }}
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Progress variant
  const renderProgress = () => (
    <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xs">
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress || 0}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
      {progress !== undefined && (
        <p className={`${textSizeClasses[size]} text-gray-500`}>
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );

  // Dots variant
  const renderDots = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClasses[size === "sm" ? "sm" : "md"]} rounded-full animate-pulse`}
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Pulse variant
  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full animate-ping`}
        style={{
          backgroundColor: color,
          opacity: 0.75,
        }}
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Skeleton variant
  const renderSkeleton = () => (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "progress":
        return renderProgress();
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "skeleton":
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const containerClasses = [
    "loader-container",
    fullScreen && "fixed inset-0 z-50",
    overlay && "bg-white/80 backdrop-blur-sm",
    "flex items-center justify-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={containerClasses}>{renderLoader()}</div>;
};

export default Loader;

