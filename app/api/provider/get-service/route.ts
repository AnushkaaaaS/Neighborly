import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(service);
  } catch (err) {
    console.error("Get Service Error:", err);
    return NextResponse.json({ error: "Failed to get service" }, { status: 500 });
  }
}
