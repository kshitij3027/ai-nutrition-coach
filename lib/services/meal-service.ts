/**
 * Meal Service
 *
 * Handles meal entry CRUD operations and history queries.
 * All data returned is DERIVED (no persistence beyond database).
 *
 * Entity Model Notes:
 * - meal_type and created_at are IMMUTABLE after creation
 * - description_text, calories_value, consumed_at are MUTABLE
 */

import { supabase } from '@/lib/supabaseClient';
import { MealEntry, MealHistoryItem, DailySummary, MealFormData } from '@/lib/types/meal';
import { getDateInTimezone, getTodayInTimezone } from '@/lib/utils/timezone';

/**
 * Log a new meal entry
 *
 * @param userId - Clerk user ID
 * @param mealData - Meal form data
 * @param timezone - User's IANA timezone
 * @returns Created meal entry
 */
export async function logMeal(
  userId: string,
  mealData: MealFormData,
  _timezone: string
): Promise<MealEntry> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Prepare meal entry data
    const now = new Date().toISOString();
    const mealEntry = {
      user_id: userId,
      meal_type: mealData.meal_type,
      description_text: mealData.description,
      calories_value: mealData.calories ?? null,
      macros_payload: null, // Not used in MVP
      consumed_at: mealData.consumed_at ?? now,
      created_at: now, // IMMUTABLE - set once
    };

    // Insert meal entry
    const { data, error } = await supabase
      .from('meal_entry')
      .insert(mealEntry)
      .select('meal_entry_id, user_id, meal_type, description_text, calories_value, macros_payload, consumed_at, created_at')
      .single();

    if (error) {
      console.error('Supabase error logging meal:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to log meal: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from meal insert');
    }

    return data as MealEntry;
  } catch (error) {
    console.error('Error in logMeal:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get meal history for a specific date or today
 *
 * @param userId - Clerk user ID
 * @param timezone - User's IANA timezone
 * @param date - Optional date string (YYYY-MM-DD), defaults to today
 * @returns Array of meal history items
 */
export async function getMealHistory(
  userId: string,
  timezone: string,
  date?: string
): Promise<MealHistoryItem[]> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone');
    }

    // Use provided date or get today in user's timezone
    const targetDate = date ?? getTodayInTimezone(timezone);

    // Query meals for the specified date
    // Note: We filter by consumed_at date in the user's timezone
    const { data, error } = await supabase
      .from('meal_entry')
      .select('meal_entry_id, meal_type, description_text, calories_value, consumed_at, created_at')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching meal history:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch meal history: ${error.message}`);
    }

    // Filter by date in user's timezone (client-side filtering)
    // This ensures day boundaries respect the user's local timezone
    const filteredMeals = (data || []).filter((meal) => {
      const mealDate = getDateInTimezone(meal.consumed_at, timezone);
      return mealDate === targetDate;
    });

    return filteredMeals as MealHistoryItem[];
  } catch (error) {
    console.error('Error in getMealHistory:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      date,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get daily summaries for sidebar
 * Returns aggregated meal data grouped by date (respects timezone)
 *
 * This is DERIVED DATA per Dashboard entity model (no persistence)
 *
 * @param userId - Clerk user ID
 * @param timezone - User's IANA timezone
 * @param limit - Number of days to fetch (default 30)
 * @returns Array of daily summaries
 */
export async function getDailySummaries(
  userId: string,
  timezone: string,
  limit: number = 30
): Promise<DailySummary[]> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone');
    }

    // Fetch all meals within the date range
    const { data, error } = await supabase
      .from('meal_entry')
      .select('consumed_at, calories_value')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false })
      .limit(limit * 10); // Fetch more to account for timezone grouping

    if (error) {
      console.error('Supabase error fetching daily summaries:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch daily summaries: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group meals by date in user's timezone
    const summaryMap = new Map<string, { meal_count: number; total_calories: number }>();

    data.forEach((meal) => {
      const date = getDateInTimezone(meal.consumed_at, timezone);

      const existing = summaryMap.get(date) || { meal_count: 0, total_calories: 0 };
      summaryMap.set(date, {
        meal_count: existing.meal_count + 1,
        total_calories: existing.total_calories + (meal.calories_value ?? 0),
      });
    });

    // Convert map to array and sort by date (most recent first)
    const today = getTodayInTimezone(timezone);
    const summaries: DailySummary[] = Array.from(summaryMap.entries())
      .map(([date, stats]) => ({
        date,
        meal_count: stats.meal_count,
        total_calories: stats.total_calories,
        is_today: date === today,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);

    return summaries;
  } catch (error) {
    console.error('Error in getDailySummaries:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get today's totals (calories and entry count)
 * Calls Supabase RPC function for optimized calculation
 *
 * This is DERIVED DATA per Dashboard entity model (no persistence)
 *
 * @param userId - Clerk user ID
 * @param timezone - User's IANA timezone
 * @returns Object with calories_today and entries_today
 */
export async function getTodaysTotals(
  userId: string,
  timezone: string
): Promise<{ calories_today: number; entries_today: number }> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone');
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('todays_totals', {
      p_user_id: userId,
      tz_name: timezone,
    });

    console.log('🔍 [getTodaysTotals] RPC Response:', {
      data,
      isArray: Array.isArray(data),
      dataLength: data?.length,
      firstRow: data?.[0],
      userId,
      timezone,
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Supabase RPC error calling todays_totals:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch today's totals: ${error.message}`);
    }

    // RPC returns array with single row from RETURNS TABLE
    // Handle array response: [ { total_calories: number, entries_count: number } ]
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('🔍 [getTodaysTotals] No data returned, using defaults');
      return { calories_today: 0, entries_today: 0 };
    }

    // Extract first row from array
    const firstRow = data[0];
    const result = {
      calories_today: firstRow?.total_calories ?? 0,
      entries_today: firstRow?.entries_count ?? 0,
    };
    console.log('🔍 [getTodaysTotals] Returning:', result);
    return result;
  } catch (error) {
    console.error('Error in getTodaysTotals:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
