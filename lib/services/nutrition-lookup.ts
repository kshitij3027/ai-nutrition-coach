/**
 * Nutrition Lookup Service
 *
 * This service queries the USDA FoodData Central API to fetch
 * nutritional information for detected food items.
 *
 * API: USDA FoodData Central
 * Free tier: 1,000 requests/hour with DEMO_KEY
 *
 * API Documentation: https://fdc.nal.usda.gov/api-guide.html
 * Sign up for API key: https://fdc.nal.usda.gov/api-key-signup.html
 */

import type { NutritionData } from "@/lib/types/food-detection";

/**
 * Fetches nutritional information for a food item from USDA FoodData Central
 *
 * @param foodName - Name of the food item (e.g., "burger", "salad", "chicken breast")
 * @returns Nutrition data with calories and macros, or null if not found
 *
 * @example
 * ```typescript
 * const nutrition = await getNutritionForFood("burger");
 * if (nutrition) {
 *   console.log(`Calories: ${nutrition.calories}`);
 * }
 * ```
 */
export async function getNutritionForFood(
  foodName: string
): Promise<NutritionData | null> {
  const startTime = Date.now();

  console.log('USDA: Starting nutrition lookup', {
    foodName,
  });

  try {
    // Call USDA FoodData Central API
    const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
    const usingDemoKey = apiKey === "DEMO_KEY";

    console.log('USDA: API configuration', {
      usingDemoKey,
      rateLimit: usingDemoKey ? '1000 requests/hour' : 'Custom key limits',
    });

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        foodName
      )}&api_key=${apiKey}`
    );

    const apiDuration = Date.now() - startTime;
    console.log('USDA: Received response', {
      status: response.status,
      statusText: response.statusText,
      duration: `${apiDuration}ms`,
    });

    if (!response.ok) {
      console.error('USDA: HTTP error', {
        foodName,
        status: response.status,
        statusText: response.statusText,
        duration: `${apiDuration}ms`,
      });
      return null;
    }

    const data = await response.json();

    console.log('USDA: Search results', {
      foodName,
      totalResults: data.foods?.length || 0,
      topResult: data.foods?.[0]?.description,
    });

    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      const nutrients = food.foodNutrients;

      console.log('USDA: Extracting nutrients', {
        foodDescription: food.description,
        totalNutrients: nutrients?.length || 0,
      });

      // Extract calories (nutrient ID 1008)
      const caloriesNutrient = nutrients.find(
        (n: { nutrientId: number; value: number }) => n.nutrientId === 1008
      );

      // Extract protein (nutrient ID 1003)
      const proteinNutrient = nutrients.find(
        (n: { nutrientId: number; value: number }) => n.nutrientId === 1003
      );

      // Extract carbs (nutrient ID 1005)
      const carbsNutrient = nutrients.find(
        (n: { nutrientId: number; value: number }) => n.nutrientId === 1005
      );

      // Extract fat (nutrient ID 1004)
      const fatNutrient = nutrients.find(
        (n: { nutrientId: number; value: number }) => n.nutrientId === 1004
      );

      // Log missing nutrients
      const missingNutrients = [];
      if (!caloriesNutrient) missingNutrients.push('calories');
      if (!proteinNutrient) missingNutrients.push('protein');
      if (!carbsNutrient) missingNutrients.push('carbs');
      if (!fatNutrient) missingNutrients.push('fat');

      if (missingNutrients.length > 0) {
        console.warn('USDA: Missing nutrients', {
          foodName,
          missing: missingNutrients,
        });
      }

      const nutritionData: NutritionData = {
        calories: Math.round(caloriesNutrient?.value || 0),
        protein: proteinNutrient?.value ? Math.round(proteinNutrient.value) : undefined,
        carbs: carbsNutrient?.value ? Math.round(carbsNutrient.value) : undefined,
        fat: fatNutrient?.value ? Math.round(fatNutrient.value) : undefined,
      };

      const totalDuration = Date.now() - startTime;
      console.log('USDA: Lookup successful', {
        foodName,
        nutritionData,
        totalDuration: `${totalDuration}ms`,
      });

      return nutritionData;
    }

    const totalDuration = Date.now() - startTime;
    console.warn('USDA: No results found', {
      foodName,
      totalDuration: `${totalDuration}ms`,
    });
    return null;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('USDA: Lookup failed', {
      foodName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      totalDuration: `${totalDuration}ms`,
    });
    return null;
  }
}
