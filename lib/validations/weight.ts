import { z } from 'zod';

/**
 * Weight form validation schema
 *
 * Validates weight logging form data with the following rules:
 * - weight_value: Required, > 0, max 2 decimal places
 * - weight_unit_hint: Required, 'kg' or 'lbs' (per-snapshot, not user preference)
 * - recorded_at: Auto-set to now (no user input in MVP)
 */
export const weightFormSchema = z.object({
  weight_value: z
    .number({
      message: 'Weight must be a number',
    })
    .positive('Weight must be greater than 0')
    .max(500, 'Weight must be less than 500 kg')
    .refine(
      (val) => {
        // Check max 2 decimal places
        const decimalPlaces = (val.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      },
      { message: 'Weight can have at most 2 decimal places' }
    ),

  weight_unit_hint: z.enum(['kg', 'lbs'], {
    message: 'Please select a valid unit (kg or lbs)',
  }),

  recorded_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
});

export type WeightFormInput = z.infer<typeof weightFormSchema>;
