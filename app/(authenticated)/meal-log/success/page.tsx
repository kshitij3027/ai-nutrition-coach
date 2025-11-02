"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MealLogSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Meal Logged Successfully
          </h1>
          <p className="text-sm text-gray-600">
            Your meal has been logged. You can now view your dashboard or chat with our AI coach.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            Go to Dashboard
          </Button>
          <Button
            disabled
            variant="outline"
            className="flex-1 h-12"
          >
            Chat with AI Coach (coming soon)
          </Button>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 pt-2">
          Your streak has been updated automatically!
        </p>
      </Card>
    </div>
  );
}
