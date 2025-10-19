'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { GoalCard } from '@/components/onboarding/goal-card';
import { HEALTH_GOAL_OPTIONS } from '@/lib/types/onboarding';
import { healthGoalsSchema, HealthGoalsFormData } from '@/lib/validations/onboarding';

export interface Step2HealthGoalsProps {
  onSubmit: (data: { selected_goals: string[]; primary_goal?: string }) => Promise<void>;
  onBack: () => void;
  defaultValues?: { selected_goals?: string[]; primary_goal?: string };
  isLoading?: boolean;
}

export function Step2HealthGoals({
  onSubmit,
  onBack,
  defaultValues,
  isLoading = false,
}: Step2HealthGoalsProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<HealthGoalsFormData>({
    resolver: zodResolver(healthGoalsSchema),
    mode: 'onChange',
    defaultValues: {
      selected_goals: defaultValues?.selected_goals || [],
    },
  });

  const selectedGoals = watch('selected_goals');

  // Track selection order - maps goal name to selection timestamp
  const [selectionOrder, setSelectionOrder] = React.useState<Map<string, number>>(
    new Map()
  );

  // Initialize selection order from defaultValues
  React.useEffect(() => {
    if (defaultValues?.primary_goal && defaultValues?.selected_goals) {
      const newMap = new Map<string, number>();
      // Primary goal gets earliest timestamp (0)
      newMap.set(defaultValues.primary_goal, 0);
      // Other goals get incrementing timestamps
      defaultValues.selected_goals.forEach((goal, index) => {
        if (goal !== defaultValues.primary_goal) {
          newMap.set(goal, index + 1);
        }
      });
      setSelectionOrder(newMap);
    }
  }, [defaultValues?.primary_goal, defaultValues?.selected_goals]);

  // Toggle goal selection
  const toggleGoal = (goalName: string) => {
    const currentGoals = selectedGoals || [];
    const isCurrentlySelected = currentGoals.includes(goalName);

    if (isCurrentlySelected) {
      // Remove goal
      setValue(
        'selected_goals',
        currentGoals.filter((g) => g !== goalName),
        { shouldValidate: true }
      );
      // Remove from selection order tracking
      setSelectionOrder((prev) => {
        const newMap = new Map(prev);
        newMap.delete(goalName);
        return newMap;
      });
    } else {
      // Add goal
      setValue('selected_goals', [...currentGoals, goalName], {
        shouldValidate: true,
      });
      // Record selection timestamp
      setSelectionOrder((prev) => {
        const newMap = new Map(prev);
        newMap.set(goalName, Date.now());
        return newMap;
      });
    }
  };

  // Get the primary goal (first selected)
  const getPrimaryGoal = (): string | undefined => {
    if (selectionOrder.size === 0) return undefined;

    let earliestGoal: string | undefined;
    let earliestTime = Infinity;

    selectionOrder.forEach((time, goalName) => {
      if (time < earliestTime) {
        earliestTime = time;
        earliestGoal = goalName;
      }
    });

    return earliestGoal;
  };

  // Form submission handler
  const handleFormSubmit = async (data: HealthGoalsFormData) => {
    await onSubmit({
      selected_goals: data.selected_goals,
      primary_goal: getPrimaryGoal(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          What are your health goals?
        </h1>
        <p className="text-muted-foreground">
          Select all the goals that matter to you. You can choose multiple goals to get
          personalized nutrition guidance.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Goal Cards Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {HEALTH_GOAL_OPTIONS.map((goal) => (
              <GoalCard
                key={goal.name}
                goalName={goal.name}
                description={goal.description}
                iconName={goal.icon}
                isSelected={selectedGoals?.includes(goal.name) || false}
                onToggle={() => toggleGoal(goal.name)}
              />
            ))}
          </div>

          {/* Validation Error */}
          {errors.selected_goals && (
            <div
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {errors.selected_goals.message}
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground text-center">
            {selectedGoals?.length || 0} goal{selectedGoals?.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[120px]"
          >
            Back
          </Button>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full sm:flex-1 min-w-[120px] bg-[#20df6c] hover:bg-[#20df6c]/90 text-black"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
