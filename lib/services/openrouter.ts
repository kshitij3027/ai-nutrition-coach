// OpenRouter API Service for AI-powered nutrition tips
import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Virtual Nutrition Coach",
  },
});

/**
 * Generate a personalized nutrition tip based on user's health goal
 * @param healthGoal - The user's primary health goal (e.g., "Weight Loss", "Muscle Gain")
 * @returns A concise, actionable nutrition tip
 */
export async function generateNutritionTip(healthGoal: string): Promise<string> {
  try {
    // Validate input
    if (!healthGoal || typeof healthGoal !== 'string' || healthGoal.trim().length === 0) {
      throw new Error('Health goal is required and must be a non-empty string');
    }

    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "system",
          content: "You are a helpful nutrition coach. Provide concise, actionable nutrition tips in 1-2 sentences. Focus on practical advice that users can implement immediately."
        },
        {
          role: "user",
          content: `Generate a nutrition tip for someone whose goal is: ${healthGoal.trim()}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    // Extract the tip from the response
    const tip = completion.choices[0]?.message?.content?.trim();

    if (!tip) {
      // Log warning (not error) since we're handling this gracefully with fallback
      console.warn('OpenRouter returned empty tip, using fallback', {
        healthGoal,
        timestamp: new Date().toISOString(),
      });
      return "Stay hydrated and eat balanced meals throughout the day.";
    }

    return tip;
  } catch (error) {
    // Log warning (not error) since we're handling this gracefully with fallback
    console.warn('OpenRouter API failed, using fallback tip:', {
      message: error instanceof Error ? error.message : String(error),
      healthGoal,
      timestamp: new Date().toISOString(),
    });

    // Return fallback tip instead of throwing
    return "Stay hydrated and eat balanced meals throughout the day.";
  }
}

/**
 * Estimate calories from a meal description using AI
 * @param description - The meal description (e.g., "100g chicken with 1oz mayo and 50g broccoli")
 * @returns Estimated calories as a number
 */
export async function estimateCaloriesFromDescription(description: string): Promise<number> {
  // Try multiple models in order of preference
  const models = [
    "openai/gpt-3.5-turbo",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemini-flash-1.5",
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      // Validate input
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        throw new Error('Meal description is required and must be a non-empty string');
      }

      // Validate API key
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }

      console.log(`Trying model: ${model} for calorie estimation`);

      const completion = await openai.chat.completions.create({
        model: model,
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert specializing in calorie estimation. Your task is to estimate the total calories in a meal based on its description.

IMPORTANT INSTRUCTIONS:
- Analyze the description carefully, identifying all ingredients and their quantities
- Account for portion sizes (grams, ounces, cups, pieces, etc.)
- Consider cooking methods (fried, boiled, grilled) as they affect calories
- Include all condiments, sauces, and oils mentioned
- Be conservative - it's better to slightly overestimate than underestimate
- If quantities are vague (e.g., "some mayo"), assume moderate portions
- Return ONLY a single number representing total calories
- Do not include any explanation, units, or additional text
- If you cannot make a reasonable estimate, return 0`
        },
        {
          role: "user",
          content: `Estimate the total calories in this meal: ${description.trim()}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent estimates
      max_tokens: 50,
    });

      // Log the full response for debugging
      console.log('OpenRouter API response:', {
        model: completion.model,
        choices: completion.choices?.length,
        finish_reason: completion.choices?.[0]?.finish_reason,
        content: completion.choices?.[0]?.message?.content,
      });

      // Extract the calorie estimate from the response
      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        console.warn(`Model ${model} returned empty response, trying next model...`);
        lastError = new Error(`Empty response from model ${model}`);
        continue; // Try next model
      }

      // Parse the number from the response
      const calories = parseInt(response.replace(/[^\d]/g, ''), 10);

      if (isNaN(calories) || calories <= 0) {
        console.warn(`Model ${model} returned invalid calorie estimate: ${response}, trying next model...`);
        lastError = new Error(`Invalid calorie estimate from model ${model}: ${response}`);
        continue; // Try next model
      }

      // Sanity check: calories should be between 1 and 5000 for a single meal
      if (calories > 5000) {
        console.warn('Calorie estimate seems too high, capping at 5000', {
          description,
          original: calories,
          model,
          timestamp: new Date().toISOString(),
        });
        return 5000;
      }

      console.log(`✅ Estimated calories: ${calories} for "${description}" using model: ${model}`);
      return calories;
    } catch (error) {
      console.warn(`Model ${model} failed:`, {
        message: error instanceof Error ? error.message : String(error),
        description,
        timestamp: new Date().toISOString(),
      });
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next model
    }
  }

  // All models failed
  console.error('All models failed to estimate calories:', {
    message: lastError?.message || 'Unknown error',
    description,
    timestamp: new Date().toISOString(),
  });
  throw lastError || new Error('Failed to estimate calories');
}
