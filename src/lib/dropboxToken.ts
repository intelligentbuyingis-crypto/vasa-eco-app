let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getDropboxToken(): Promise<string> {
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  // Debug: log what we have (will show in Vercel logs)
  console.log("Token check:", {
    hasRefreshToken: !!refreshToken,
    hasAccessToken: !!accessToken,
    hasAppKey: !!appKey,
    hasAppSecret: !!appSecret,
    refreshTokenLength: refreshToken?.length ?? 0,
  });

  if (refreshToken && appKey && appSecret) {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }

    const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: appKey,
        client_secret: appSecret,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to refresh Dropbox token: ${err}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + 3.5 * 60 * 60 * 1000;
    return cachedToken!;
  }

  if (accessToken) {
    return accessToken;
  }

  throw new Error(
    `No Dropbox token configured. hasRefresh=${!!refreshToken} hasKey=${!!appKey} hasSecret=${!!appSecret}`
  );
}
