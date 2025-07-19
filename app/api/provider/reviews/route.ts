import { prisma } from "@lib/prisma";
import { supabase } from "@lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch all completed bookings for the provider that have a review
    const bookingsWithReviews = await prisma.booking.findMany({
      where: {
        service: {
          user_id: user.id,
        },
        status: "COMPLETED",
        review: {
          isNot: null,
        },
      },
      include: {
        service: {
          select: {
            title: true,
            category: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        review: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        review: {
          createdAt: "desc",
        },
      },
    });

    return NextResponse.json(bookingsWithReviews);
  } catch (err) {
    console.error("Error fetching provider reviews:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
