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

    // Upsert profile to Supabase
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          email: email,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

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
