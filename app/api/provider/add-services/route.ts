import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    user_id,
    title,
    description,
    category,
    basePrice,
    location,
    lat,
    lng,
    availableDays,
    availableTime,
    serviceRadiusKm,
    experienceYears,
    includesTools,
    tags,
    durationMinutes,
    isCustomPricing = false,
    startingFromPrice,
  } = body;

  // Basic validation
  if (!user_id || !title || !category || !location || lat == null || lng == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Pricing validation
  if (isCustomPricing) {
    if (startingFromPrice === undefined || startingFromPrice === null) {
      return NextResponse.json(
        { error: "Starting price required for custom pricing services" }, 
        { status: 400 }
      );
    }
  } else {
    if (basePrice === undefined || basePrice === null) {
      return NextResponse.json(
        { error: "Base price required for fixed pricing services" }, 
        { status: 400 }
      );
    }
  }

  try {
    const service = await prisma.service.create({
      data: {
        user_id,
        title,
        description,
        category,
        location,
        lat,
        lng,
        availableDays,
        availableTime,
        serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : null,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        includesTools,
        tags,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : 30,
        isCustomPricing,
        basePrice: isCustomPricing ? null : parseInt(basePrice),
        startingFromPrice: isCustomPricing ? parseInt(startingFromPrice) : null,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Error adding service:", err);
    return NextResponse.json({ error: "Failed to add service" }, { status: 500 });
  }
}
