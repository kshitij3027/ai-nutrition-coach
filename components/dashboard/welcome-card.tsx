import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  firstName: string;
  healthGoal: string;
  className?: string;
}

export function WelcomeCard({ firstName, healthGoal, className }: WelcomeCardProps) {
  return (
    <Card className={cn("bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardContent className="pt-6 pb-6 px-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center transition-colors">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
              Welcome back, {firstName}!
            </h2>
            <p className="text-sm text-gray-600 break-words">
              Your primary goal:{" "}
              <span className="font-semibold text-green-600">{healthGoal}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
