// /app/api/bookings/provider/route.ts
import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.headers.get("x-user-id"); // Supabase UID

  if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 });

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        service: {
          user_id: uid,
        },
      },
      include: {
        user: true,
        service: true,
      },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[PROVIDER BOOKINGS ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
