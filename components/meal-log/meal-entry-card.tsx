"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MealTypePreset } from "@/lib/types/meal";

interface MealEntryCardProps {
  mealType: MealTypePreset;
  description: string;
  calories: number | null;
  consumedAt: string; // Formatted time (e.g., "10:30 AM")
}

export function MealEntryCard({
  mealType,
  description,
  calories,
  consumedAt,
}: MealEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get meal type badge color
  function getMealTypeBadgeColor(type: MealTypePreset) {
    switch (type) {
      case "Breakfast":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "Lunch":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "Dinner":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "Snack":
        return "bg-orange-500 text-white hover:bg-orange-600";
    }
  }

  // Truncate description if too long
  const shouldTruncate = description.length > 200;
  const displayDescription = shouldTruncate && !isExpanded
    ? description.substring(0, 200) + "..."
    : description;

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header: Badge and Time */}
        <div className="flex items-start justify-between gap-2">
          <Badge className={getMealTypeBadgeColor(mealType)}>{mealType}</Badge>
          <span className="text-xs text-gray-500">{consumedAt}</span>
        </div>

        {/* Description */}
        <p className="text-base text-gray-900">
          {displayDescription}
        </p>

        {/* Read more button */}
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-green-600 hover:text-green-700 px-0"
          >
            {isExpanded ? "Show less" : "Read more"}
          </Button>
        )}

        {/* Calories */}
        {calories !== null && calories > 0 && (
          <p className="text-sm text-gray-600">
            {calories.toLocaleString()} kcal
          </p>
        )}
      </div>
    </Card>
  );
}
