// Dashboard Type Definitions

import { GoalTypeEnum } from "./onboarding";

// User dashboard profile data
export interface DashboardProfile {
  firstName: string;
  fullName: string;
  primaryGoal: GoalTypeEnum | null;
  primaryGoalDisplay: string | null;
}

// Health goal data from Supabase
export interface HealthGoalData {
  goal_id: string;
  user_id: string;
  goal_type: GoalTypeEnum;
  is_primary: boolean;
  priority_rank: number;
  selected_at: string;
}

// Health profile data from Supabase
export interface HealthProfileData {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  biological_sex: "male" | "female" | "other";
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number | null;
  activity_level: string;
  created_at: string;
  updated_at: string;
}

// API response types
export interface GenerateTipRequest {
  healthGoal: string;
}

export interface GenerateTipResponse {
  tip: string;
}

export interface GenerateTipError {
  error: string;
  details?: string;
}

// OpenRouter API types
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Progress metrics (for future use)
export interface ProgressMetrics {
  caloriesConsumed: number;
  caloriesTarget: number;
  weightTrend: number; // in kg or lbs
  loggingStreak: number; // days
}
