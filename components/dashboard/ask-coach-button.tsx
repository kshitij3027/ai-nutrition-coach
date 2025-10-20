"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskCoachButtonProps {
  className?: string;
}

export function AskCoachButton({ className }: AskCoachButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "bg-green-600 hover:bg-green-700 text-white",
              "shadow-lg hover:shadow-xl",
              "rounded-full h-14 px-6",
              "transition-all duration-200",
              "hidden sm:flex items-center gap-2",
              className
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">Ask Your Coach</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white">
          <p className="text-sm">Coming soon in next update</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
