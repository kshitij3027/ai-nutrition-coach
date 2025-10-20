import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressSnapshotProps {
  isNewUser?: boolean;
  className?: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  iconBgColor: string;
  iconColor: string;
}

function MetricCard({ icon, label, value, subtext, iconBgColor, iconColor }: MetricCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105", iconBgColor)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 break-words">{value}</p>
        {subtext && <p className="text-xs text-gray-600 mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProgressSnapshot({ isNewUser = false, className }: ProgressSnapshotProps) {
  return (
    <Card className={cn("bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Progress Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {isNewUser ? (
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
          // Metrics grid for existing users
          <div className="grid gap-3">
            <MetricCard
              icon={<Flame className="w-5 h-5" />}
              label="Calories Today"
              value="850 / 2,200"
              subtext="kcal"
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
            <MetricCard
              icon={<TrendingDown className="w-5 h-5" />}
              label="Weight Trend"
              value="-1.2 lbs"
              subtext="Last 7 days"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              icon={<Calendar className="w-5 h-5" />}
              label="Logging Streak"
              value="12 days"
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
