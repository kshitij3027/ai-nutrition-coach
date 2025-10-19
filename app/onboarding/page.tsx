"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function checkProgress() {
      // Wait for Clerk to finish loading
      if (!isLoaded) return;

      // If not signed in, redirect to sign in
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      try {
        const res = await fetch("/api/onboarding/progress");

        if (!res.ok) {
          console.error("Failed to fetch onboarding progress");
          // Default to step-1 on error
          router.push("/onboarding/step-1");
          return;
        }

        const data = await res.json();

        // Route based on onboarding completion status and progress
        if (data.onboarding_completed) {
          router.push("/dashboard");
        } else if (data.progress_percentage === 0 || data.progress_percentage <= 25) {
          router.push("/onboarding/step-1");
        } else if (data.progress_percentage <= 50) {
          router.push("/onboarding/step-2");
        } else if (data.progress_percentage <= 75) {
          router.push("/onboarding/step-3");
        } else {
          router.push("/onboarding/step-4");
        }
      } catch (err) {
        console.error("Error checking onboarding progress:", err);
        // Default to step-1 on error
        router.push("/onboarding/step-1");
      }
    }

    checkProgress();
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading your onboarding progress...</p>
      </div>
    </div>
  );
}
