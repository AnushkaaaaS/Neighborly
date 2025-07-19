import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const body = await req.json();
  const {
    id,
    title,
    description,
    category,
    price,
    location,
    availableTime,
    serviceRadiusKm,
    experienceYears,
    includesTools,
    tags,
    durationMinutes,
  } = body;

  if (!id || !title || !category || !price || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let lat: number | undefined;
  let lng: number | undefined;

  // ⛳ Get new lat/lng from Google Maps Geocoding API
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const encodedLoc = encodeURIComponent(location);
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLoc}&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (
      geoData.status === "OK" &&
      geoData.results &&
      geoData.results[0]?.geometry?.location
    ) {
      lat = geoData.results[0].geometry.location.lat;
      lng = geoData.results[0].geometry.location.lng;
    }
  } catch (error) {
    console.error("Geocoding API error:", error);
    // Continue without lat/lng if API fails
  }

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        category,
        price,
        location,
        availableTime,
        serviceRadiusKm,
        experienceYears,
        includesTools,
        tags,
        durationMinutes,
        ...(lat !== undefined && lng !== undefined && { lat, lng }), // ⬅️ Only include if found
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Service Error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}
