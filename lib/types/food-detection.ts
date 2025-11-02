/**
 * Type definitions for AI food detection pipeline
 *
 * This module defines types for:
 * - Clarifai food recognition API responses
 * - USDA nutrition lookup results
 * - LLM-refined meal data
 * - API request/response payloads
 */

/**
 * A single food item detected by Clarifai
 */
export interface ClarifaiFoodItem {
  name: string;
  confidence: number;
}

/**
 * Result from Clarifai food detection API
 */
export interface FoodDetectionResult {
  success: boolean;
  items: ClarifaiFoodItem[];
  message?: string;
}

/**
 * Nutrition data from USDA FoodData Central
 */
export interface NutritionData {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/**
 * A detected food item with optional nutrition data
 */
export interface DetectedItem {
  name: string;
  confidence: number;
  nutrition?: NutritionData;
}

/**
 * Meal type options
 */
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

/**
 * Refined meal data from LLM processing
 */
export interface RefinedMealData {
  description: string;
  total_calories: number;
  suggested_meal_type: MealType;
  confidence: number;
}
