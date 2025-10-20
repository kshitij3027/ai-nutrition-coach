"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodaysTipCardProps {
  initialTip: string;
  healthGoal: string;
  className?: string;
}

export function TodaysTipCard({ initialTip, healthGoal, className }: TodaysTipCardProps) {
  const [tip, setTip] = useState(initialTip);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefreshTip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tips/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ healthGoal }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate tip");
      }

      const data = await response.json();
      setTip(data.tip);
    } catch (err) {
      console.error("Error fetching tip:", err);
      setError(err instanceof Error ? err.message : "Failed to generate tip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center transition-transform hover:scale-105">
            <Lightbulb className="w-4 h-4 text-orange-600" />
          </div>
          Today&apos;s Tip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Tip Content */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error loading tip</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshTip}
          disabled={isLoading}
          className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 transition-all duration-200 touch-manipulation"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2 transition-transform", isLoading && "animate-spin")} />
          {isLoading ? "Generating..." : error ? "Try Again" : "Get another tip"}
        </Button>
      </CardContent>
    </Card>
  );
}
