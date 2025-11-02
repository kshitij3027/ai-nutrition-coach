/**
 * Food LLM Refiner Service
 *
 * This service uses OpenRouter (LLM) to refine detected food items into
 * natural meal descriptions, aggregate calories, and suggest meal type.
 *
 * Model: OpenAI GPT-3.5 Turbo (via OpenRouter)
 * Fallback: Simple concatenation if LLM fails
 */

import type { DetectedItem, RefinedMealData } from "@/lib/types/food-detection";

/**
 * Refines detected food items into a natural meal description using LLM
 *
 * @param detectedItems - Array of detected food items with nutrition data
 * @param currentTime - Current time to suggest meal type
 * @returns Refined meal data with description, calories, meal type, and confidence
 *
 * @example
 * ```typescript
 * const refined = await refineDetectionWithLLM(
 *   [{ name: "burger", confidence: 85, nutrition: { calories: 500 } }],
 *   new Date()
 * );
 * console.log(refined.description); // "A burger with fries"
 * ```
 */
export async function refineDetectionWithLLM(
  detectedItems: DetectedItem[],
  currentTime: Date
): Promise<RefinedMealData> {
  const startTime = Date.now();
  const hour = currentTime.getHours();

  // Suggest meal type based on time
  let suggestedMealType: RefinedMealData['suggested_meal_type'] = 'Snack';
  if (hour >= 6 && hour < 11) suggestedMealType = 'Breakfast';
  else if (hour >= 11 && hour < 16) suggestedMealType = 'Lunch';
  else if (hour >= 16 && hour < 22) suggestedMealType = 'Dinner';

  const itemNames = detectedItems.map((item) => item.name).join(", ");
  const totalCalories = detectedItems.reduce(
    (sum, item) => sum + (item.nutrition?.calories || 0),
    0
  );

  // Calculate average confidence
  const avgConfidence = Math.round(
    detectedItems.reduce((sum, item) => sum + item.confidence, 0) /
      detectedItems.length
  );

  console.log('LLM: Starting refinement', {
    itemCount: detectedItems.length,
    items: detectedItems.map(i => ({ name: i.name, confidence: i.confidence })),
    hour,
    suggestedMealType,
  });

  console.log('LLM: Calculated totals', {
    totalCalories,
    avgConfidence,
    itemsWithNutrition: detectedItems.filter(i => i.nutrition).length,
  });

  const prompt = `You are a nutrition assistant. Based on the following detected food items, create a natural meal description (1-2 sentences).

Detected items: ${itemNames}
Time of day: ${hour}:00 (suggested meal type: ${suggestedMealType})
Total estimated calories: ${totalCalories}

Create a concise, natural description that sounds like a person describing their meal. Do not include calories in the description.

Example: "Grilled chicken breast with steamed broccoli and brown rice"

Return ONLY the description, nothing else.`;

  console.log('LLM: Prompt prepared', {
    promptLength: prompt.length,
    promptChars: prompt.length,
  });

  try {
    // Call OpenRouter (reuse existing integration)
    console.log('LLM: Calling OpenRouter API');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful nutrition assistant that creates natural meal descriptions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const apiDuration = Date.now() - startTime;
    console.log('LLM: Received response', {
      status: response.status,
      statusText: response.statusText,
      duration: `${apiDuration}ms`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM: API error', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        duration: `${apiDuration}ms`,
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();

    const totalDuration = Date.now() - startTime;
    console.log('LLM: Refinement successful', {
      description,
      descriptionLength: description.length,
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
      totalDuration: `${totalDuration}ms`,
    });

    return {
      description,
      total_calories: Math.round(totalCalories),
      suggested_meal_type: suggestedMealType,
      confidence: avgConfidence,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('LLM: Refinement failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemCount: detectedItems.length,
      totalDuration: `${totalDuration}ms`,
    });

    // Fallback: Simple concatenation
    console.log('LLM: Using fallback', {
      reason: error instanceof Error ? error.message : 'Unknown error',
      fallbackDescription: itemNames,
      fallbackConfidence: 50,
    });

    return {
      description: itemNames,
      total_calories: Math.round(totalCalories),
      suggested_meal_type: suggestedMealType,
      confidence: 50, // Lower confidence for fallback
    };
  }
}
