import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
where: { user_id: userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
orderBy: { created_at: "desc" }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}