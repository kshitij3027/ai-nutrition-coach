'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Play } from 'lucide-react';

export interface Step4TutorialProps {
  onComplete: () => Promise<void>;
  onSkip: () => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step4Tutorial({
  onComplete,
  onSkip,
  onBack,
  isLoading = false,
}: Step4TutorialProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#20df6c] to-[#18b359] shadow-lg">
            <Play className="h-8 w-8 fill-white text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to Your Nutrition Coach!
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn how to get the most out of your personalized coaching experience
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          <span>Estimated time: 5 minutes</span>
        </div>
      </div>

      {/* Tutorial Video Placeholder */}
      <Card className="overflow-hidden border-2">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full">
            {/* Placeholder for tutorial video/content */}
            <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-muted/50 to-muted p-8">
              <div className="rounded-full bg-background/80 p-6 shadow-lg">
                <Play className="h-12 w-12 text-[#20df6c]" />
              </div>

              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold">Tutorial Video</p>
                <p className="text-sm text-muted-foreground">
                  Tutorial video will be embedded here
                </p>
              </div>

              {/* Loading spinner if needed */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </div>

            {/*
              Future implementation: Replace placeholder with actual video
              Example:
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/VIDEO_ID"
                title="Nutrition Coach Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              OR:

              <video
                className="absolute inset-0 h-full w-full object-cover"
                controls
                poster="/tutorial-poster.jpg"
              >
                <source src="/tutorial-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            */}
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Benefits/Features List */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">What you&apos;ll learn:</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20df6c]/10">
              <svg
                className="h-3 w-3 text-[#20df6c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              How to log meals and track your nutrition
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20df6c]/10">
              <svg
                className="h-3 w-3 text-[#20df6c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              Understanding your personalized recommendations
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20df6c]/10">
              <svg
                className="h-3 w-3 text-[#20df6c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              Visualizing how meals affect your body systems
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20df6c]/10">
              <svg
                className="h-3 w-3 text-[#20df6c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              Making the most of your AI nutrition coach
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Back Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="order-3 sm:order-1 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Skip Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
          className="order-2 flex-1 sm:order-2"
        >
          {isLoading ? (
            <>
              <Spinner className="h-4 w-4" />
              Processing...
            </>
          ) : (
            'Skip Tutorial'
          )}
        </Button>

        {/* Complete Tutorial Button */}
        <Button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="order-1 flex-1 bg-[#20df6c] text-black hover:bg-[#18b359] sm:order-3"
        >
          {isLoading ? (
            <>
              <Spinner className="h-4 w-4" />
              Completing...
            </>
          ) : (
            'Complete Tutorial'
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-muted-foreground">
        Your progress is automatically saved. You can access this tutorial anytime from your settings.
      </p>
    </div>
  );
}
