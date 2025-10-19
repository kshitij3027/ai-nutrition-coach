import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

    // Call Supabase RPC function to check onboarding status
    const { data, error } = await supabase
      .rpc("check_user_onboarding_status", {
        p_user_id: userId,
      });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json(
        { error: "Failed to fetch onboarding progress", details: error.message },
        { status: 500 }
      );
    }

    // If no data returned, return default progress
    if (!data) {
      return NextResponse.json(
        {
          progress_percentage: 0,
          current_step: 1,
          onboarding_completed: false,
        },
        { status: 200 }
      );
    }

    // Parse the JSON response from the RPC function
    const statusData = typeof data === 'string' ? JSON.parse(data) : data;

    return NextResponse.json(
      {
        progress_percentage: statusData.progress_percentage || 0,
        current_step: statusData.current_step || 1,
        onboarding_completed: statusData.onboarding_completed || false,
        user_exists: statusData.user_exists !== undefined ? statusData.user_exists : true,
        steps_completed: statusData.steps_completed || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding progress fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
