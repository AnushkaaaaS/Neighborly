// /app/api/bookings/user/route.ts
import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 });

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: uid },
      include: {
        service: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[USER BOOKINGS ERROR]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
