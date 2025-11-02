"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LogMealForm } from "@/components/meal-log/log-meal-form";
import { WeightSnapshotForm } from "@/components/meal-log/weight-snapshot-form";
import { MealHistorySidebar } from "@/components/meal-log/meal-history-sidebar";
import { MealEntryCard } from "@/components/meal-log/meal-entry-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getUserTimezone,
  getTodayInTimezone,
  formatTimeForDisplay,
} from "@/lib/utils/timezone";
import type { MealHistoryItem } from "@/lib/types/meal";

export default function MealLogPage() {
  const [timezone, setTimezone] = useState<string>("UTC");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [mealEntries, setMealEntries] = useState<MealHistoryItem[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Initialize timezone and selected date
  useEffect(() => {
    const tz = getUserTimezone();
    setTimezone(tz);

    const today = getTodayInTimezone(tz);
    setSelectedDate(today);
  }, []);

  // Fetch meal entries when selected date changes
  useEffect(() => {
    if (!selectedDate || !timezone) return;

    async function fetchMealEntries() {
      setIsLoadingEntries(true);

      try {
        const response = await fetch(
          `/api/meals/history?date=${selectedDate}&timezone=${encodeURIComponent(timezone)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch meal entries");
        }

        const data = await response.json();
        setMealEntries(data.meals || []);
      } catch (error) {
        console.error("Error fetching meal entries:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    }

    fetchMealEntries();
  }, [selectedDate, timezone]);

  // Format date for display
  function getDisplayDate(date: string): string {
    if (!date || !timezone) return "";

    const today = getTodayInTimezone(timezone);
    if (date === today) {
      return "Today";
    }

    // Format as "October 18, 2025"
    const dateObj = new Date(date + "T00:00:00");
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/* Return to Dashboard Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>

      {/* Main Layout: 20/80 Split on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Sidebar (20% on desktop, full width on mobile - shown first on mobile) */}
        <div className="lg:col-span-1">
          <MealHistorySidebar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Main Panel (80% on desktop, full width on mobile) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Log Meal Section */}
          <section>
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold">Log a Meal</h1>
              <p className="text-sm text-gray-600 mt-1">
                Add a new meal to your daily log for {getDisplayDate(selectedDate)}.
              </p>
            </div>
            <LogMealForm />
          </section>

          <Separator className="my-8" />

          {/* Weight Snapshot Section */}
          <section>
            <WeightSnapshotForm />
          </section>

          <Separator className="my-8" />

          {/* Meals for Selected Date */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Meals for {getDisplayDate(selectedDate)}
            </h2>

            {isLoadingEntries ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : mealEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm">No meals logged for this day yet</p>
                <p className="text-xs mt-1">
                  Use the form above to log your first meal!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mealEntries.map((entry) => (
                  <MealEntryCard
                    key={entry.meal_entry_id}
                    mealType={entry.meal_type}
                    description={entry.description_text}
                    calories={entry.calories_value}
                    consumedAt={formatTimeForDisplay(entry.consumed_at, timezone)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
