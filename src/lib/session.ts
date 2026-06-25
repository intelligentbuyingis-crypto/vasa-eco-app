import { User } from "./users";

const SESSION_KEY = "vasa_session";

export function setSession(user: User) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
