// app/api/google-auth/save-tokens/route.ts
import { prisma } from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { access_token, refresh_token, expiry_date, user_id } = body;

  if (!user_id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  await prisma.providerProfile.update({
    where: { userId: user_id },
    data: {
      googleAccessToken: access_token,
      googleRefreshToken: refresh_token,
      googleTokenExpiry: new Date(expiry_date),
    },
  });

  return NextResponse.json({ success: true });
}
