import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type RatingPayload = {
  overallRating: number;
  tasteRating?: number | null;
  foamRating?: number | null;
  creamyRating?: number | null;
  temperatureRating?: number | null;
  presentationRating?: number | null;
  valueForMoneyRating?: number | null;
  barName?: string | null;
  comment?: string;
  pintPrice?: number | null;
  ratedAt: string;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
  placeId?: string;
};

type RecentRatingRow = {
  id: string;
  rating: number;
  bar_name: string | null;
  notes: string | null;
  photo_url: string | null;
  place_id: string | null;
  created_at: string | null;
};

function isValidRating(value: number) {
  return value >= 1 && value <= 5 && Number.isInteger(value * 2);
}

function isValidOptionalRating(value: number | null | undefined) {
  if (value === null || value === undefined) return true;
  return isValidRating(value);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedLimit = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(Math.trunc(parsedLimit), 50))
      : 20;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data, error } = await supabase
      .from("ratings")
      .select("id,rating,bar_name,notes,photo_url,place_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to load recent ratings:", error);
      return NextResponse.json({ error: "Failed to load recent ratings" }, { status: 500 });
    }

    const reviews = ((data ?? []) as RecentRatingRow[]).map((row) => ({
      id: row.id,
      rating: Number(row.rating),
      barName: row.bar_name,
      comment: row.notes,
      photoUrl: row.photo_url,
      placeId: row.place_id,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Recent ratings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: RatingPayload = await request.json();

    // Validate payload
    if (typeof payload.overallRating !== "number" || !isValidRating(payload.overallRating)) {
      return NextResponse.json(
        { error: "Invalid overall rating value (must be between 1 and 5 in 0.5 steps)" },
        { status: 400 },
      );
    }

    const optionalRatings = [
      payload.tasteRating,
      payload.foamRating,
      payload.creamyRating,
      payload.temperatureRating,
      payload.presentationRating,
      payload.valueForMoneyRating,
    ];

    if (!optionalRatings.every(isValidOptionalRating)) {
      return NextResponse.json(
        { error: "Optional ratings must be null or between 1 and 5 in 0.5 steps" },
        { status: 400 },
      );
    }

    if (payload.comment && payload.comment.length > 500) {
      return NextResponse.json({ error: "Comment too long (max 500 chars)" }, { status: 400 });
    }

    if (payload.barName && payload.barName.trim().length > 120) {
      return NextResponse.json({ error: "Bar name too long (max 120 chars)" }, { status: 400 });
    }

    if (
      payload.pintPrice !== null &&
      payload.pintPrice !== undefined &&
      (typeof payload.pintPrice !== "number" || payload.pintPrice < 0)
    ) {
      return NextResponse.json({ error: "Invalid pint price" }, { status: 400 });
    }

    const ratedAt = new Date(payload.ratedAt);
    if (Number.isNaN(ratedAt.getTime())) {
      return NextResponse.json({ error: "Invalid rated date" }, { status: 400 });
    }

    if (
      payload.photoUrl !== null &&
      payload.photoUrl !== undefined &&
      typeof payload.photoUrl !== "string"
    ) {
      return NextResponse.json({ error: "Invalid photo URL" }, { status: 400 });
    }

    if (typeof payload.latitude !== "number" || typeof payload.longitude !== "number") {
      return NextResponse.json({ error: "Invalid geolocation data" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseInsertPayload = {
      user_id: user.id,
      rating: payload.overallRating,
      taste_rating: payload.tasteRating ?? null,
      foam_rating: payload.foamRating ?? null,
      temperature_rating: payload.temperatureRating ?? null,
      presentation_rating: payload.presentationRating ?? null,
      value_for_money_rating: payload.valueForMoneyRating ?? null,
      bar_name: payload.barName?.trim() || null,
      notes: payload.comment || null,
      pint_price: payload.pintPrice ?? null,
      rated_at: ratedAt.toISOString(),
      photo_url: payload.photoUrl ?? null,
      latitude: payload.latitude,
      longitude: payload.longitude,
      place_id: payload.placeId || null,
    };

    // Insert rating into database.
    // If new columns are not yet migrated in the target DB,
    // retry without them to avoid blocking submissions.
    let { data, error } = await supabase.from("ratings").insert({
      ...baseInsertPayload,
      creamy_rating: payload.creamyRating ?? null,
    });

    if (error && (error.code === "42703" || /creamy_rating|bar_name/i.test(error.message))) {
      const fallbackInsert = await supabase.from("ratings").insert(baseInsertPayload);
      data = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: `Failed to save rating: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Rating submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
