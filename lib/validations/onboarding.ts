import { z } from 'zod';

// Step 1: Health Profile Validation Schema
export const healthProfileSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  age: z.number()
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),

  biological_sex: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select your biological sex',
  }),

  height_cm: z.number()
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm'),

  weight_kg: z.number()
    .positive('Weight must be positive')
    .min(20, 'Weight must be at least 20 kg')
    .max(500, 'Weight must be less than 500 kg'),

  target_weight_kg: z.number()
    .positive('Target weight must be positive')
    .min(20, 'Target weight must be at least 20 kg')
    .max(500, 'Target weight must be less than 500 kg')
    .optional()
    .nullable(),

  activity_level: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extremely_active'
  ], {
    required_error: 'Please select your activity level',
  }),

  consent_given: z.boolean()
    .refine((val) => val === true, {
      message: 'You must consent to continue',
    }),

  // UI only field for unit toggle
  unit_system: z.enum(['metric', 'imperial']).default('metric'),
});

export type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

// Step 2: Health Goals Validation Schema
export const healthGoalsSchema = z.object({
  selected_goals: z.array(z.string())
    .min(1, 'Please select at least one health goal')
    .max(10, 'You can select up to 10 goals'),

  primary_goal: z.string().optional(),
}).refine((data) => {
  // If primary_goal exists, it must be in selected_goals
  if (data.primary_goal && !data.selected_goals.includes(data.primary_goal)) {
    return false;
  }
  return true;
}, {
  message: 'Primary goal must be one of the selected goals',
  path: ['primary_goal'],
});

export type HealthGoalsFormData = z.infer<typeof healthGoalsSchema>;

// Step 3: Dietary Restrictions Validation Schema
export const dietaryRestrictionsSchema = z.object({
  allergies: z.array(
    z.object({
      allergen_name: z.string().min(1, 'Allergen name is required'),
      severity_level: z.enum(['severe', 'moderate', 'intolerance']),  // Matches DB column
    })
  ).default([]),

  diet_types: z.array(z.string()).default([]),

  custom_restrictions: z.array(z.string()).default([]),

  confirmation_given: z.boolean()
    .refine((val) => val === true, {
      message: 'Please confirm your dietary information before continuing',
    }),
});

export type DietaryRestrictionsFormData = z.infer<typeof dietaryRestrictionsSchema>;

// Step 4: Tutorial Validation Schema
export const tutorialSchema = z.object({
  tutorial_completed: z.boolean().default(false),
  tutorial_skipped: z.boolean().default(false),
});

export type TutorialFormData = z.infer<typeof tutorialSchema>;

// Helper function to validate height ranges based on unit system
export function validateHeightInCm(heightCm: number, unitSystem: 'metric' | 'imperial'): boolean {
  if (unitSystem === 'metric') {
    return heightCm >= 50 && heightCm <= 300;
  } else {
    // Imperial: roughly 1'8" to 9'10"
    return heightCm >= 50 && heightCm <= 300;
  }
}

// Helper function to validate weight ranges based on unit system
export function validateWeightInKg(weightKg: number, unitSystem: 'metric' | 'imperial'): boolean {
  if (unitSystem === 'metric') {
    return weightKg >= 20 && weightKg <= 500;
  } else {
    // Imperial: roughly 44 lbs to 1100 lbs
    return weightKg >= 20 && weightKg <= 500;
  }
}
