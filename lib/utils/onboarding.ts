// Unit Conversion Utilities

/**
 * Convert centimeters to feet and inches
 * @param cm - Height in centimeters
 * @returns Object with feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert feet and inches to centimeters
 * @param feet - Height in feet
 * @param inches - Additional inches
 * @returns Height in centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54 * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10; // Round to 1 decimal place
}

// Progress Calculation Utilities

/**
 * Calculate onboarding progress percentage based on completed steps
 * @param currentStep - The current step number (1-4)
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(currentStep: number): number {
  // Step 1: 25%, Step 2: 50%, Step 3: 75%, Step 4: 100%
  return Math.min(currentStep * 25, 100);
}

/**
 * Determine which step the user should be on based on progress percentage
 * @param progressPercentage - Current progress percentage (0-100)
 * @returns Step number (1-4)
 */
export function getStepFromProgress(progressPercentage: number): number {
  if (progressPercentage === 0) return 1;
  if (progressPercentage <= 25) return 1;
  if (progressPercentage <= 50) return 2;
  if (progressPercentage <= 75) return 3;
  return 4;
}

/**
 * Check if a specific step is completed
 * @param progressPercentage - Current progress percentage (0-100)
 * @param step - Step number to check (1-4)
 * @returns True if the step is completed
 */
export function isStepCompleted(progressPercentage: number, step: number): boolean {
  return progressPercentage >= step * 25;
}

// Activity Level Helpers

/**
 * Get display label for activity level
 * @param level - Activity level enum value
 * @returns Human-readable label
 */
export function getActivityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    sedentary: 'Sedentary (Little to no exercise)',
    lightly_active: 'Lightly Active (1-3 days/week)',
    moderately_active: 'Moderately Active (3-5 days/week)',
    very_active: 'Very Active (6-7 days/week)',
    extremely_active: 'Extremely Active (Athlete/Physical job)',
  };
  return labels[level] || level;
}

/**
 * Get description for activity level
 * @param level - Activity level enum value
 * @returns Description text
 */
export function getActivityLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    sedentary: 'Desk job, minimal physical activity',
    lightly_active: 'Light exercise or sports 1-3 times per week',
    moderately_active: 'Moderate exercise 3-5 times per week',
    very_active: 'Intense exercise 6-7 times per week',
    extremely_active: 'Very intense daily training or physical job',
  };
  return descriptions[level] || '';
}

// Validation Helpers

/**
 * Validate that at least one goal is selected
 * @param goals - Array of selected goal names
 * @returns True if valid
 */
export function validateGoalSelection(goals: string[]): boolean {
  return goals.length > 0;
}

/**
 * Validate allergy severity
 * @param severity - Severity level
 * @returns True if valid
 */
export function isValidAllergySeverity(severity: string): boolean {
  return ['severe', 'moderate', 'intolerance'].includes(severity);
}

// Form Data Helpers

/**
 * Format form data for API submission
 * Removes UI-only fields and formats data structures
 */
export function formatHealthProfileForApi(
  formData: Record<string, unknown>
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { unit_system, ...apiData } = formData;
  return {
    ...apiData,
    target_weight_kg: apiData.target_weight_kg || null,
  };
}

/**
 * Convert API response to form data
 * Adds UI-only fields and formats data structures
 */
export function formatHealthProfileFromApi(
  apiData: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...apiData,
    unit_system: 'metric' as const, // Default to metric
    target_weight_kg: apiData.target_weight_kg || undefined,
  };
}

// BMI Calculation (optional utility)

/**
 * Calculate BMI from height and weight
 * @param heightCm - Height in centimeters
 * @param weightKg - Weight in kilograms
 * @returns BMI value
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category
 * @param bmi - BMI value
 * @returns Category string
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
