import { NextRequest, NextResponse } from "next/server";

type OverpassElement = {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function getPlaceType(tags: Record<string, string>): string {
  // Determine place type based on OSM tags
  if (tags.amenity) return tags.amenity;
  if (tags.shop) return tags.shop;
  if (tags.tourism) return tags.tourism;
  if (tags.leisure) return tags.leisure;
  if (tags.historic) return tags.historic;
  if (tags.natural) return tags.natural;
  return "place";
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "0");
    const longitude = parseFloat(searchParams.get("longitude") || "0");
    const radius = parseInt(searchParams.get("radius") || "500");

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing latitude or longitude" },
        { status: 400 },
      );
    }

    // Query Overpass API for points of interest
    const overpassQuery = `
      [out:json];
      (
        node["amenity"](around:${radius},${latitude},${longitude});
        node["shop"](around:${radius},${latitude},${longitude});
        node["tourism"](around:${radius},${latitude},${longitude});
        node["leisure"](around:${radius},${latitude},${longitude});
      );
      out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Overpass API request failed");
    }

    const data: OverpassResponse = await response.json();

    // Process and format results
    const places = data.elements
      .filter((el) => el.type === "node" && el.tags && el.tags.name)
      .map((el) => ({
        id: String(el.id),
        name: el.tags.name,
        type: getPlaceType(el.tags),
        lat: el.lat,
        lon: el.lon,
        distance: calculateDistance(latitude, longitude, el.lat, el.lon),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // Return top 50 closest places

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby places" },
      { status: 500 },
    );
  }
}
