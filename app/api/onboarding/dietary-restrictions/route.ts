import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { DietaryRestriction, AllergyDetail } from "@/lib/types/onboarding";

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

    // Fetch dietary restrictions for user
    const { data: restrictionsData, error: restrictionsError } = await supabase
      .from("dietary_restrictions")
      .select("restriction_id, user_id, diet_type, custom_restrictions_text, declared_at")
      .eq("user_id", userId)
      .single();

    // Fetch allergy details for user
    const { data: allergiesData, error: allergiesError } = restrictionsData
      ? await supabase
          .from("allergy_details")
          .select("allergy_id, restriction_id, allergen_name, custom_allergen, severity_level")
          .eq("restriction_id", restrictionsData.restriction_id)
      : { data: null, error: null };

    // Handle errors (but no data is not an error)
    if (restrictionsError && restrictionsError.code !== "PGRST116") {
      console.error("Restrictions error:", restrictionsError);
      return NextResponse.json(
        { error: "Failed to fetch dietary restrictions", details: restrictionsError.message },
        { status: 500 }
      );
    }

    if (allergiesError) {
      console.error("Allergies error:", allergiesError);
      return NextResponse.json(
        { error: "Failed to fetch allergy details", details: allergiesError.message },
        { status: 500 }
      );
    }

    // Return combined object
    return NextResponse.json(
      {
        dietary_restrictions: restrictionsData || null,
        allergies: allergiesData || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dietary restrictions fetch error:", error);
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

    // Prepare dietary restrictions data
    const restrictionsData: Partial<DietaryRestriction> = {
      user_id: userId,
      diet_type: body.diet_type || null,
      custom_restrictions_text: body.custom_restrictions_text || null,
    };

    // Upsert to dietary_restrictions table
    const { data: restrictionRecord, error: upsertError } = await supabase
      .from("dietary_restrictions")
      .upsert(restrictionsData, {
        onConflict: "user_id",
      })
      .select("restriction_id, user_id, diet_type, custom_restrictions_text, declared_at")
      .single();

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save dietary restrictions", details: upsertError.message },
        { status: 500 }
      );
    }

    // Delete existing allergy details for user
    const { error: deleteError } = await supabase
      .from("allergy_details")
      .delete()
      .eq("restriction_id", restrictionRecord.restriction_id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete existing allergies", details: deleteError.message },
        { status: 500 }
      );
    }

    // Batch insert new allergy details if any
    let allergyRecords = null;
    if (body.allergies && Array.isArray(body.allergies) && body.allergies.length > 0) {
      const allergiesToInsert: Partial<AllergyDetail>[] = body.allergies.map(
        (allergy: { allergen_name: string; severity_level: string }) => ({
          restriction_id: restrictionRecord.restriction_id,
          allergen_name: allergy.allergen_name,
          severity_level: allergy.severity_level,
        })
      );

      const { data, error: allergiesInsertError } = await supabase
        .from("allergy_details")
        .insert(allergiesToInsert)
        .select("allergy_id, restriction_id, allergen_name, custom_allergen, severity_level");

      if (allergiesInsertError) {
        console.error("Allergies insert error:", allergiesInsertError);
        return NextResponse.json(
          { error: "Failed to save allergy details", details: allergiesInsertError.message },
          { status: 500 }
        );
      }

      allergyRecords = data;
    }

    return NextResponse.json(
      {
        success: true,
        dietary_restrictions: restrictionRecord,
        allergies: allergyRecords || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dietary restrictions save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
