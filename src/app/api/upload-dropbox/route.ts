import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const { htmlContent, filename, projectName, date } = await req.json();

    if (!htmlContent || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

    if (!DROPBOX_TOKEN) {
      return NextResponse.json({
        error: "DROPBOX_ACCESS_TOKEN not configured",
        instructions: "הגדר DROPBOX_ACCESS_TOKEN ב-Vercel Environment Variables"
      }, { status: 503 });
    }

    // Build folder path: /פרויקט/תאריך/קובץ
    const safeProject = (projectName || "כללי").replace(/[\\/:*?"<>|]/g, "_");
    const safeDate = (date || new Date().toISOString().split("T")[0]).replace(/[\\/:*?"<>|]/g, "_");
    const safeFilename = filename.replace(/[\\/:*?"<>|]/g, "_");

    const dropboxPath = `/${safeProject}/${safeDate}/${safeFilename}`;

    // Convert HTML string to bytes (storing as .html since true PDF conversion needs server-side rendering)
    const fileBytes = Buffer.from(htmlContent, "utf-8");

    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_TOKEN}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: dropboxPath,
          mode: "overwrite",
          autorename: false,
          mute: false,
        }),
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Dropbox upload error:", errText);
      throw new Error(`Dropbox upload failed: ${uploadRes.status}`);
    }

    const result = await uploadRes.json();

    return NextResponse.json({
      success: true,
      path: dropboxPath,
      dropboxResult: result,
    });

  } catch (err) {
    console.error("Dropbox API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
