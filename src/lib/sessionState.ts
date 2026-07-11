import type { FieldJournalData } from "@/types/forms";

const KEY_SESSION = "vasa_active_session";
const KEY_JOURNAL = "vasa_journal_draft";
const KEY_STEP    = "vasa_current_step";

export type ActiveSession = {
  projectId: string;
  projectName: string;
  date: string;
  startedAt: string;
};

export type AppStep = "dashboard" | "project-select" | "field" | "summary" | "chain" | "admin";

function today() { return new Date().toISOString().split("T")[0]; }

export function saveSession(s: ActiveSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SESSION, JSON.stringify(s));
}

export function loadSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    if (!raw) return null;
    const s: ActiveSession = JSON.parse(raw);
    if (s.date !== today()) { clearSession(); return null; }
    return s;
  } catch { return null; }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  [KEY_SESSION, KEY_JOURNAL, KEY_STEP].forEach(k => localStorage.removeItem(k));
}

export function saveJournal(data: FieldJournalData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_JOURNAL, JSON.stringify(data));
}

export function loadJournal(): FieldJournalData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_JOURNAL);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveStep(step: AppStep) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_STEP, step);
}

export function loadStep(): AppStep {
  if (typeof window === "undefined") return "dashboard";
  return (localStorage.getItem(KEY_STEP) as AppStep) || "dashboard";
}
