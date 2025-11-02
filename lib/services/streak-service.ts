/**
 * Streak Service
 *
 * Handles streak counter queries.
 *
 * Entity Model Notes:
 * - Streak auto-updates via database trigger following "Streak Continuity" rule
 * - Increments when today has ≥1 entry
 * - Resets to 0 when a calendar day is missed
 * - Day boundaries respect user's local timezone
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Streak counter data
 */
export interface StreakCounter {
  counter_id: string;
  user_id: string;
  current_streak_days: number;
  last_logged_date: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

/**
 * Get current streak for a user
 * Reads from streak_counter table (updated by DB trigger)
 *
 * @param userId - Clerk user ID
 * @returns Current streak count in days
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Query streak_counter table
    const { data, error } = await supabase
      .from('streak_counter')
      .select('current_streak_count')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no streak record exists yet, return 0 (not an error)
      if (error.code === 'PGRST116') {
        console.log(`No streak counter found for user: ${userId}`);
        return 0;
      }

      console.error('Supabase error fetching streak:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch streak: ${error.message}`);
    }

    return data?.current_streak_count ?? 0;
  } catch (error) {
    console.error('Error in getCurrentStreak:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get full streak counter record
 * Useful for debugging and admin views
 *
 * @param userId - Clerk user ID
 * @returns Full streak counter record or null
 */
export async function getStreakCounter(userId: string): Promise<StreakCounter | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Query streak_counter table
    const { data, error } = await supabase
      .from('streak_counter')
      .select('counter_id, user_id, current_streak_days, last_logged_date, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no streak record exists yet, return null (not an error)
      if (error.code === 'PGRST116') {
        console.log(`No streak counter found for user: ${userId}`);
        return null;
      }

      console.error('Supabase error fetching streak counter:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      throw new Error(`Failed to fetch streak counter: ${error.message}`);
    }

    return data as StreakCounter;
  } catch (error) {
    console.error('Error in getStreakCounter:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
