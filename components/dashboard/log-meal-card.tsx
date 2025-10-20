"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogMealCardProps {
  className?: string;
}

export function LogMealCard({ className }: LogMealCardProps) {
  return (
    <Card className={cn("bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardContent className="pt-8 pb-8 px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Large Log Meal Button */}
          <Button
            size="lg"
            disabled
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 relative w-full sm:w-auto transition-all duration-200 touch-manipulation"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Log Meal
            <Badge
              variant="secondary"
              className="ml-2 sm:ml-3 bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs"
            >
              Coming Soon
            </Badge>
          </Button>

          {/* Subtext */}
          <p className="text-sm text-gray-500">
            You&apos;ve logged <span className="font-semibold text-gray-700">0 of 3</span> meals today
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
