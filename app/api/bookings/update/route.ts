import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { bookingId, status, rejectionReason } = await req.json();

  // ✅ Include "REJECTED" now
  const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"];

  if (!bookingId || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || "No reason provided" : null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[BOOKING UPDATE ERROR]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
