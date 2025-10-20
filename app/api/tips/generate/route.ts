// API Route: Generate Nutrition Tip
// POST /api/tips/generate
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateNutritionTip } from "@/lib/services/openrouter";
import type { GenerateTipRequest, GenerateTipResponse, GenerateTipError } from "@/lib/types/dashboard";

/**
 * POST /api/tips/generate
 * Generate a personalized nutrition tip based on user's health goal
 *
 * Request body:
 * {
 *   "healthGoal": "Weight Loss"
 * }
 *
 * Response:
 * {
 *   "tip": "Focus on eating more protein-rich foods like lean meats, fish, and legumes..."
 * }
 */
export async function POST(request: Request) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth();

    if (!userId) {
      const errorResponse: GenerateTipError = {
        error: "Unauthorized",
        details: "You must be logged in to generate nutrition tips"
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Parse and validate request body
    let body: GenerateTipRequest;
    try {
      body = await request.json();
    } catch {
      const errorResponse: GenerateTipError = {
        error: "Invalid request body",
        details: "Request body must be valid JSON"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate healthGoal field
    if (!body.healthGoal || typeof body.healthGoal !== 'string' || body.healthGoal.trim().length === 0) {
      const errorResponse: GenerateTipError = {
        error: "Missing or invalid healthGoal",
        details: "Request must include a non-empty 'healthGoal' string field"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Generate nutrition tip using OpenRouter
    const tip = await generateNutritionTip(body.healthGoal);

    // Return successful response
    const successResponse: GenerateTipResponse = {
      tip
    };
    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    // Log error for debugging
    console.error("Error generating nutrition tip:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return error response
    const errorResponse: GenerateTipError = {
      error: "Failed to generate nutrition tip",
      details: error instanceof Error ? error.message : "An unknown error occurred"
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
