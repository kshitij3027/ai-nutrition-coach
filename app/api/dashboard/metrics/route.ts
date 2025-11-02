/**
 * Dashboard Metrics API Route
 * GET /api/dashboard/metrics?timezone=America/New_York
 *
 * Returns comprehensive dashboard metrics:
 * - Today's meal totals (calories, entry count)
 * - Current streak
 * - 7-day weight trend
 *
 * Entity Model Notes:
 * - Implements "Dashboard —summarizes→ Meal Entry" relation (derived, no persistence)
 * - Implements "Dashboard —charts→ Weight Snapshot" relation (derived, no persistence)
 * - Streak follows "Streak Continuity" rule (auto-updated via DB trigger)
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getTodaysTotals } from '@/lib/services/meal-service';
import { getWeightTrend } from '@/lib/services/weight-service';
import { getCurrentStreak } from '@/lib/services/streak-service';

export async function GET(request: Request) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get('timezone'); // Required

    // Validate timezone parameter
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all metrics in parallel for better performance
    const [todaysTotals, currentStreak, weightTrend] = await Promise.all([
      getTodaysTotals(userId, timezone).catch((error) => {
        console.error('Error fetching today\'s totals:', error);
        return { calories_today: 0, entries_today: 0 };
      }),
      getCurrentStreak(userId).catch((error) => {
        console.error('Error fetching current streak:', error);
        return 0;
      }),
      getWeightTrend(userId, timezone).catch((error) => {
        console.error('Error fetching weight trend:', error);
        return [];
      }),
    ]);

    console.log('🔍 [Dashboard API] Promise.all results:', {
      todaysTotals,
      currentStreak,
      weightTrend: weightTrend?.length || 0,
      userId,
      timezone,
      timestamp: new Date().toISOString()
    });

    // Calculate weight delta (most recent - oldest in 7-day trend)
    let weightDelta: number | null = null;
    if (weightTrend.length >= 2) {
      const mostRecent = weightTrend[weightTrend.length - 1].weight_kg;
      const oldest = weightTrend[0].weight_kg;
      weightDelta = mostRecent - oldest;
    }

    const responseMetrics = {
      calories_today: todaysTotals.calories_today,
      entries_today: todaysTotals.entries_today,
      current_streak: currentStreak,
      weight_trend_7d: weightTrend,
      weight_delta_7d: weightDelta,
    };
    console.log('🔍 [Dashboard API] Sending response:', {
      success: true,
      metrics: responseMetrics,
      timestamp: new Date().toISOString()
    });

    // Return comprehensive metrics
    return NextResponse.json(
      {
        success: true,
        metrics: {
          // Today's meal totals (derived from meal_entry via RPC)
          calories_today: todaysTotals.calories_today,
          entries_today: todaysTotals.entries_today,

          // Current streak (from streak_counter table, updated by trigger)
          current_streak: currentStreak,

          // 7-day weight trend (derived from weight_snapshot via RPC)
          weight_trend_7d: weightTrend,
          weight_delta_7d: weightDelta,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard metrics fetch error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
