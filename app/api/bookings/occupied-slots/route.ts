// Route: /api/bookings/occupied-slots

import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { format } from "date-fns";

// Add proper error handling and logging
export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId");
    const dateStr = req.nextUrl.searchParams.get("date");

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: "Missing serviceId or date" }, 
        { status: 400 }
      );
    }

    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use yyyy-MM-dd" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const start = startOfDay(parsedDate);
    const end = endOfDay(parsedDate);

    const bookings = await prisma.booking.findMany({
      where: {
        serviceId,
        scheduledAt: { gte: start, lte: end },
        status: { notIn: ["CANCELLED",] }
      },
      select: { scheduledAt: true },
    });

  // /api/bookings/occupied-slots
const occupied = bookings.map(booking => 
  format(new Date(booking.scheduledAt), "HH:mm:ss") // Include seconds for precision
);
    return NextResponse.json({ occupied });

  } catch (error) {
    console.error("Error in /api/bookings/occupied-slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}