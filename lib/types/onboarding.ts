// Onboarding Type Definitions
// Matches Supabase schema structure

export type BiologicalSex = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type UnitSystem = 'metric' | 'imperial';
export type AllergySeverity = 'severe' | 'moderate' | 'intolerance';

// Health Profile (Step 1)
export interface HealthProfile {
  id?: string;
  user_id: string;
  full_name: string;
  age: number;
  biological_sex: BiologicalSex;
  height_cm: number;
  weight_kg: number;
  target_weight_kg?: number | null;
  activity_level: ActivityLevel;
  consent_given: boolean;
  created_at?: string;
  updated_at?: string;
}

// Health Goal (Step 2)
// Database uses goal_type enum, not free-form goal_name
export type GoalTypeEnum =
  | 'weight_loss'
  | 'weight_gain'
  | 'maintain_weight'
  | 'build_muscle'
  | 'improve_energy'
  | 'better_digestion'
  | 'heart_health'
  | 'manage_blood_sugar'
  | 'athletic_performance'
  | 'general_wellness';

export interface HealthGoal {
  goal_id?: string;           // Database uses goal_id, not id
  user_id: string;
  goal_type: GoalTypeEnum;    // Database uses goal_type enum, not goal_name string
  is_primary?: boolean;
  priority_rank?: number;
  selected_at?: string;       // Database uses selected_at, not created_at
}

export type GoalOption = {
  name: string;
  description: string;
  icon: string; // Lucide icon name
};

export const HEALTH_GOAL_OPTIONS: GoalOption[] = [
  {
    name: 'Weight Loss',
    description: 'Reduce body weight through balanced nutrition',
    icon: 'TrendingDown'
  },
  {
    name: 'Muscle Gain',
    description: 'Build lean muscle mass with optimal protein intake',
    icon: 'Dumbbell'
  },
  {
    name: 'Better Energy',
    description: 'Improve daily energy levels and reduce fatigue',
    icon: 'Zap'
  },
  {
    name: 'Improved Digestion',
    description: 'Optimize gut health and digestive function',
    icon: 'Activity'
  },
  {
    name: 'Blood Sugar Control',
    description: 'Maintain stable glucose levels',
    icon: 'BarChart3'
  },
  {
    name: 'Heart Health',
    description: 'Support cardiovascular wellness',
    icon: 'Heart'
  },
  {
    name: 'Reduced Inflammation',
    description: 'Lower chronic inflammation markers',
    icon: 'Flame'
  },
  {
    name: 'Better Sleep',
    description: 'Improve sleep quality through nutrition',
    icon: 'Moon'
  },
  {
    name: 'Athletic Performance',
    description: 'Enhance sports and fitness performance',
    icon: 'Trophy'
  },
  {
    name: 'General Wellness',
    description: 'Overall health and longevity',
    icon: 'Sparkles'
  }
];

// Mapping between UI display names and database enum values
export const GOAL_DISPLAY_TO_ENUM: Record<string, GoalTypeEnum> = {
  'Weight Loss': 'weight_loss',
  'Muscle Gain': 'build_muscle',
  'Better Energy': 'improve_energy',
  'Improved Digestion': 'better_digestion',
  'Blood Sugar Control': 'manage_blood_sugar',
  'Heart Health': 'heart_health',
  'Reduced Inflammation': 'general_wellness', // Map to general_wellness as reduced_inflammation doesn't exist in enum
  'Better Sleep': 'general_wellness', // Map to general_wellness as better_sleep doesn't exist in enum
  'Athletic Performance': 'athletic_performance',
  'General Wellness': 'general_wellness',
};

// Reverse mapping: database enum → UI display name
export const GOAL_ENUM_TO_DISPLAY: Record<GoalTypeEnum, string> = {
  'weight_loss': 'Weight Loss',
  'weight_gain': 'Muscle Gain', // Closest match
  'maintain_weight': 'General Wellness', // No direct UI match
  'build_muscle': 'Muscle Gain',
  'improve_energy': 'Better Energy',
  'better_digestion': 'Improved Digestion',
  'heart_health': 'Heart Health',
  'manage_blood_sugar': 'Blood Sugar Control',
  'athletic_performance': 'Athletic Performance',
  'general_wellness': 'General Wellness',
};

// Dietary Restrictions (Step 3)
export interface DietaryRestriction {
  restriction_id?: string;        // Matches DB primary key
  user_id: string;
  diet_type?: string | null; // e.g., "vegetarian", "vegan", "keto"
  custom_restrictions_text?: string | null;
  declared_at?: string;           // Matches DB timestamp column
}

export interface AllergyDetail {
  allergy_id?: string;            // Matches DB primary key
  restriction_id?: string;        // Matches DB foreign key
  allergen_name: string;
  custom_allergen?: string;       // For custom allergen input
  severity_level: AllergySeverity; // Matches DB column name
}

export type DietType = {
  name: string;
  description: string;
  icon: string; // Lucide icon name
};

export const DIET_TYPE_OPTIONS: DietType[] = [
  {
    name: 'Vegetarian',
    description: 'No meat or fish',
    icon: 'Leaf'
  },
  {
    name: 'Vegan',
    description: 'No animal products',
    icon: 'Sprout'
  },
  {
    name: 'Pescatarian',
    description: 'Fish but no other meat',
    icon: 'Fish'
  },
  {
    name: 'Ketogenic',
    description: 'Low-carb, high-fat',
    icon: 'Beef'
  },
  {
    name: 'Paleo',
    description: 'Whole foods, no grains',
    icon: 'Drumstick'
  },
  {
    name: 'Mediterranean',
    description: 'Plant-based with fish',
    icon: 'UtensilsCrossed'
  },
  {
    name: 'Low-FODMAP',
    description: 'Limited fermentable carbs',
    icon: 'Apple'
  },
  {
    name: 'Gluten-Free',
    description: 'No wheat, barley, rye',
    icon: 'WheatOff'
  },
  {
    name: 'Dairy-Free',
    description: 'No milk products',
    icon: 'MilkOff'
  },
  {
    name: 'Halal',
    description: 'Islamic dietary laws',
    icon: 'Star'
  },
  {
    name: 'Kosher',
    description: 'Jewish dietary laws',
    icon: 'StarHalf'
  }
];

export const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'Mustard'
];

// Tutorial Completion (Step 4)
export interface TutorialCompletion {
  completion_id?: string;         // Matches DB primary key
  user_id: string;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
}

// Onboarding Progress
export interface OnboardingProgress {
  progress_percentage: number;
  current_step: number;
  onboarding_completed: boolean;
  user_exists?: boolean;
  steps_completed?: number;
}

// Form Data Types (for React Hook Form)
export interface Step1FormData {
  full_name: string;
  age: number;
  biological_sex: BiologicalSex;
  height_cm: number;
  weight_kg: number;
  target_weight_kg?: number;
  activity_level: ActivityLevel;
  consent_given: boolean;
  unit_system: UnitSystem; // UI only, not persisted
}

export interface Step2FormData {
  selected_goals: string[]; // Array of goal names
  primary_goal?: string;
}

export interface Step3FormData {
  allergies: {
    allergen_name: string;
    severity_level: AllergySeverity;  // Matches AllergyDetail interface
  }[];
  diet_types: string[]; // Array of diet type names
  custom_restrictions: string[];
  confirmation_given: boolean;
}

export interface Step4FormData {
  tutorial_completed: boolean;
  tutorial_skipped: boolean;
}
