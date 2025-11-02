/**
 * Meal Entry Types
 *
 * Entity Model Constraints:
 * - meal_type and created_at are IMMUTABLE once saved
 * - description_text, calories_value, macros_payload, consumed_at are MUTABLE
 * - consumed_at defaults to "now" in MVP (no back-dating UI)
 */

/**
 * Meal type preset enum
 * Note: This is an immutable attribute once a meal is saved
 */
export type MealTypePreset = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

/**
 * Meal Entry - matches database schema
 *
 * IMMUTABLE FIELDS (cannot be edited after creation):
 * - meal_type: Fixed attribute per entity model
 * - created_at: System timestamp, never modified
 *
 * MUTABLE FIELDS (can be updated):
 * - description_text: User can edit meal description
 * - calories_value: User can update calorie count
 * - macros_payload: Nutritional breakdown (free-form JSONB)
 * - consumed_at: When meal was eaten (MVP: defaults to now)
 */
export interface MealEntry {
  meal_entry_id: string;
  user_id: string;
  meal_type: MealTypePreset; // IMMUTABLE
  description_text: string;
  calories_value: number | null;
  macros_payload: Record<string, unknown> | null;
  consumed_at: string; // ISO timestamp
  created_at: string; // ISO timestamp - IMMUTABLE
}

/**
 * Meal form data for logging new meals
 */
export interface MealFormData {
  description: string; // Required, 1-500 chars
  meal_type: MealTypePreset; // Required
  calories?: number | null; // Optional, >= 0
  consumed_at?: string; // Auto-set to now in MVP
}

/**
 * Meal history item for display in sidebar/list
 */
export interface MealHistoryItem {
  meal_entry_id: string;
  meal_type: MealTypePreset;
  description_text: string;
  calories_value: number | null;
  consumed_at: string;
  created_at: string;
}

/**
 * Daily summary for sidebar
 * Aggregates meals by date (respects timezone day boundaries)
 */
export interface DailySummary {
  date: string; // YYYY-MM-DD in user's local timezone
  meal_count: number;
  total_calories: number;
  is_today: boolean;
}
