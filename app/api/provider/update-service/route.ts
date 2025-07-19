import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const body = await req.json();
  const {
    id,
    title,
    description,
    category,
    basePrice,
    startingFromPrice,
    isCustomPricing,
    location,
    availableTime,
    serviceRadiusKm,
    experienceYears,
    includesTools,
    tags,
    durationMinutes,
    availableDays,
  } = body;

  if (!id || !title || !category || !location || !durationMinutes) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate pricing based on isCustomPricing
  if (isCustomPricing && !startingFromPrice) {
    return NextResponse.json(
      { error: "Starting from price is required for custom pricing" },
      { status: 400 }
    );
  }

  if (!isCustomPricing && !basePrice) {
    return NextResponse.json(
      { error: "Base price is required for fixed pricing" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        category,
        basePrice: isCustomPricing ? null : Number(basePrice),
        startingFromPrice: isCustomPricing ? Number(startingFromPrice) : null,
        isCustomPricing,
        location,
        availableTime,
        serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        includesTools: includesTools || false,
        tags,
        durationMinutes: Number(durationMinutes),
        availableDays,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Service Error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}