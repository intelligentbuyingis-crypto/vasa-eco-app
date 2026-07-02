// Cache the access token in memory to avoid refreshing on every request
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getDropboxToken(): Promise<string> {
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

  // If we have a refresh token, use it (preferred - never expires)
  if (refreshToken) {
    // Return cached token if still valid (tokens last 4 hours, refresh at 3.5)
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }

    const clientId = process.env.DROPBOX_APP_KEY!;
    const clientSecret = process.env.DROPBOX_APP_SECRET!;

    const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to refresh Dropbox token: ${err}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    // Cache for 3.5 hours (token valid for 4h)
    tokenExpiresAt = Date.now() + 3.5 * 60 * 60 * 1000;
    return cachedToken!;
  }

  // Fall back to static access token (short-lived)
  if (accessToken) {
    return accessToken;
  }

  throw new Error("No Dropbox token configured. Set DROPBOX_REFRESH_TOKEN or DROPBOX_ACCESS_TOKEN in Vercel.");
}
