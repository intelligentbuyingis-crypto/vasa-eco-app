export type Project = {
  id: string;
  name: string;
  address: string;
  client: string;
  createdAt: string;
};

const STORAGE_KEY = "vasa_projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(name: string, address = "", client = ""): Project {
  const projects = getProjects();
  // Check if already exists (case-insensitive, trimmed)
  const existing = projects.find(p => p.name.trim() === name.trim());
  if (existing) return existing;

  const newProject: Project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    address,
    client,
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function findProject(name: string): Project | undefined {
  return getProjects().find(p => p.name.trim() === name.trim());
}
