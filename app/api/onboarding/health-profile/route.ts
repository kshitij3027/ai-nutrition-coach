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

    // Fetch existing health profile for user
    const { data, error } = await supabase
      .from("health_profile")
      .select("profile_id, user_id, full_name, age, biological_sex, height_value, height_unit, current_weight_value, current_weight_unit, target_weight_value, target_weight_unit, activity_level, consent_accepted, consent_accepted_at, created_at, updated_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no profile exists yet, return null (not an error)
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { health_profile: null },
          { status: 200 }
        );
      }

      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch health profile", details: error.message },
        { status: 500 }
      );
    }

    // Transform database fields to frontend-friendly format
    const transformedData = data ? {
      full_name: data.full_name,
      age: data.age,
      biological_sex: data.biological_sex,
      // Convert height value + unit to single height_cm field
      height_cm: data.height_unit === 'cm' ? data.height_value : data.height_value * 2.54,
      // Convert weight value + unit to single weight_kg field
      weight_kg: data.current_weight_unit === 'kg' ? data.current_weight_value : data.current_weight_value / 2.20462,
      // Convert target weight value + unit to single target_weight_kg field
      target_weight_kg: data.target_weight_value
        ? (data.target_weight_unit === 'kg' ? data.target_weight_value : data.target_weight_value / 2.20462)
        : null,
      activity_level: data.activity_level,
      // Map consent_accepted to consent_given
      consent_given: data.consent_accepted,
    } : null;

    return NextResponse.json(
      { health_profile: transformedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health profile fetch error:", error);
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

    // Validate required fields
    const requiredFields = [
      "full_name",
      "age",
      "biological_sex",
      "height_cm",
      "weight_kg",
      "activity_level",
      "consent_given"
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        console.error(`Validation failed: Missing field "${field}"`, body);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Additional validation for data types and ranges
    if (typeof body.age !== 'number' || body.age < 13 || body.age > 120) {
      console.error('Age validation failed:', body.age);
      return NextResponse.json(
        { error: 'Age must be a number between 13 and 120' },
        { status: 400 }
      );
    }

    if (typeof body.height_cm !== 'number' || body.height_cm < 50 || body.height_cm > 300) {
      console.error('Height validation failed:', body.height_cm);
      return NextResponse.json(
        { error: 'Height must be a number between 50 and 300 cm' },
        { status: 400 }
      );
    }

    if (typeof body.weight_kg !== 'number' || body.weight_kg < 20 || body.weight_kg > 500) {
      console.error('Weight validation failed:', body.weight_kg);
      return NextResponse.json(
        { error: 'Weight must be a number between 20 and 500 kg' },
        { status: 400 }
      );
    }

    if (body.target_weight_kg !== null && body.target_weight_kg !== undefined) {
      if (typeof body.target_weight_kg !== 'number' || body.target_weight_kg < 20 || body.target_weight_kg > 500) {
        console.error('Target weight validation failed:', body.target_weight_kg);
        return NextResponse.json(
          { error: 'Target weight must be a number between 20 and 500 kg' },
          { status: 400 }
        );
      }
    }

    if (!['male', 'female', 'other'].includes(body.biological_sex)) {
      console.error('Biological sex validation failed:', body.biological_sex);
      return NextResponse.json(
        { error: 'Invalid biological sex value' },
        { status: 400 }
      );
    }

    const validActivityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'];
    if (!validActivityLevels.includes(body.activity_level)) {
      console.error('Activity level validation failed:', body.activity_level);
      return NextResponse.json(
        { error: 'Invalid activity level value' },
        { status: 400 }
      );
    }

    if (body.consent_given !== true) {
      console.error('Consent validation failed:', body.consent_given);
      return NextResponse.json(
        { error: 'Consent must be given to continue' },
        { status: 400 }
      );
    }

    // Prepare health profile data
    // Transform simplified field names to match database schema
    const healthProfileData: Record<string, unknown> = {
      user_id: userId,
      full_name: body.full_name.trim(),
      age: Number(body.age),
      biological_sex: body.biological_sex,
      // Height: convert single height_cm to value + unit fields
      height_value: Number(body.height_cm),
      height_unit: 'cm',
      // Weight: convert single weight_kg to value + unit fields
      current_weight_value: Number(body.weight_kg),
      current_weight_unit: 'kg',
      // Target weight: convert single target_weight_kg to value + unit fields
      target_weight_value: body.target_weight_kg ? Number(body.target_weight_kg) : null,
      target_weight_unit: body.target_weight_kg ? 'kg' : null,
      activity_level: body.activity_level,
      // Consent: map consent_given to consent_accepted
      consent_accepted: Boolean(body.consent_given),
      consent_accepted_at: Boolean(body.consent_given) ? new Date().toISOString() : null,
    };

    // Upsert to health_profile table
    const { data, error } = await supabase
      .from("health_profile")
      .upsert(healthProfileData, {
        onConflict: "user_id",
      })
      .select("profile_id, user_id, full_name, age, biological_sex, height_value, height_unit, current_weight_value, current_weight_unit, target_weight_value, target_weight_unit, activity_level, consent_accepted, consent_accepted_at, created_at, updated_at")
      .single();

    if (error) {
      console.error("Supabase upsert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        data_sent: healthProfileData,
      });
      return NextResponse.json(
        {
          error: "Failed to save health profile",
          details: error.message,
          hint: error.hint || "Check server logs for more details"
        },
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
    console.error("Health profile save error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
