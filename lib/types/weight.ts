/**
 * Weight Snapshot Types
 *
 * Entity Model Constraints:
 * - recorded_at is IMMUTABLE (fixed when snapshot is created)
 * - weight_value and weight_unit_hint are MUTABLE (can be corrected)
 * - weight_unit_hint is per-snapshot, NOT a user-level preference
 */

/**
 * Weight unit enum
 * Note: Unit is stored per-snapshot, not as a user preference
 */
export type WeightUnit = 'kg' | 'lbs';

/**
 * Weight Snapshot - matches database schema
 *
 * IMMUTABLE FIELDS (cannot be edited after creation):
 * - recorded_at: Timestamp when snapshot was taken
 *
 * MUTABLE FIELDS (can be updated):
 * - weight_value: User can correct measurement
 * - weight_unit_hint: User can change unit per snapshot
 */
export interface WeightSnapshot {
  weight_snapshot_id: string;
  user_id: string;
  weight_value: number; // Actual weight measurement
  weight_unit_hint: WeightUnit; // Unit for this specific snapshot (not a user setting)
  recorded_at: string; // ISO timestamp - IMMUTABLE
}

/**
 * Weight form data for logging new snapshots
 */
export interface WeightFormData {
  weight_value: number; // Required, > 0, max 2 decimals
  weight_unit_hint: WeightUnit; // Required per snapshot
  recorded_at?: string; // Auto-set to now in MVP
}

/**
 * Weight trend data for dashboard chart (7-day)
 */
export interface WeightTrendData {
  date: string; // YYYY-MM-DD
  weight_kg: number; // Normalized to kg for charting
  original_value: number; // Original measurement
  original_unit: WeightUnit; // Original unit
}
