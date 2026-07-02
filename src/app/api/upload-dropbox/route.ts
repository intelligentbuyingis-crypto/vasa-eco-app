import { getDropboxToken } from "@/lib/dropboxToken";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const { htmlContent, filename, projectName, date } = await req.json();

    if (!htmlContent || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let DROPBOX_TOKEN: string;
    try {
      DROPBOX_TOKEN = await getDropboxToken();
    } catch (tokenErr) {
      return NextResponse.json({ error: tokenErr instanceof Error ? tokenErr.message : "Token error" }, { status: 503 });
    }

    // Build folder path: /פרויקט/תאריך/קובץ
    const safeProject = (projectName || "כללי").replace(/[\\/:*?"<>|]/g, "_");
    const safeDate = (date || new Date().toISOString().split("T")[0]).replace(/[\\/:*?"<>|]/g, "_");
    const safeFilename = filename.replace(/[\\/:*?"<>|]/g, "_");

    const dropboxPath = `/${safeProject}/${safeDate}/${safeFilename}`;

    // Convert HTML string to bytes (storing as .html since true PDF conversion needs server-side rendering)
    const fileBytes = Buffer.from(htmlContent, "utf-8");

    // Dropbox-API-Arg header must be ASCII-safe. Escape all non-ASCII chars
    // (e.g. Hebrew) to \uXXXX sequences, per Dropbox API documentation.
    const escapeNonAscii = (str: string): string => {
      return str.replace(/[\u0080-\uffff]/g, (ch) => {
        return "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0");
      });
    };

    const apiArgJson = JSON.stringify({
      path: dropboxPath,
      mode: "overwrite",
      autorename: false,
      mute: false,
    });
    const apiArgHeader = escapeNonAscii(apiArgJson);

    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_TOKEN}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": apiArgHeader,
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Dropbox upload error:", errText);
      return NextResponse.json(
        { error: `Dropbox: ${errText}`, status: uploadRes.status },
        { status: 500 }
      );
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
