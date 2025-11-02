"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DaySummaryCard } from "./day-summary-card";
import { getUserTimezone, formatDateForDisplay } from "@/lib/utils/timezone";
import type { DailySummary } from "@/lib/types/meal";

interface MealHistorySidebarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export function MealHistorySidebar({
  selectedDate,
  onSelectDate,
}: MealHistorySidebarProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timezone, setTimezone] = useState<string>("UTC");

  useEffect(() => {
    // Get user's timezone
    const tz = getUserTimezone();
    setTimezone(tz);

    // Fetch summaries
    async function fetchSummaries() {
      try {
        const response = await fetch(
          `/api/meals/summaries?timezone=${encodeURIComponent(tz)}&limit=30`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch meal summaries");
        }

        const data = await response.json();
        setSummaries(data.summaries || []);
      } catch (error) {
        console.error("Error fetching meal summaries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummaries();
  }, []);

  // Format date for display
  function getDisplayDate(date: string, isToday: boolean): string {
    if (isToday) {
      return "Today";
    }

    // Format as "Oct 18"
    return formatDateForDisplay(date, timezone, {
      month: "short",
      day: "numeric",
    });
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full lg:w-full space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Meal History</h2>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (summaries.length === 0) {
    return (
      <div className="w-full lg:w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Meal History</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Start logging meals to see your history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Meal History</h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {summaries.map((summary) => (
          <DaySummaryCard
            key={summary.date}
            date={summary.date}
            mealCount={summary.meal_count}
            totalCalories={summary.total_calories}
            isToday={summary.is_today}
            isSelected={summary.date === selectedDate}
            onClick={() => onSelectDate(summary.date)}
            displayDate={getDisplayDate(summary.date, summary.is_today)}
          />
        ))}
      </div>
    </div>
  );
}
