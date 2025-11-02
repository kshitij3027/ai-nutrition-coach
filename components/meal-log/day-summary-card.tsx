"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DaySummaryCardProps {
  date: string; // YYYY-MM-DD
  mealCount: number;
  totalCalories: number;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  displayDate: string; // Formatted date (e.g., "Today", "Oct 18")
}

export function DaySummaryCard({
  mealCount,
  totalCalories,
  isToday,
  isSelected,
  onClick,
  displayDate,
}: DaySummaryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:shadow-sm",
        isToday && "bg-green-50",
        isSelected && "border-green-600 border-2",
        !isSelected && "border"
      )}
    >
      <div className="space-y-1">
        {/* Date */}
        <h3 className={cn("font-semibold", isToday && "text-green-700")}>
          {displayDate}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600">
          {mealCount} {mealCount === 1 ? "meal" : "meals"}
          {totalCalories > 0 && ` — ${totalCalories.toLocaleString()} kcal`}
        </p>
      </div>
    </Card>
  );
}
