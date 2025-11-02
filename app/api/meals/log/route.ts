/**
 * Meal Logging API Route
 * POST /api/meals/log
 *
 * Logs a new meal entry with timezone-aware handling.
 * Streak auto-updates via database trigger.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logMeal } from '@/lib/services/meal-service';
import { mealFormSchema } from '@/lib/validations/meal';
import { estimateCaloriesFromDescription } from '@/lib/services/openrouter';
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
    const validatedData = mealFormSchema.parse({
      description: body.description,
      meal_type: body.meal_type,
      calories: body.calories,
      consumed_at: body.consumed_at,
    });

    // Get timezone from request body (required for timezone-aware handling)
    const timezone = body.timezone;
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }

    // Automatic calorie estimation if not provided
    let finalCalories = validatedData.calories;
    let caloriesSource: 'manual' | 'estimated' | null = null;

    if (finalCalories === null || finalCalories === undefined) {
      try {
        finalCalories = await estimateCaloriesFromDescription(validatedData.description);
        caloriesSource = 'estimated';
        console.log(`✨ Estimated calories: ${finalCalories} for "${validatedData.description}"`);
      } catch (error) {
        console.warn('Calorie estimation failed, continuing with null:', {
          error: error instanceof Error ? error.message : String(error),
          description: validatedData.description,
          timestamp: new Date().toISOString(),
        });
        // Continue with null - don't block meal logging
        finalCalories = null;
      }
    } else {
      caloriesSource = 'manual';
    }

    // Prepare meal data with estimated or manual calories
    const mealData = {
      ...validatedData,
      calories: finalCalories,
    };

    // Log the meal using service layer
    const mealEntry = await logMeal(userId, mealData, timezone);

    // Return success with created meal entry
    return NextResponse.json(
      {
        success: true,
        meal: mealEntry,
        calories_source: caloriesSource,
        message: 'Meal logged successfully',
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
    console.error('Meal logging error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to log meal',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
