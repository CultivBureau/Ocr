"use client";

import React from "react";

/**
 * Steps Header Component
 * 
 * Displays a multi-step process indicator with:
 * - Step numbers and labels
 * - Active/completed/pending states
 * - Optional progress bar
 * - Responsive design
 */
export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepsHeaderProps {
  steps: Step[];
  currentStep: number; // 0-based index
  orientation?: "horizontal" | "vertical";
  showProgress?: boolean;
  showConnectors?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  onStepClick?: (stepIndex: number) => void;
  clickable?: boolean;
}

const StepsHeader: React.FC<StepsHeaderProps> = ({
  steps,
  currentStep,
  orientation = "horizontal",
  showProgress = true,
  showConnectors = true,
  variant = "default",
  className = "",
  onStepClick,
  clickable = false,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  const getStepClasses = (status: string) => {
    const baseClasses = "flex items-center justify-center rounded-full font-semibold transition-all";
    
    switch (status) {
      case "completed":
        return `${baseClasses} bg-[#A4C639] text-white border-2 border-[#A4C639]`;
      case "active":
        return `${baseClasses} bg-[#A4C639] text-white border-2 border-[#A4C639] ring-4 ring-[#A4C639]/20`;
      default:
        return `${baseClasses} bg-white text-gray-400 border-2 border-gray-300`;
    }
  };

  const getStepSize = () => {
    switch (variant) {
      case "compact":
        return "w-8 h-8 text-sm";
      case "detailed":
        return "w-12 h-12 text-base";
      default:
        return "w-10 h-10 text-sm";
    }
  };

  const handleStepClick = (index: number) => {
    if (clickable && onStepClick && index <= currentStep) {
      onStepClick(index);
    }
  };

  if (orientation === "vertical") {
    return (
      <div className={`steps-header-vertical flex flex-col gap-4 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!clickable || index > currentStep}
                  className={`${getStepClasses(status)} ${getStepSize()} ${
                    clickable && index <= currentStep
                      ? "cursor-pointer hover:scale-110"
                      : "cursor-default"
                  }`}
                >
                  {step.icon || index + 1}
                </button>
                {!isLast && showConnectors && (
                  <div
                    className={`w-0.5 h-full min-h-[2rem] mt-2 ${
                      status === "completed" ? "bg-[#A4C639]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-4">
                <div
                  className={`font-semibold ${
                    status === "active"
                      ? "text-[#A4C639]"
                      : status === "completed"
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                {variant === "detailed" && step.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`steps-header-horizontal w-full ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#A4C639] to-[#8FB02E] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        {showConnectors && (
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-gradient-to-r from-[#A4C639] to-[#8FB02E] transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        )}

        {/* Step Items */}
        {steps.map((step, index) => {
          const status = getStepStatus(index);

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center flex-1 ${
                variant === "detailed" ? "gap-2" : "gap-1"
              }`}
            >
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                disabled={!clickable || index > currentStep}
                className={`${getStepClasses(status)} ${getStepSize()} ${
                  clickable && index <= currentStep
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-default"
                }`}
              >
                {step.icon || (
                  <span>
                    {status === "completed" ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                )}
              </button>

              {/* Step Label */}
              <div className="text-center max-w-[120px]">
                <div
                  className={`text-xs font-semibold ${
                    status === "active"
                      ? "text-[#A4C639]"
                      : status === "completed"
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                {variant === "detailed" && step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepsHeader;

