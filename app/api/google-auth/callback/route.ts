// /app/api/google-auth/callback/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-auth/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code!);
    const encodedToken = encodeURIComponent(JSON.stringify(tokens));
    const successRedirect = `provider/dashboard?token=${encodedToken}`;
    return NextResponse.redirect(new URL(successRedirect, req.nextUrl.origin));
  } catch (err) {
    console.error("Error exchanging token", err);
    return new NextResponse("Authentication failed", { status: 500 });
  }
}
