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

    const [upcomingCount, completedCount, earnings, reviews] = await Promise.all([
      prisma.booking.count({
        where: {
          service: {
            is: {
              user_id: userId
            }
          },
          scheduledAt: { gte: new Date() },
          status: { notIn: ["CANCELLED", "COMPLETED"] }
        }
      }),
      prisma.booking.count({
        where: {
          service: {
            is: {
              user_id: userId
            }
          },
          status: "COMPLETED"
        }
      }),
      prisma.booking.aggregate({
        _sum: { quotedPrice: true },
        where: {
          service: {
            is: {
              user_id: userId
            }
          },
          status: "COMPLETED"
        }
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        where: {
          booking: {
            is: {
              service: {
                is: {
                  user_id: userId
                }
              }
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      upcomingCount,
      completedCount,
      earnings: earnings._sum.quotedPrice || 0,
      rating: reviews._avg.rating ? parseFloat(reviews._avg.rating.toFixed(1)) : 0
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
