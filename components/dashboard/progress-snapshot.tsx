import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flame, TrendingDown, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/lib/services/dashboard-data";

interface ProgressSnapshotProps {
  metrics?: DashboardMetrics | null;
  isLoading?: boolean;
  className?: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  iconBgColor: string;
  iconColor: string;
  tooltipContent?: string;
}

function MetricCard({ icon, label, value, subtext, iconBgColor, iconColor, tooltipContent }: MetricCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105", iconBgColor)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 break-words">{value}</p>
        {subtext && <p className="text-xs text-gray-600 mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProgressSnapshot({ metrics, isLoading, className }: ProgressSnapshotProps) {
  // Get weight trend display with context-aware messaging
  function getWeightTrendInfo(): { value: string; subtext: string; tooltip: string } {
    const trendData = metrics?.weight_trend_7d;

    // No weight entries at all
    if (!trendData || trendData.length === 0) {
      return {
        value: "No weight logged yet",
        subtext: "Log your weight to start tracking",
        tooltip: "Track your daily weight to see trends over time. We recommend weighing yourself at the same time each day for consistency."
      };
    }

    // Only 1 day of data (or multiple entries on same day)
    if (trendData.length === 1) {
      const latestWeight = trendData[0];
      return {
        value: `${latestWeight.weight.toFixed(1)} ${latestWeight.unit}`,
        subtext: "Log weight tomorrow to see trend",
        tooltip: "You need at least 2 days of weight data to see trends. If you logged multiple weights today, only the most recent one counts."
      };
    }

    // 2+ days of data - calculate trend
    const sortedWeights = [...trendData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const oldest = sortedWeights[0];
    const newest = sortedWeights[sortedWeights.length - 1];

    const delta = newest.weight - oldest.weight;
    const sign = delta > 0 ? "+" : "";

    return {
      value: `${sign}${delta.toFixed(1)} ${newest.unit}`,
      subtext: `Last ${trendData.length} days`,
      tooltip: "Shows your weight change over the tracked period. Multiple weights logged on the same day are deduplicated (most recent kept)."
    };
  }

  return (
    <Card className={cn("bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Progress Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {isLoading ? (
          // Loading state
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !metrics ? (
          // Empty state for new users
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Log some meals to see your progress
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Track your nutrition journey and watch your metrics grow
            </p>
          </div>
        ) : (
          // Metrics grid with real data
          <>
            {console.log('🔍 [ProgressSnapshot] Rendering with metrics:', {
              calories_today: metrics.calories_today,
              entries_today: metrics.entries_today,
              current_streak: metrics.current_streak,
            })}
            <div className="grid gap-3">
            <MetricCard
              icon={<Flame className="w-5 h-5" />}
              label="Calories Today"
              value={`${metrics.calories_today.toLocaleString()} kcal`}
              subtext={`${metrics.entries_today} ${metrics.entries_today === 1 ? "entry" : "entries"}`}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
            <MetricCard
              icon={<TrendingDown className="w-5 h-5" />}
              label="Weight Trend"
              value={getWeightTrendInfo().value}
              subtext={getWeightTrendInfo().subtext}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              tooltipContent={getWeightTrendInfo().tooltip}
            />
            <MetricCard
              icon={<Calendar className="w-5 h-5" />}
              label="Logging Streak"
              value={`${metrics.current_streak} ${metrics.current_streak === 1 ? "day" : "days"}`}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
