"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { Step2HealthGoals } from "@/components/onboarding/step2-health-goals"
import { GOAL_ENUM_TO_DISPLAY, GOAL_DISPLAY_TO_ENUM, type GoalTypeEnum } from "@/lib/types/onboarding"

export default function OnboardingStep2Page() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(true)
  const [existingData, setExistingData] = React.useState<{
    selected_goals?: string[];
    primary_goal?: string;
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Fetch existing health goals data on mount
  React.useEffect(() => {
    async function fetchHealthGoals() {
      if (!isLoaded || !user) return

      try {
        setIsFetching(true)
        const response = await fetch("/api/onboarding/health-goals", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.goals && data.goals.length > 0) {
            // Find the primary goal
            const primaryGoalData = data.goals.find(
              (g: { is_primary?: boolean }) => g.is_primary
            ) as { goal_type: GoalTypeEnum } | undefined

            // Transform API response: goal_type enum -> UI display names
            const formData = {
              selected_goals: data.goals.map((g: { goal_type: GoalTypeEnum }) =>
                GOAL_ENUM_TO_DISPLAY[g.goal_type]
              ),
              primary_goal: primaryGoalData
                ? GOAL_ENUM_TO_DISPLAY[primaryGoalData.goal_type]
                : undefined,
            }
            setExistingData(formData)
          }
        } else if (response.status !== 404) {
          // 404 is expected if no goals exist yet
          console.error("Failed to fetch health goals:", response.statusText)
        }
      } catch (err) {
        console.error("Error fetching health goals:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchHealthGoals()
  }, [isLoaded, user])

  // Handle form submission
  async function handleSubmit(formData: {
    selected_goals: string[];
    primary_goal?: string;
  }) {
    if (!user) {
      setError("You must be logged in to continue")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Transform form data to API format: UI display names -> goal_type enum values
      const apiData = {
        goals: formData.selected_goals.map((displayName, index) => {
          const goalEnum = GOAL_DISPLAY_TO_ENUM[displayName]
          return {
            goal_type: goalEnum,
            is_primary: displayName === formData.primary_goal, // Mark primary
            priority_rank: index + 1, // Set rank based on order
          }
        }),
      }

      const response = await fetch("/api/onboarding/health-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save health goals")
      }

      // Success! Navigate to step 3
      router.push("/onboarding/step-3")
    } catch (err) {
      console.error("Error submitting health goals:", err)
      setError(
        err instanceof Error ? err.message : "An error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back navigation
  function handleBack() {
    router.push("/onboarding/step-1")
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <p className="text-destructive">You must be logged in to access onboarding</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="text-sm text-primary hover:underline"
          >
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  // Show loading skeleton while fetching existing data
  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-full max-w-lg bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Health Goals Form */}
      <Step2HealthGoals
        onSubmit={handleSubmit}
        onBack={handleBack}
        defaultValues={existingData || undefined}
        isLoading={isLoading}
      />
    </div>
  )
}
