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
