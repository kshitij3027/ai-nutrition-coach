// Dashboard Data Service - Supabase queries for dashboard data
import { supabase } from "@/lib/supabaseClient";
import { HealthGoalData, HealthProfileData } from "@/lib/types/dashboard";

/**
 * Dashboard Metrics - Real-time data from meal and weight entries
 * Derived surface with no persistence (per entity model)
 */
export interface DashboardMetrics {
  calories_today: number;
  entries_today: number;
  current_streak: number;
  weight_trend_7d: Array<{
    date: string;
    weight: number;
    unit: string;
  }>;
}

/**
 * Fetch user's primary health goal from Supabase
 * @param userId - Clerk user ID
 * @returns Primary health goal data or null if not found
 */
export async function getUserHealthGoal(userId: string): Promise<HealthGoalData | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID is required and must be a non-empty string');
    }

    // Query health_goals table for primary goal
    const { data, error } = await supabase
      .from("health_goals")
      .select("goal_id, user_id, goal_type, is_primary, priority_rank, selected_at")
      .eq("user_id", userId.trim())
      .eq("is_primary", true)
      .single();

    if (error) {
      // If no primary goal exists, return null (not an error)
      if (error.code === "PGRST116") {
        console.log(`No primary health goal found for user: ${userId}`);
        return null;
      }

      // Log other errors
      console.error("Supabase error fetching health goal:", {
        message: error.message,
        code: error.code,
        details: error.details,
        userId,
      });
      throw new Error(`Failed to fetch health goal: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getUserHealthGoal:", {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Fetch user's health profile from Supabase
 * @param userId - Clerk user ID
 * @returns Health profile data or null if not found
 */
export async function getUserHealthProfile(userId: string): Promise<HealthProfileData | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID is required and must be a non-empty string');
    }

    // Query health_profile table
    const { data, error } = await supabase
      .from("health_profile")
      .select("profile_id, user_id, full_name, age, biological_sex, height_value, height_unit, current_weight_value, current_weight_unit, target_weight_value, target_weight_unit, activity_level, created_at, updated_at")
      .eq("user_id", userId.trim())
      .single();

    if (error) {
      // If no profile exists, return null (not an error)
      if (error.code === "PGRST116") {
        console.log(`No health profile found for user: ${userId}`);
        return null;
      }

      // Log other errors
      console.error("Supabase error fetching health profile:", {
        message: error.message,
        code: error.code,
        details: error.details,
        userId,
      });
      throw new Error(`Failed to fetch health profile: ${error.message}`);
    }

    // Transform database fields to match HealthProfileData interface
    // Convert height and weight from value + unit to cm and kg
    const transformedData: HealthProfileData = {
      id: data.profile_id,
      user_id: data.user_id,
      full_name: data.full_name,
      age: data.age,
      biological_sex: data.biological_sex,
      // Convert height to cm
      height_cm: data.height_unit === 'cm'
        ? data.height_value
        : data.height_value * 2.54, // inches to cm
      // Convert current weight to kg
      weight_kg: data.current_weight_unit === 'kg'
        ? data.current_weight_value
        : data.current_weight_value / 2.20462, // lbs to kg
      // Convert target weight to kg
      target_weight_kg: data.target_weight_value
        ? (data.target_weight_unit === 'kg'
            ? data.target_weight_value
            : data.target_weight_value / 2.20462)
        : null,
      activity_level: data.activity_level,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return transformedData;
  } catch (error) {
    console.error("Error in getUserHealthProfile:", {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Fetch dashboard metrics for the user
 * Returns derived data from meal entries and weight snapshots (no persistence)
 *
 * @param userId - Clerk user ID
 * @param timezone - IANA timezone identifier for day boundary calculations
 * @returns Dashboard metrics or null if user hasn't logged data yet
 */
export async function getDashboardMetrics(
  userId: string,
  timezone: string
): Promise<DashboardMetrics | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Timezone is required');
    }

    // Call the dashboard metrics API (client-side will use this)
    // For server-side, we can query directly
    // For now, returning a structure that matches what the API returns

    // This function will be called from client-side
    // The actual data fetching is done via the API route
    throw new Error('getDashboardMetrics should be called client-side via API');
  } catch (error) {
    console.error("Error in getDashboardMetrics:", {
      message: error instanceof Error ? error.message : String(error),
      userId,
      timezone,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
