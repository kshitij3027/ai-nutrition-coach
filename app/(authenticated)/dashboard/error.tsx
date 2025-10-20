"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 font-semibold">
          Something went wrong
        </AlertTitle>
        <AlertDescription className="text-red-800">
          <p className="mb-3">
            We encountered an error while loading your dashboard. Your data is safe - this is just a temporary issue.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium mb-1">
                Error details (development only)
              </summary>
              <pre className="text-xs bg-red-100 p-2 rounded border border-red-300 overflow-auto max-w-full">
                {error.message}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={reset}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Go to Home
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Need help?</span> If this problem persists, please try:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1 ml-2">
          <li>Refreshing your browser</li>
          <li>Clearing your browser cache</li>
          <li>Checking your internet connection</li>
          <li>Contacting support if the issue continues</li>
        </ul>
      </div>
    </div>
  );
}
