'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AllergySelector } from '@/components/onboarding/allergy-selector';
import { DietTypeSelector } from '@/components/onboarding/diet-type-selector';
import { CustomRestrictions } from '@/components/onboarding/custom-restrictions';
import {
  dietaryRestrictionsSchema,
  type DietaryRestrictionsFormData,
} from '@/lib/validations/onboarding';
import { type AllergySeverity } from '@/lib/types/onboarding';
import { AlertTriangle, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step3Props {
  onSubmit: (data: {
    allergies: {
      allergen_name: string;
      severity_level: AllergySeverity;
    }[];
    diet_types: string[];
    custom_restrictions: string[];
    confirmation_given: boolean;
  }) => Promise<void>;
  onBack: () => void;
  defaultValues?: Partial<DietaryRestrictionsFormData>;
  isLoading?: boolean;
}

export function Step3DietaryPreferences({
  onSubmit,
  onBack,
  defaultValues,
  isLoading = false,
}: Step3Props) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<DietaryRestrictionsFormData>({
    resolver: zodResolver(dietaryRestrictionsSchema),
    mode: 'onChange',
    defaultValues: {
      allergies: defaultValues?.allergies || [],
      diet_types: defaultValues?.diet_types || [],
      custom_restrictions: defaultValues?.custom_restrictions || [],
      confirmation_given: defaultValues?.confirmation_given || false,
    },
  });

  const allergies = watch('allergies');
  const hasAllergies = allergies && allergies.length > 0;

  const onFormSubmit = async (data: DietaryRestrictionsFormData) => {
    await onSubmit(data);
  };

  const getSeverityLabel = (severity: AllergySeverity): string => {
    switch (severity) {
      case 'severe':
        return 'Severe';
      case 'moderate':
        return 'Moderate';
      case 'intolerance':
        return 'Intolerance';
      default:
        return severity;
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dietary Preferences</h2>
        <p className="text-muted-foreground">
          Help us understand your dietary needs and restrictions so we can provide
          personalized recommendations.
        </p>
      </div>

      {/* Section 1: Allergies */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Food Allergies</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  <strong>Important:</strong> Only select actual allergies or intolerances that cause physical reactions. For foods you simply dislike or prefer to avoid, use the &apos;Additional Restrictions&apos; section below.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Select any food allergies or intolerances you have
          </p>
        </div>

        <Controller
          name="allergies"
          control={control}
          render={({ field }) => (
            <AllergySelector
              selectedAllergies={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {errors.allergies && (
          <p className="text-sm text-destructive">{errors.allergies.message}</p>
        )}
      </div>

      {/* Safety Summary - Show if allergies selected */}
      {hasAllergies && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                Safety Information
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You have indicated the following allergies:
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 ml-4">
                {allergies.map((allergy) => (
                  <li key={allergy.allergen_name} className="list-disc">
                    <span className="font-medium">{allergy.allergen_name}</span>
                    {' - '}
                    <span>{getSeverityLabel(allergy.severity_level)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                We will exclude these ingredients from all recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Diet Types */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Diet Type</h3>
          <p className="text-sm text-muted-foreground">
            Select any dietary patterns you follow (you can select multiple)
          </p>
        </div>

        <Controller
          name="diet_types"
          control={control}
          render={({ field }) => (
            <DietTypeSelector
              selectedDietTypes={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {errors.diet_types && (
          <p className="text-sm text-destructive">{errors.diet_types.message}</p>
        )}
      </div>

      {/* Section 3: Custom Restrictions */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Additional Restrictions</h3>
          <p className="text-sm text-muted-foreground">
            Any other dietary preferences or restrictions we should know about
          </p>
        </div>

        <Controller
          name="custom_restrictions"
          control={control}
          render={({ field }) => (
            <CustomRestrictions
              restrictions={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {errors.custom_restrictions && (
          <p className="text-sm text-destructive">
            {errors.custom_restrictions.message}
          </p>
        )}
      </div>

      {/* Confirmation Checkbox */}
      <div
        className={cn(
          'rounded-lg border p-4 space-y-3',
          errors.confirmation_given
            ? 'border-destructive bg-destructive/5'
            : 'border-border'
        )}
      >
        <Controller
          name="confirmation_given"
          control={control}
          render={({ field }) => (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirmation"
                checked={field.value}
                onCheckedChange={field.onChange}
                className={cn(
                  'mt-0.5',
                  errors.confirmation_given && 'border-destructive'
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="confirmation"
                    className="text-sm font-medium leading-tight cursor-pointer"
                  >
                    I confirm this dietary information is accurate
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>
                        By checking this box, you confirm that the allergy and dietary information you&apos;ve provided is accurate to the best of your knowledge. This helps us keep you safe with our recommendations.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  This information will be used to personalize your meal recommendations
                  and ensure your safety. You can update this at any time in your
                  profile settings.
                </p>
              </div>
            </div>
          )}
        />

        {errors.confirmation_given && (
          <p className="text-sm text-destructive ml-8">
            {errors.confirmation_given.message}
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="flex-1 gap-2 bg-[#20df6c] hover:bg-[#20df6c]/90 text-black"
        >
          {isLoading ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
