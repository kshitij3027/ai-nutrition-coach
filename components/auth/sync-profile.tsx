"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SyncProfile() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncProfileAndCheckOnboarding = async () => {
      try {
        setIsChecking(true);
        setError(null);

        // Step 1: Sync the profile
        const syncResponse = await fetch("/api/sync-profile", {
          method: "POST",
        });

        if (!syncResponse.ok) {
          const errorText = await syncResponse.text();
          console.error("Failed to sync profile:", errorText);
          // Don't throw - continue to check onboarding status even if sync fails
          // The profile might already exist
        }

        // Step 2: Check onboarding status
        const onboardingResponse = await fetch("/api/onboarding/progress");

        if (!onboardingResponse.ok) {
          const errorData = await onboardingResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to check onboarding status";
          console.error("Onboarding check failed:", errorMessage);

          // Set error state but don't throw
          // Allow user to stay on dashboard if check fails
          setError(errorMessage);
          setIsChecking(false);
          return;
        }

        const data = await onboardingResponse.json();

        // Log the response for debugging
        console.log("Onboarding status:", data);

        // If user exists but onboarding is not completed, redirect to onboarding
        if (data.user_exists !== false && !data.onboarding_completed) {
          console.log(`Redirecting to onboarding - Step ${data.current_step}, ${data.progress_percentage}% complete`);
          router.push("/onboarding");
        } else {
          console.log("User has completed onboarding or doesn't exist yet");
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error syncing profile or checking onboarding:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        setIsChecking(false);
      }
    };

    syncProfileAndCheckOnboarding();
  }, [router]);

  // Don't render anything - this is a silent background component
  // Error state is available for debugging in console
  return null;
}
