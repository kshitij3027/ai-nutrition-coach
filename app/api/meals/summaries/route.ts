/**
 * Meal Summaries API Route
 * GET /api/meals/summaries?timezone=America/New_York&limit=30
 *
 * Returns daily summaries for the sidebar.
 * Groups meals by local date using the user's timezone.
 *
 * Entity Model Note:
 * - This is DERIVED DATA per Dashboard entity (no persistence)
 * - Day boundaries respect timezone per "Streak Continuity" rule
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDailySummaries } from '@/lib/services/meal-service';

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
    const limitParam = searchParams.get('limit'); // Optional, default 30

    // Validate timezone parameter
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone query parameter is required' },
        { status: 400 }
      );
    }

    // Parse and validate limit
    const limit = limitParam ? parseInt(limitParam, 10) : 30;
    if (isNaN(limit) || limit < 1 || limit > 365) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Fetch daily summaries
    const summaries = await getDailySummaries(userId, timezone, limit);

    return NextResponse.json(
      {
        success: true,
        summaries,
        count: summaries.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Daily summaries fetch error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch daily summaries',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
