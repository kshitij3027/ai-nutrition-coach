import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { TutorialCompletion } from "@/lib/types/onboarding";

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

    // Prepare tutorial completion data
    const isCompleted = body.completed !== undefined ? Boolean(body.completed) : true;
    const tutorialData: Partial<TutorialCompletion> = {
      user_id: userId,
      completed: isCompleted,
      // Only set completed_at when completed=true to satisfy DB constraint
      completed_at: isCompleted ? new Date().toISOString() : undefined,
    };

    // Insert tutorial completion record
    const { data: tutorialRecord, error: tutorialError } = await supabase
      .from("tutorial_completions")
      .insert(tutorialData)
      .select("completion_id, user_id, completed, completed_at, created_at")
      .single();

    if (tutorialError) {
      console.error("Tutorial completion error:", tutorialError);
      return NextResponse.json(
        { error: "Failed to save tutorial completion", details: tutorialError.message },
        { status: 500 }
      );
    }

    // Update profiles table to mark onboarding as completed
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("user_id, email, onboarding_completed, onboarding_completed_at, created_at, last_activity")
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile", details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tutorial: tutorialRecord,
        profile: profileData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tutorial completion save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
