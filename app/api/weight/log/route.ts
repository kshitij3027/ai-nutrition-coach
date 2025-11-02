/**
 * Weight Logging API Route
 * POST /api/weight/log
 *
 * Logs a new weight snapshot.
 *
 * Entity Model Notes:
 * - recorded_at is IMMUTABLE (set to now)
 * - weight_unit_hint is per-snapshot, NOT a user preference
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logWeight } from '@/lib/services/weight-service';
import { weightFormSchema } from '@/lib/validations/weight';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validatedData = weightFormSchema.parse({
      weight_value: body.weight_value,
      weight_unit_hint: body.weight_unit_hint,
      recorded_at: body.recorded_at,
    });

    // Get timezone from request body (required for timezone-aware handling)
    const timezone = body.timezone;
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }

    // Log the weight snapshot using service layer
    const weightSnapshot = await logWeight(userId, validatedData, timezone);

    // Return success with created weight snapshot
    return NextResponse.json(
      {
        success: true,
        weight: weightSnapshot,
        message: 'Weight logged successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Weight logging error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to log weight',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
