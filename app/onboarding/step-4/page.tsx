'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Step4Tutorial } from '@/components/onboarding/step4-tutorial';

/**
 * Onboarding Step 4: Tutorial Completion
 *
 * This page handles:
 * 1. Checking if user is authenticated
 * 2. Checking if tutorial/onboarding already completed
 * 3. Redirecting to dashboard if already completed
 * 4. Handling tutorial completion (complete or skip)
 * 5. Updating profile to mark onboarding as complete
 * 6. Navigation between steps
 */
export default function OnboardingStep4Page() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();
  const { user, isLoaded } = useUser();

  /**
   * Check on mount if tutorial/onboarding is already completed
   * If completed, redirect to dashboard
   */
  React.useEffect(() => {
    async function checkCompletion() {
      if (!isLoaded || !user) return;

      try {
        setIsChecking(true);
        const response = await fetch('/api/onboarding/progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          // If onboarding already completed, redirect to dashboard
          if (data.onboarding_completed === true) {
            router.push('/dashboard');
          }
        } else if (response.status !== 404) {
          console.error('Failed to check onboarding progress:', response.statusText);
        }
      } catch (err) {
        console.error('Error checking onboarding completion:', err);
      } finally {
        setIsChecking(false);
      }
    }

    checkCompletion();
  }, [isLoaded, user, router]);

  /**
   * Handle tutorial completion
   * - Mark tutorial as completed
   * - Update profile onboarding status
   * - Navigate to dashboard
   */
  async function handleComplete() {
    if (!user) {
      setError('You must be logged in to continue');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/onboarding/tutorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          skipped: false,
          completed_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete tutorial');
      }

      // Success! Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing tutorial:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle tutorial skip
   * - Mark tutorial as skipped
   * - Update profile onboarding status (still marks as complete)
   * - Navigate to dashboard
   */
  async function handleSkip() {
    if (!user) {
      setError('You must be logged in to continue');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/onboarding/tutorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: false,
          skipped: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to skip tutorial');
      }

      // Success! Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error skipping tutorial:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle back navigation to previous step
   */
  function handleBack() {
    router.push('/onboarding/step-3');
  }

  // Show loading state while checking auth
  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <p className="text-destructive">You must be logged in to access onboarding</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="text-sm text-primary hover:underline"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Tutorial Component */}
      <Step4Tutorial
        onComplete={handleComplete}
        onSkip={handleSkip}
        onBack={handleBack}
        isLoading={isLoading}
      />
    </div>
  );
}
