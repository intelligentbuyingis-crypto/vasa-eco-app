import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return new NextResponse(
      `<html dir="rtl"><body style="font-family:Arial;padding:40px;text-align:center">
        <h2 style="color:red">❌ שגיאה בחיבור Dropbox</h2>
        <p>${error || "לא התקבל קוד"}</p>
        <a href="/">חזרה לאפליקציה</a>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const clientId = process.env.DROPBOX_APP_KEY!;
  const clientSecret = process.env.DROPBOX_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/dropbox/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.refresh_token) {
      throw new Error(tokens.error_description || "Failed to get refresh token");
    }

    const refreshToken = tokens.refresh_token;
    const accessToken = tokens.access_token;

    // Show success page with instructions to save the refresh token
    return new NextResponse(
      `<html dir="rtl"><body style="font-family:Arial;padding:40px;max-width:600px;margin:0 auto">
        <h2 style="color:#0d6626">✅ Dropbox חובר בהצלחה!</h2>
        <p style="color:#555">עכשיו צריך לשמור את ה-Refresh Token ב-Vercel:</p>

        <div style="background:#f0f0f0;padding:16px;border-radius:8px;margin:16px 0">
          <p style="font-weight:bold;margin:0 0 8px">Refresh Token (לא יפוג לעולם):</p>
          <code style="word-break:break-all;font-size:12px;background:#fff;padding:8px;display:block;border-radius:4px">
            ${refreshToken}
          </code>
          <button onclick="navigator.clipboard.writeText('${refreshToken}')"
            style="margin-top:8px;padding:6px 14px;background:#0d6626;color:white;border:none;border-radius:4px;cursor:pointer">
            העתק
          </button>
        </div>

        <ol style="line-height:2;color:#555">
          <li>לך ל-<a href="https://vercel.com" target="_blank">vercel.com</a> → הפרויקט שלך</li>
          <li>Settings → Environment Variables</li>
          <li>הוסף משתנה חדש: <code>DROPBOX_REFRESH_TOKEN</code></li>
          <li>הדבק את ה-Token למעלה</li>
          <li>שמור ועשה Redeploy</li>
          <li><strong>מחק</strong> את <code>DROPBOX_ACCESS_TOKEN</code> הישן (כבר לא נדרש)</li>
        </ol>

        <a href="/" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#0d6626;color:white;border-radius:6px;text-decoration:none">
          חזרה לאפליקציה
        </a>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  } catch (err) {
    return new NextResponse(
      `<html dir="rtl"><body style="font-family:Arial;padding:40px;text-align:center">
        <h2 style="color:red">❌ שגיאה</h2>
        <p>${err instanceof Error ? err.message : String(err)}</p>
        <a href="/">חזרה</a>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
