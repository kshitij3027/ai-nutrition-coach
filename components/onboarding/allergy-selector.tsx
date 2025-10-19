'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { COMMON_ALLERGENS, type AllergySeverity } from '@/lib/types/onboarding';
import { cn } from '@/lib/utils';
import { Plus, X, Info } from 'lucide-react';

export interface AllergySelectorProps {
  selectedAllergies: {
    allergen_name: string;
    severity_level: AllergySeverity;
  }[];
  onChange: (
    allergies: {
      allergen_name: string;
      severity_level: AllergySeverity;
    }[]
  ) => void;
}

export function AllergySelector({
  selectedAllergies,
  onChange,
}: AllergySelectorProps) {
  const [customAllergen, setCustomAllergen] = React.useState('');

  const isAllergenSelected = (allergenName: string) => {
    return selectedAllergies.some((a) => a.allergen_name === allergenName);
  };

  const getAllergenSeverity = (allergenName: string): AllergySeverity => {
    const allergen = selectedAllergies.find((a) => a.allergen_name === allergenName);
    return allergen?.severity_level || 'moderate';
  };

  const handleToggleAllergen = (allergenName: string) => {
    if (isAllergenSelected(allergenName)) {
      // Remove allergen
      onChange(selectedAllergies.filter((a) => a.allergen_name !== allergenName));
    } else {
      // Add allergen with default severity
      onChange([
        ...selectedAllergies,
        { allergen_name: allergenName, severity_level: 'moderate' },
      ]);
    }
  };

  const handleSeverityChange = (allergenName: string, severity_level: AllergySeverity) => {
    onChange(
      selectedAllergies.map((a) =>
        a.allergen_name === allergenName ? { ...a, severity_level } : a
      )
    );
  };

  const handleAddCustomAllergen = () => {
    const trimmed = customAllergen.trim();
    if (!trimmed) return;

    // Check if already exists
    if (selectedAllergies.some((a) => a.allergen_name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    onChange([
      ...selectedAllergies,
      { allergen_name: trimmed, severity_level: 'moderate' },
    ]);
    setCustomAllergen('');
  };

  const handleRemoveCustomAllergen = (allergenName: string) => {
    onChange(selectedAllergies.filter((a) => a.allergen_name !== allergenName));
  };

  const customAllergies = selectedAllergies.filter(
    (a) => !COMMON_ALLERGENS.includes(a.allergen_name)
  );

  return (
    <div className="space-y-6">
      {/* Helper text */}
      <p className="text-sm text-muted-foreground">
        Select any food allergies or intolerances you have. If you have none, simply leave this section blank and continue.
      </p>

      {/* Common allergens */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">Common Allergens</h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <div className="space-y-2">
                <p className="font-semibold">Severity Levels:</p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Severe:</strong> Life-threatening reaction requiring immediate medical attention (anaphylaxis, EpiPen needed)</li>
                  <li>• <strong>Moderate:</strong> Allergic reaction with symptoms like hives, swelling, or breathing difficulty</li>
                  <li>• <strong>Intolerance:</strong> Digestive discomfort like bloating, gas, or nausea</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-3">
          {COMMON_ALLERGENS.map((allergen) => {
            const isSelected = isAllergenSelected(allergen);
            return (
              <div
                key={allergen}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  isSelected ? 'bg-accent/50 border-[#20df6c]/30' : 'border-border'
                )}
              >
                <Checkbox
                  id={`allergen-${allergen}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleAllergen(allergen)}
                />
                <div className="flex-1 grid gap-2">
                  <Label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {allergen}
                  </Label>
                  {isSelected && (
                    <Select
                      value={getAllergenSeverity(allergen)}
                      onValueChange={(value) =>
                        handleSeverityChange(allergen, value as AllergySeverity)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="severe">Severe (Anaphylaxis)</SelectItem>
                        <SelectItem value="moderate">Moderate (Allergic reaction)</SelectItem>
                        <SelectItem value="intolerance">Intolerance (Digestive issues)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom allergen input */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Other Allergies</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter custom allergen..."
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomAllergen();
              }
            }}
            maxLength={50}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCustomAllergen}
            disabled={!customAllergen.trim()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {/* Display custom allergies */}
        {customAllergies.length > 0 && (
          <div className="space-y-2">
            {customAllergies.map((allergen) => (
              <div
                key={allergen.allergen_name}
                className="flex items-start gap-3 p-3 rounded-lg border bg-accent/50 border-[#20df6c]/30"
              >
                <div className="flex-1 grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{allergen.allergen_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveCustomAllergen(allergen.allergen_name)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <Select
                    value={allergen.severity_level}
                    onValueChange={(value) =>
                      handleSeverityChange(allergen.allergen_name, value as AllergySeverity)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="severe">Severe (Anaphylaxis)</SelectItem>
                      <SelectItem value="moderate">Moderate (Allergic reaction)</SelectItem>
                      <SelectItem value="intolerance">Intolerance (Digestive issues)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
