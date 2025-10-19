"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OnboardingProgressBarProps {
  currentStep: number
  className?: string
}

/**
 * OnboardingProgressBar component displays the current step in a 4-step onboarding flow
 *
 * @param currentStep - Current step number (1-4)
 * @param className - Optional additional CSS classes
 */
export function OnboardingProgressBar({
  currentStep,
  className
}: OnboardingProgressBarProps) {
  // Ensure currentStep is within valid range
  const validStep = Math.max(1, Math.min(4, currentStep))

  // Calculate progress percentage (25%, 50%, 75%, 100%)
  const progressPercentage = (validStep / 4) * 100

  return (
    <div
      className={cn(
        "w-full space-y-3 pb-8",
        className
      )}
      role="progressbar"
      aria-valuenow={validStep}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-label={`Onboarding progress: Step ${validStep} of 4`}
    >
      {/* Step Text */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Step <span className="text-foreground">{validStep}</span> of 4
        </p>
        <p className="text-xs text-muted-foreground">
          {progressPercentage}% complete
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              step <= validStep
                ? "bg-[var(--primary-brand)]"
                : "bg-muted"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
