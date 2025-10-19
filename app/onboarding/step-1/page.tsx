"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { Step1HealthProfile } from "@/components/onboarding/step1-health-profile"
import type { HealthProfileFormData } from "@/lib/validations/onboarding"
import { formatHealthProfileForApi, formatHealthProfileFromApi } from "@/lib/utils/onboarding"

export default function OnboardingStep1Page() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(true)
  const [existingData, setExistingData] = React.useState<Partial<HealthProfileFormData> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Fetch existing health profile data on mount
  React.useEffect(() => {
    async function fetchHealthProfile() {
      if (!isLoaded || !user) return

      try {
        setIsFetching(true)
        const response = await fetch("/api/onboarding/health-profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.health_profile) {
            // Convert API data to form data format
            const formData = formatHealthProfileFromApi(data.health_profile)
            setExistingData(formData)
          }
        } else if (response.status !== 404) {
          // 404 is expected if no profile exists yet
          console.error("Failed to fetch health profile:", response.statusText)
        }
      } catch (err) {
        console.error("Error fetching health profile:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchHealthProfile()
  }, [isLoaded, user])

  // Handle form submission
  async function handleSubmit(formData: HealthProfileFormData) {
    if (!user) {
      setError("You must be logged in to continue")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Format data for API (remove UI-only fields)
      const apiData = formatHealthProfileForApi(formData)

      const response = await fetch("/api/onboarding/health-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save health profile")
      }

      // Success! Navigate to step 2
      router.push("/onboarding/step-2")
    } catch (err) {
      console.error("Error submitting health profile:", err)
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-9 w-full bg-muted animate-pulse rounded"></div>
            </div>
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

      {/* Health Profile Form */}
      <Step1HealthProfile
        onSubmit={handleSubmit}
        defaultValues={existingData || undefined}
        isLoading={isLoading}
      />
    </div>
  )
}
