import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ message: "Latitude and longitude are required" }, { status: 400 });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = 50;

  const EARTH_RADIUS_KM = 6371;

  try {
    const services = await prisma.service.findMany({
      where: {
        lat: {
          not: null,
        },
        lng: {
          not: null,
        },
      },
    });

    const nearbyServices = services.filter((service) => {
      const dLat = (Math.PI / 180) * (service.lat! - userLat);
      const dLng = (Math.PI / 180) * (service.lng! - userLng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((Math.PI / 180) * userLat) *
          Math.cos((Math.PI / 180) * service.lat!) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = EARTH_RADIUS_KM * c;

      return distance <= radiusKm;
    });

    return NextResponse.json(nearbyServices);
  } catch (error) {
    console.error("Error fetching nearby services:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
