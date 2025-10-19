"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar"

interface OnboardingLayoutProps {
  children: React.ReactNode
}

/**
 * OnboardingLayout provides a consistent layout for all onboarding steps
 * with an automatic progress bar that detects the current step from the URL
 */
export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname()

  // Extract current step from pathname (e.g., /onboarding/step-1 -> 1)
  const getCurrentStep = (): number => {
    // Match patterns like /onboarding/step-1, /onboarding/step-2, etc.
    const stepMatch = pathname?.match(/\/step-(\d+)/)
    if (stepMatch && stepMatch[1]) {
      const step = parseInt(stepMatch[1], 10)
      // Ensure step is within valid range (1-4)
      return Math.max(1, Math.min(4, step))
    }
    // Default to step 1 if we're on /onboarding root
    return 1
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-background">
      {/* Container */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Progress Bar */}
        <header className="mb-8">
          <OnboardingProgressBar currentStep={currentStep} />
        </header>

        {/* Main Content */}
        <main className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-12">
          {children}
        </main>

        {/* Footer (optional - can be used for navigation help) */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Your data is securely stored and encrypted
          </p>
        </footer>
      </div>
    </div>
  )
}
