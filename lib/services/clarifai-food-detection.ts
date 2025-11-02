/**
 * Clarifai Food Detection Service
 *
 * This service integrates with Clarifai's food-item-recognition model
 * to detect food items from images using the REST API.
 *
 * Model: food-item-recognition (Food-101 dataset)
 * Free tier: 5,000 operations/month (~167 requests/day)
 *
 * API Documentation: https://docs.clarifai.com/api-guide/predict/images
 */

import type { ClarifaiFoodItem, FoodDetectionResult } from "@/lib/types/food-detection";

const CLARIFAI_API_URL = "https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/outputs";

/**
 * Removes data URI prefix from base64 string if present
 * Clarifai expects raw base64 without "data:image/...;base64," prefix
 */
function cleanBase64(base64String: string): string {
  return base64String.replace(/^data:image\/[a-z]+;base64,/, '');
}

/**
 * Detects food items from an image using Clarifai's food recognition model
 *
 * @param imageBase64 - Base64 encoded image string
 * @returns Detection result with food items and confidence scores
 *
 * @example
 * ```typescript
 * const result = await detectFoodFromImage(base64Image);
 * if (result.success) {
 *   console.log(result.items); // [{ name: "burger", confidence: 85 }, ...]
 * }
 * ```
 */
export async function detectFoodFromImage(
  imageBase64: string
): Promise<FoodDetectionResult> {
  const startTime = Date.now();
  const cleanedBase64 = cleanBase64(imageBase64);

  console.log('Clarifai: Starting food detection', {
    imageSize: cleanedBase64.length,
    imageSizeKB: Math.round(cleanedBase64.length / 1024),
  });

  try {
    // Validate API key
    if (!process.env.CLARIFAI_API_KEY) {
      throw new Error("CLARIFAI_API_KEY is not configured");
    }

    // Prepare request body
    const requestBody = {
      user_app_id: {
        user_id: "clarifai",
        app_id: "main",
      },
      inputs: [
        {
          data: {
            image: {
              base64: cleanedBase64,
            },
          },
        },
      ],
    };

    // Diagnostic logging
    console.log('Clarifai: Request body structure', {
      hasUserAppId: !!requestBody.user_app_id,
      hasInputs: !!requestBody.inputs,
      inputCount: requestBody.inputs.length,
      hasImageData: !!requestBody.inputs[0]?.data?.image,
      base64Type: typeof requestBody.inputs[0]?.data?.image?.base64,
      base64Length: requestBody.inputs[0]?.data?.image?.base64?.length,
      base64First50: requestBody.inputs[0]?.data?.image?.base64?.substring(0, 50),
      base64Last50: requestBody.inputs[0]?.data?.image?.base64?.substring(
        requestBody.inputs[0].data.image.base64.length - 50
      ),
    });

    // Call Clarifai REST API
    console.log('Clarifai: Sending request to API');
    const response = await fetch(CLARIFAI_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Key ${process.env.CLARIFAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const apiDuration = Date.now() - startTime;
    console.log('Clarifai: Received response', {
      status: response.status,
      statusText: response.statusText,
      duration: `${apiDuration}ms`,
    });

    // Check HTTP response
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Clarifai: HTTP error", {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        duration: `${apiDuration}ms`,
      });
      throw new Error(`Clarifai API returned ${response.status}: ${errorBody}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Check Clarifai API status code (10000 = success)
    console.log('Clarifai: API status', {
      code: data.status?.code,
      description: data.status?.description,
    });

    if (data.status?.code !== 10000) {
      throw new Error(
        `Clarifai API error: ${data.status?.description || "Unknown error"}`
      );
    }

    // Extract and parse food concepts
    const concepts = data.outputs?.[0]?.data?.concepts;
    if (!concepts || !Array.isArray(concepts)) {
      throw new Error("Invalid response structure from Clarifai API");
    }

    console.log('Clarifai: Received concepts', {
      totalConcepts: concepts.length,
      topConcepts: concepts.slice(0, 5).map((c: { name: string; value: number }) => ({
        name: c.name,
        confidence: Math.round(c.value * 100),
      })),
    });

    const topItems: ClarifaiFoodItem[] = concepts
      .slice(0, 5) // Take top 5 predictions
      .filter((c: { value: number; name: string }) => c.value > 0.5) // Filter low confidence (50% threshold)
      .map((c: { value: number; name: string }) => ({
        name: c.name,
        confidence: Math.round(c.value * 100),
      }));

    const filteredCount = Math.min(5, concepts.length) - topItems.length;
    if (filteredCount > 0) {
      console.log('Clarifai: Filtered items', {
        filteredCount,
        reason: 'confidence < 50%',
      });
    }

    if (topItems.length === 0) {
      console.error("Clarifai: No food detected", {
        reason: 'All items below 50% confidence threshold',
        totalDuration: `${Date.now() - startTime}ms`,
      });
      return {
        success: false,
        items: [],
        message: "No food detected with sufficient confidence. Please try another photo or enter manually.",
      };
    }

    const totalDuration = Date.now() - startTime;
    console.log('Clarifai: Detection successful', {
      itemCount: topItems.length,
      items: topItems,
      totalDuration: `${totalDuration}ms`,
    });

    return {
      success: true,
      items: topItems,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Clarifai: Detection failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      imageSize: cleanBase64(imageBase64).length,
      totalDuration: `${totalDuration}ms`,
    });

    return {
      success: false,
      items: [],
      message: "Failed to analyze image. Please try again or enter meal manually.",
    };
  }
}
