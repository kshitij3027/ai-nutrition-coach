'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DIET_TYPE_OPTIONS } from '@/lib/types/onboarding';
import { cn } from '@/lib/utils';
import { Check, Info } from 'lucide-react';

export interface DietTypeSelectorProps {
  selectedDietTypes: string[];
  onChange: (dietTypes: string[]) => void;
}

export function DietTypeSelector({
  selectedDietTypes,
  onChange,
}: DietTypeSelectorProps) {
  const isDietTypeSelected = (dietTypeName: string) => {
    return selectedDietTypes.includes(dietTypeName);
  };

  const handleToggleDietType = (dietTypeName: string) => {
    if (dietTypeName === 'None') {
      // Clear all selections
      onChange([]);
      return;
    }

    if (isDietTypeSelected(dietTypeName)) {
      // Remove diet type
      onChange(selectedDietTypes.filter((dt) => dt !== dietTypeName));
    } else {
      // Add diet type
      onChange([...selectedDietTypes, dietTypeName]);
    }
  };

  const isNoneSelected = selectedDietTypes.length === 0;

  return (
    <div className="space-y-4">
      {/* None option */}
      <Card
        role="button"
        tabIndex={0}
        onClick={() => handleToggleDietType('None')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleDietType('None');
          }
        }}
        className={cn(
          'relative cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:scale-[1.02]',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isNoneSelected
            ? 'border-[#20df6c] border-2 bg-[#20df6c]/5 focus:ring-[#20df6c]'
            : 'border-border hover:border-[#20df6c]/50 focus:ring-[#20df6c]/50'
        )}
        aria-pressed={isNoneSelected}
        aria-label={`None: No specific dietary restrictions. ${isNoneSelected ? 'Selected' : 'Not selected'}`}
      >
        <CardContent className="p-4 flex items-center gap-3">
          {/* Checkmark indicator */}
          {isNoneSelected && (
            <div
              className="size-5 rounded-full bg-[#20df6c] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Check className="size-3 text-white" />
            </div>
          )}
          {!isNoneSelected && (
            <div className="size-5 rounded-full border-2 border-border shrink-0" aria-hidden="true" />
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-sm">None</h3>
            <p className="text-xs text-muted-foreground">No specific dietary restrictions</p>
          </div>
        </CardContent>
      </Card>

      {/* Diet type grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {DIET_TYPE_OPTIONS.map((dietType) => {
          const isSelected = isDietTypeSelected(dietType.name);
          // Dynamically get the Lucide icon component
          const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
            dietType.icon
          ];

          return (
            <Card
              key={dietType.name}
              role="button"
              tabIndex={0}
              onClick={() => handleToggleDietType(dietType.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleDietType(dietType.name);
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
              aria-label={`${dietType.name}: ${dietType.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
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

                {/* Diet type name */}
                <div className="flex items-center gap-1.5 justify-center">
                  <h3
                    className={cn(
                      'font-semibold text-sm leading-tight',
                      isSelected ? 'text-foreground' : 'text-foreground'
                    )}
                  >
                    {dietType.name}
                  </h3>
                  {(dietType.name === 'Low-FODMAP' || dietType.name === 'Ketogenic') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p>
                          {dietType.name === 'Low-FODMAP'
                            ? 'Low-FODMAP reduces foods that ferment in your gut (Fermentable Oligosaccharides, Disaccharides, Monosaccharides, And Polyols). Helpful for IBS and digestive issues. Limits onions, garlic, certain fruits, and some grains.'
                            : 'Ketogenic diet: Very low carbohydrate (typically <50g/day), high fat diet that puts your body in ketosis. Focuses on meat, fish, eggs, nuts, healthy oils, and low-carb vegetables.'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Description */}
                <p
                  className={cn(
                    'text-xs leading-tight transition-colors',
                    isSelected ? 'text-muted-foreground' : 'text-muted-foreground'
                  )}
                >
                  {dietType.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
