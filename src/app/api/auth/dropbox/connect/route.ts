import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.DROPBOX_APP_KEY;

  if (!clientId) {
    return NextResponse.json({ error: "DROPBOX_APP_KEY not configured" }, { status: 503 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/dropbox/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    token_access_type: "offline", // This is what gives us a refresh token!
  });

  const authUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
