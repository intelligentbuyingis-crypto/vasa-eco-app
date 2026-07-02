import { getDropboxToken } from "@/lib/dropboxToken";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const PROJECTS_FILE_PATH = "/_projects.json";

type Project = {
  id: string;
  name: string;
  address: string;
  client: string;
  createdAt: string;
  createdBy: string;
};

async function downloadProjectsFile(token: string): Promise<Project[]> {
  try {
    const res = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Dropbox-API-Arg": JSON.stringify({ path: PROJECTS_FILE_PATH }),
      },
    });
    if (!res.ok) {
      // File doesn't exist yet — return empty list
      return [];
    }
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function uploadProjectsFile(token: string, projects: Project[]): Promise<void> {
  const content = JSON.stringify(projects, null, 2);
  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: PROJECTS_FILE_PATH,
        mode: "overwrite",
        autorename: false,
        mute: true,
      }),
    },
    body: Buffer.from(content, "utf-8"),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to save projects: ${errText}`);
  }
}

export async function GET() {
  try {
    let token: string;
    try { token = await getDropboxToken(); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Token error" }, { status: 503 }); }
    const projects = await downloadProjectsFile(token);
    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let token: string;
    try { token = await getDropboxToken(); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Token error" }, { status: 503 }); }

    const { name, address, client, createdBy } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Missing project name" }, { status: 400 });
    }

    // Download current list, check for duplicate, append, upload back
    const projects = await downloadProjectsFile(token);
    const trimmedName = name.trim();
    const existing = projects.find(p => p.name.trim() === trimmedName);

    if (existing) {
      return NextResponse.json({ project: existing, isNew: false });
    }

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: trimmedName,
      address: address || "",
      client: client || "",
      createdAt: new Date().toISOString(),
      createdBy: createdBy || "",
    };

    projects.push(newProject);
    await uploadProjectsFile(token, projects);

    return NextResponse.json({ project: newProject, isNew: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
