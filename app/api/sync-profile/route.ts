import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST() {
  try {
    // Get authenticated user ID
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get full user details
    const user = await currentUser();

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "No email address found" },
        { status: 400 }
      );
    }

    const email = user.emailAddresses[0].emailAddress;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("user_id", userId)
      .single();

    let data;
    let error;

    if (existingProfile) {
      // Profile exists, update only if email changed
      if (existingProfile.email !== email) {
        const updateResult = await supabase
          .from("profiles")
          .update({ email })
          .eq("user_id", userId)
          .select("user_id, email, onboarding_completed, onboarding_completed_at, created_at, last_activity")
          .single();
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // No changes needed, just select existing profile
        const selectResult = await supabase
          .from("profiles")
          .select("user_id, email, onboarding_completed, onboarding_completed_at, created_at, last_activity")
          .eq("user_id", userId)
          .single();
        data = selectResult.data;
        error = selectResult.error;
      }
    } else {
      // Profile doesn't exist, insert new
      const insertResult = await supabase
        .from("profiles")
        .insert({ user_id: userId, email })
        .select("user_id, email, onboarding_completed, onboarding_completed_at, created_at, last_activity")
        .single();
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to sync profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
