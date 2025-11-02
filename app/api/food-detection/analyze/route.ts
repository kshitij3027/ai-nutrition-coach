/**
 * Food Detection Analyze API Route
 *
 * POST /api/food-detection/analyze
 *
 * Accepts an image upload, detects food items using Clarifai,
 * and fetches nutrition data from USDA FoodData Central.
 *
 * Request: FormData with 'image' file
 * Response: { success: boolean, items?: DetectedItem[], message?: string }
 *
 * Authentication: Clerk (required)
 * Rate limit: Client-side enforced (10 uploads/day per user)
 */

import { auth } from "@clerk/nextjs/server";
import { detectFoodFromImage } from "@/lib/services/clarifai-food-detection";
import { getNutritionForFood } from "@/lib/services/nutrition-lookup";

export async function POST(request: Request) {
  const startTime = Date.now();

  // Authenticate
  const { userId } = await auth();

  console.log('API /analyze: Request received', {
    userId: userId || 'UNAUTHENTICATED',
    contentType: request.headers.get('content-type'),
  });

  if (!userId) {
    console.warn('API /analyze: Unauthorized request attempt');
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      console.error('API /analyze: No image file provided', { userId });
      return Response.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    console.log('API /analyze: File received', {
      userId,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileSizeKB: Math.round(imageFile.size / 1024),
      fileType: imageFile.type,
    });

    // Validate file size (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
      console.error('API /analyze: File too large', {
        userId,
        fileSize: imageFile.size,
        maxSize: 5 * 1024 * 1024,
      });
      return Response.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(imageFile.type)) {
      console.error('API /analyze: Invalid file type', {
        userId,
        fileType: imageFile.type,
        validTypes,
      });
      return Response.json(
        { error: "Invalid file type. Please upload JPG, PNG, WebP, or HEIC" },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    console.log('API /analyze: Converted to base64', {
      userId,
      base64Size: base64.length,
      base64SizeKB: Math.round(base64.length / 1024),
    });

    // Detect food items
    console.log('API /analyze: Starting food detection', { userId });
    const detectionResult = await detectFoodFromImage(base64);

    const detectionDuration = Date.now() - startTime;
    console.log('API /analyze: Detection completed', {
      userId,
      success: detectionResult.success,
      itemCount: detectionResult.items?.length || 0,
      message: detectionResult.message,
      duration: `${detectionDuration}ms`,
    });

    if (!detectionResult.success) {
      return Response.json(
        {
          success: false,
          message: detectionResult.message || "Failed to detect food",
        },
        { status: 200 } // Not an error, just no detection
      );
    }

    // Fetch nutrition for each item
    console.log('API /analyze: Starting nutrition lookups', {
      userId,
      itemCount: detectionResult.items.length,
    });

    const itemsWithNutrition = await Promise.all(
      detectionResult.items.map(async (item, index) => {
        console.log('API /analyze: Nutrition lookup', {
          userId,
          itemIndex: index + 1,
          totalItems: detectionResult.items.length,
          foodName: item.name,
        });

        const nutrition = await getNutritionForFood(item.name);

        console.log('API /analyze: Nutrition result', {
          userId,
          foodName: item.name,
          found: !!nutrition,
          calories: nutrition?.calories,
        });

        return {
          ...item,
          nutrition,
        };
      })
    );

    const totalDuration = Date.now() - startTime;
    console.log('API /analyze: Request completed successfully', {
      userId,
      itemCount: itemsWithNutrition.length,
      itemsWithNutrition: itemsWithNutrition.filter(i => i.nutrition).length,
      totalDuration: `${totalDuration}ms`,
    });

    return Response.json({
      success: true,
      items: itemsWithNutrition,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('API /analyze: Request failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      totalDuration: `${totalDuration}ms`,
    });

    return Response.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 }
    );
  }
}
