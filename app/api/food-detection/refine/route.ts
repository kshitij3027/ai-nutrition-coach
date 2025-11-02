/**
 * Food Detection Refine API Route
 *
 * POST /api/food-detection/refine
 *
 * Accepts detected food items and uses LLM to refine them into
 * a natural meal description with aggregated calories and suggested meal type.
 *
 * Request: { detectedItems: DetectedItem[], currentTime: string }
 * Response: RefinedMealData
 *
 * Authentication: Clerk (required)
 */

import { auth } from "@clerk/nextjs/server";
import { refineDetectionWithLLM } from "@/lib/services/food-llm-refiner";
import type { DetectedItem } from "@/lib/types/food-detection";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { detectedItems, currentTime } = body;

    if (!detectedItems || !Array.isArray(detectedItems)) {
      return Response.json(
        { error: "Invalid detection data. Expected array of detected items." },
        { status: 400 }
      );
    }

    if (detectedItems.length === 0) {
      return Response.json(
        { error: "No detected items to refine" },
        { status: 400 }
      );
    }

    // Validate detected items structure
    const isValidItems = detectedItems.every(
      (item: { name: unknown; confidence: unknown }) =>
        typeof item.name === "string" &&
        typeof item.confidence === "number"
    );

    if (!isValidItems) {
      return Response.json(
        { error: "Invalid item structure. Each item must have name and confidence." },
        { status: 400 }
      );
    }

    const refined = await refineDetectionWithLLM(
      detectedItems as DetectedItem[],
      new Date(currentTime || Date.now())
    );

    console.log(`Food refinement successful for user ${userId}: "${refined.description}"`);

    return Response.json(refined);
  } catch (error) {
    console.error("Refinement error:", error);
    return Response.json(
      { error: "Failed to refine detection. Please try again." },
      { status: 500 }
    );
  }
}
