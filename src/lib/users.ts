export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  isAdmin: boolean;
};

export const defaultUsers: User[] = [
  { id: "1", name: "דני וזה", username: "danny", password: "vasa2024", isAdmin: true },
  { id: "2", name: "ענב אורן", username: "enav", password: "enav123", isAdmin: false },
  { id: "3", name: "אורן פלדמן", username: "oren", password: "oren123", isAdmin: false },
  { id: "4", name: "עומר לבנה", username: "omer", password: "omer123", isAdmin: false },
];

const STORAGE_KEY = "vasa_users";

export function getUsers(): User[] {
  if (typeof window === "undefined") return defaultUsers;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(stored);
  } catch { return defaultUsers; }
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function authenticate(username: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) ?? null;
}
