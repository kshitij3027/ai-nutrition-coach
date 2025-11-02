/**
 * Meal History API Route
 * GET /api/meals/history?date=YYYY-MM-DD&timezone=America/New_York
 *
 * Returns meals for a specific date or today in the user's timezone.
 *
 * Entity Model Note:
 * - Returns read-only data (meal_type and created_at are immutable)
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMealHistory } from '@/lib/services/meal-service';

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
    const date = searchParams.get('date'); // Optional: YYYY-MM-DD
    const timezone = searchParams.get('timezone'); // Required

    // Validate timezone parameter
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone query parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch meal history
    const meals = await getMealHistory(
      userId,
      timezone,
      date || undefined
    );

    return NextResponse.json(
      {
        success: true,
        meals,
        date: date || 'today',
        count: meals.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Meal history fetch error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch meal history',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
