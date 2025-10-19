import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { HealthGoal } from "@/lib/types/onboarding";

export async function GET() {
  try {
    // Get authenticated user ID
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all health goals for user
    const { data, error } = await supabase
      .from("health_goals")
      .select("goal_id, user_id, goal_type, is_primary, priority_rank, selected_at")
      .eq("user_id", userId)
      .order("selected_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch health goals", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { goals: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health goals fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate that goals array exists
    if (!body.goals || !Array.isArray(body.goals)) {
      return NextResponse.json(
        { error: "Invalid request: goals must be an array" },
        { status: 400 }
      );
    }

    if (body.goals.length === 0) {
      return NextResponse.json(
        { error: "At least one goal is required" },
        { status: 400 }
      );
    }

    // Delete existing goals for user
    const { error: deleteError } = await supabase
      .from("health_goals")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete existing goals", details: deleteError.message },
        { status: 500 }
      );
    }

    // Prepare new goals for insertion
    const goalsToInsert: Partial<HealthGoal>[] = body.goals.map(
      (goal: {
        goal_type?: string;
        is_primary?: boolean;
        priority_rank?: number;
      }) => ({
        user_id: userId,
        goal_type: goal.goal_type, // This is now the database enum value
        is_primary: goal.is_primary || false,
        priority_rank: goal.priority_rank || 0,
        selected_at: new Date().toISOString(),
      })
    );

    // Batch insert new goals
    const { data, error } = await supabase
      .from("health_goals")
      .insert(goalsToInsert)
      .select("goal_id, user_id, goal_type, is_primary, priority_rank, selected_at");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save health goals", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        goals: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health goals save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
