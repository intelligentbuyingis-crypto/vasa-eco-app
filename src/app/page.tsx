"use client";
import { useState, useEffect } from "react";
import { authenticate } from "@/lib/users";
import { getSession, setSession, clearSession } from "@/lib/session";
import type { User } from "@/lib/users";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (s) setUser(s);
    setLoading(false);
  }, []);

  const login = () => {
    const found = authenticate(username.trim().toLowerCase(), password);
    if (!found) { setError("שם משתמש או סיסמה שגויים"); return; }
    setSession(found);
    setUser(found);
    setError("");
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setUsername("");
    setPassword("");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-sm">טוען...</div>
    </div>
  );

  if (user) return <Dashboard user={user} onLogout={logout} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-3">
            <img src="/logo.png" alt="וזה אקולוגיה" className="h-20 w-auto drop-shadow-lg" />
          </div>
          <p className="text-green-300 text-sm mt-2">מערכת דיגום שדה</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-gray-800 font-medium mb-4 text-center">כניסה למערכת</h2>
          <div className="space-y-3">
            <div>
              <label className="field-label">שם משתמש</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="הכנס שם משתמש"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="field-label">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="הכנס סיסמה"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button onClick={login} className="btn-primary w-full mt-1">
              כניסה
            </button>
          </div>
        </div>
        <p className="text-center text-green-400 text-xs mt-4">גרסה 1.0 · {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
