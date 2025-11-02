import { z } from 'zod';

/**
 * Meal form validation schema
 *
 * Validates meal logging form data with the following rules:
 * - description: Required, 1-500 characters
 * - meal_type: Required, one of the preset types
 * - calories: Optional, must be >= 0 if provided
 * - consumed_at: Auto-set to now (no user input in MVP)
 */
export const mealFormSchema = z.object({
  description: z
    .string()
    .min(1, 'Meal description is required')
    .max(500, 'Description must be 500 characters or less')
    .trim(),

  meal_type: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack'], {
    message: 'Please select a valid meal type',
  }),

  calories: z
    .number()
    .nonnegative('Calories must be 0 or greater')
    .max(10000, 'Calories must be less than 10,000')
    .nullable()
    .optional(),

  consumed_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
});

export type MealFormInput = z.infer<typeof mealFormSchema>;
