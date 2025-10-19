"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { Step3DietaryPreferences } from "@/components/onboarding/step3-dietary-preferences"

/**
 * Onboarding Step 3: Dietary Preferences
 *
 * This page handles:
 * 1. Fetching existing dietary restrictions and allergies
 * 2. Transforming API data to form format
 * 3. Submitting form data to API
 * 4. Navigation between steps
 */
export default function OnboardingStep3Page() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(true)
  const [existingData, setExistingData] = React.useState<{
    allergies?: { allergen_name: string; severity_level: string }[]
    diet_types?: string[]
    custom_restrictions?: string[]
    confirmation_given?: boolean
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Fetch existing dietary restrictions data on mount
  React.useEffect(() => {
    async function fetchDietaryRestrictions() {
      if (!isLoaded || !user) return

      try {
        setIsFetching(true)
        const response = await fetch("/api/onboarding/dietary-restrictions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Transform API format to form format
          // API returns: { dietary_restrictions: {...}, allergies: [{...}] }
          // Form expects: { allergies: [...], diet_types: [...], custom_restrictions: [...] }
          const formData = {
            // Allergies array stays as-is
            allergies: data.allergies || [],

            // Parse diet_type CSV string to array
            diet_types: data.dietary_restrictions?.diet_type
              ? data.dietary_restrictions.diet_type.split(',').filter(Boolean)
              : [],

            // Parse custom_restrictions_text comma-separated string to array
            custom_restrictions: data.dietary_restrictions?.custom_restrictions_text
              ? data.dietary_restrictions.custom_restrictions_text
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [],

            confirmation_given: false
          }

          setExistingData(formData)
        } else if (response.status !== 404) {
          // 404 is expected if no restrictions exist yet
          console.error("Failed to fetch dietary restrictions:", response.statusText)
        }
      } catch (err) {
        console.error("Error fetching dietary restrictions:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchDietaryRestrictions()
  }, [isLoaded, user])

  // Handle form submission
  async function handleSubmit(formData: {
    allergies: { allergen_name: string; severity_level: string }[]
    diet_types: string[]
    custom_restrictions: string[]
  }) {
    if (!user) {
      setError("You must be logged in to continue")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Transform form data to API format
      // Form sends: { allergies: [...], diet_types: [...], custom_restrictions: [...] }
      // API expects: { diet_type: string, custom_restrictions_text: string, allergies: [...] }
      const apiData = {
        // Join diet_types array to CSV string
        diet_type: formData.diet_types.join(','),

        // Join custom_restrictions array to comma-separated string
        custom_restrictions_text: formData.custom_restrictions.join(', '),

        // Allergies array stays as-is
        allergies: formData.allergies
      }

      const response = await fetch("/api/onboarding/dietary-restrictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save dietary preferences")
      }

      // Success! Navigate to step 4
      router.push("/onboarding/step-4")
    } catch (err) {
      console.error("Error submitting dietary preferences:", err)
      setError(
        err instanceof Error ? err.message : "An error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back navigation
  function handleBack() {
    router.push("/onboarding/step-2")
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
          <div className="h-9 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-full max-w-lg bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded"></div>
          <div className="h-32 bg-muted animate-pulse rounded"></div>
          <div className="h-32 bg-muted animate-pulse rounded"></div>
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

      {/* Dietary Preferences Form */}
      <Step3DietaryPreferences
        onSubmit={handleSubmit}
        onBack={handleBack}
        defaultValues={existingData || undefined}
        isLoading={isLoading}
      />
    </div>
  )
}
