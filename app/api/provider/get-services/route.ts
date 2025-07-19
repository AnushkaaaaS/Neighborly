import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/provider/get-services?user_id=some-user-id
export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const services = await prisma.service.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            providerProfile: true,
          },
        },
      },
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
