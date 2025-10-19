'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface GoalCardProps {
  goalName: string;
  description: string;
  iconName: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function GoalCard({
  goalName,
  description,
  iconName,
  isSelected,
  onToggle,
}: GoalCardProps) {
  // Dynamically get the Lucide icon component
  const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected
          ? 'border-[#20df6c] border-2 bg-[#20df6c]/5 focus:ring-[#20df6c]'
          : 'border-border hover:border-[#20df6c]/50 focus:ring-[#20df6c]/50'
      )}
      aria-pressed={isSelected}
      aria-label={`${goalName}: ${description}. ${isSelected ? 'Selected' : 'Not selected'}`}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
        {/* Checkmark indicator */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 size-5 rounded-full bg-[#20df6c] flex items-center justify-center"
            aria-hidden="true"
          >
            <Check className="size-3 text-white" />
          </div>
        )}

        {/* Icon */}
        <div
          className={cn(
            'rounded-full p-3 transition-colors',
            isSelected ? 'bg-[#20df6c]/10' : 'bg-muted'
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                'size-6 transition-colors',
                isSelected ? 'text-[#20df6c]' : 'text-muted-foreground'
              )}
            />
          )}
        </div>

        {/* Goal name */}
        <h3
          className={cn(
            'font-semibold text-sm leading-tight',
            isSelected ? 'text-foreground' : 'text-foreground'
          )}
        >
          {goalName}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'text-xs leading-tight transition-colors',
            isSelected ? 'text-muted-foreground' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
