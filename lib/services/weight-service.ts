/**
 * Weight Service
 *
 * Handles weight snapshot CRUD operations and trend queries.
 *
 * Entity Model Notes:
 * - recorded_at is IMMUTABLE after creation
 * - weight_value and weight_unit_hint are MUTABLE
 * - weight_unit_hint is per-snapshot, NOT a user preference
 */

import { supabase } from '@/lib/supabaseClient';
import { WeightSnapshot, WeightFormData, WeightTrendData } from '@/lib/types/weight';

/**
 * Log a new weight snapshot
 *
 * @param userId - Clerk user ID
 * @param weightData - Weight form data
 * @param timezone - User's IANA timezone
 * @returns Created weight snapshot
 */
export async function logWeight(
  userId: string,
  weightData: WeightFormData,
  _timezone: string
): Promise<WeightSnapshot> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Prepare weight snapshot data
    const now = new Date().toISOString();
    const weightSnapshot = {
      user_id: userId,
      weight_value: weightData.weight_value,
      weight_unit_hint: weightData.weight_unit_hint, // Per-snapshot, not user preference
      recorded_at: weightData.recorded_at ?? now, // IMMUTABLE - set once
    };

    // Insert weight snapshot
    const { data, error } = await supabase
      .from('weight_snapshot')
      .insert(weightSnapshot)
      .select('weight_snapshot_id, user_id, weight_value, weight_unit_hint, recorded_at')
      .single();

    if (error) {
      console.error('Supabase error logging weight:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to log weight: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from weight insert');
    }

    return data as WeightSnapshot;
  } catch (error) {
    console.error('Error in logWeight:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get weight trend data for the last 7 days
 * Calls Supabase RPC function for optimized calculation
 *
 * Returns data for Dashboard chart (derived, no persistence)
 *
 * @param userId - Clerk user ID
 * @param timezone - User's IANA timezone
 * @returns Array of weight trend data points
 */
export async function getWeightTrend(
  userId: string,
  timezone: string
): Promise<WeightTrendData[]> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone');
    }

    // Call Supabase RPC function for 7-day weight trend
    const { data, error } = await supabase.rpc('weight_trend_7d', {
      p_user_id: userId,
      tz_name: timezone,
    });

    console.log('🔍 [getWeightTrend] RPC Response:', {
      dataLength: data?.length || 0,
      firstPoint: data?.[0],
      userId,
      timezone,
    });

    if (error) {
      console.error('Supabase RPC error calling weight_trend_7d:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch weight trend: ${error.message}`);
    }

    // RPC returns array of { date: string, weight_value: number, weight_unit_hint: string }
    if (!data || data.length === 0) {
      return [];
    }

    // Transform to WeightTrendData format
    const trendData: WeightTrendData[] = data.map((point: {
      measure_date: string;
      weight_value: number;
      weight_unit_hint: string;
    }) => {
      // Normalize to kg for charting
      const weight_kg =
        point.weight_unit_hint === 'kg'
          ? point.weight_value
          : point.weight_value / 2.20462; // lbs to kg

      return {
        date: point.measure_date,
        weight_kg,
        original_value: point.weight_value,
        original_unit: point.weight_unit_hint as 'kg' | 'lbs',
      };
    });

    return trendData;
  } catch (error) {
    console.error('Error in getWeightTrend:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
