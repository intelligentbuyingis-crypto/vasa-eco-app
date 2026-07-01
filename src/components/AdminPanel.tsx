"use client";
import { useState, useEffect } from "react";
import type { User } from "@/lib/users";
import { getUsers, saveUsers } from "@/lib/users";

type Props = { user: User; onBack: () => void };

export default function AdminPanel({ user, onBack }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "", isAdmin: false });
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", username: "", password: "", isAdmin: false });
  const [editError, setEditError] = useState("");

  useEffect(() => { setUsers(getUsers()); }, []);

  const save = (updated: User[]) => { setUsers(updated); saveUsers(updated); };

  const addUser = () => {
    if (!form.name || !form.username || !form.password) { setError("יש למלא את כל השדות"); return; }
    if (users.find(u => u.username === form.username)) { setError("שם משתמש כבר קיים"); return; }
    const newUser: User = { id: Date.now().toString(), ...form };
    save([...users, newUser]);
    setForm({ name: "", username: "", password: "", isAdmin: false });
    setShowForm(false);
    setError("");
  };

  const deleteUser = (id: string) => {
    if (id === "1") return;
    save(users.filter(u => u.id !== id));
  };

  const toggleAdmin = (id: string) => {
    if (id === "1") return;
    save(users.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, username: u.username, password: u.password, isAdmin: u.isAdmin });
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = (id: string) => {
    if (!editForm.name || !editForm.username || !editForm.password) {
      setEditError("יש למלא את כל השדות");
      return;
    }
    const duplicate = users.find(u => u.username === editForm.username && u.id !== id);
    if (duplicate) {
      setEditError("שם משתמש כבר קיים אצל משתמש אחר");
      return;
    }
    save(users.map(u => u.id === id ? { ...u, ...editForm } : u));
    setEditingId(null);
    setEditError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-green-300 hover:text-white">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div>
          <div className="font-medium text-sm">ניהול מערכת</div>
          <div className="text-yellow-300 text-xs">Admin · {user.name}</div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">משתמשי המערכת</h2>
            <button onClick={() => setShowForm(s => !s)} className="btn-primary text-xs">
              + משתמש חדש
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">הוספת משתמש חדש</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">שם מלא *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="ישראל ישראלי" />
                </div>
                <div>
                  <label className="field-label">שם משתמש *</label>
                  <input value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value.toLowerCase()}))} placeholder="israel" />
                </div>
                <div>
                  <label className="field-label">סיסמה *</label>
                  <input type="text" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="סיסמה" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={form.isAdmin}
                      onChange={e => setForm(f => ({...f, isAdmin: e.target.checked}))}
                      className="w-4 h-4"
                      style={{width:"18px",height:"18px"}}
                    />
                    הרשאות Admin
                  </label>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={addUser} className="btn-primary text-xs">שמור</button>
                <button onClick={() => { setShowForm(false); setError(""); }} className="btn-secondary text-xs">ביטול</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {users.map(u => {
              const initials = u.name.split(" ").map(w => w[0]).join("").slice(0, 2);
              const isEditing = editingId === u.id;

              if (isEditing) {
                return (
                  <div key={u.id} className="py-3 bg-blue-50 -mx-4 px-4 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-2">עריכת משתמש</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="field-label">שם מלא</label>
                        <input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} />
                      </div>
                      <div>
                        <label className="field-label">שם משתמש</label>
                        <input value={editForm.username} onChange={e => setEditForm(f => ({...f, username: e.target.value.toLowerCase()}))} />
                      </div>
                      <div className="col-span-2">
                        <label className="field-label">סיסמה</label>
                        <input type="text" value={editForm.password} onChange={e => setEditForm(f => ({...f, password: e.target.value}))} />
                      </div>
                      {u.id !== "1" && (
                        <div className="col-span-2 flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={editForm.isAdmin}
                              onChange={e => setEditForm(f => ({...f, isAdmin: e.target.checked}))}
                              style={{width:"18px",height:"18px"}}
                            />
                            הרשאות Admin
                          </label>
                        </div>
                      )}
                    </div>
                    {editError && <p className="text-red-500 text-xs mb-2">{editError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(u.id)} className="btn-primary text-xs">שמור שינויים</button>
                      <button onClick={cancelEdit} className="btn-secondary text-xs">ביטול</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={u.id} className="flex items-center gap-3 py-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    u.isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800">{u.name}</div>
                    <div className="text-xs text-gray-400">
                      @{u.username}
                      {u.isAdmin && <span className="mr-2 text-yellow-600">· Admin</span>}
                      {u.id === "1" && <span className="mr-2 text-gray-400">· מוגן</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    {u.id !== "1" && (
                      <>
                        <button
                          onClick={() => toggleAdmin(u.id)}
                          className={`text-xs px-2 py-1 rounded border ${
                            u.isAdmin
                              ? "border-yellow-200 text-yellow-600 bg-yellow-50"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          {u.isAdmin ? "הסר Admin" : "הפוך Admin"}
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="btn-danger text-xs">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-medium text-gray-700 mb-2">הגדרות מערכת</h3>
          <div className="space-y-3">
            <div>
              <label className="field-label">שם החברה</label>
              <input defaultValue="וזה אקולוגיה" />
            </div>
            <div>
              <label className="field-label">כתובת ענן בזק (WebDAV URL)</label>
              <input placeholder="https://cloud.bezeq.com/dav/vasa/" />
            </div>
            <div>
              <label className="field-label">שם משתמש ענן</label>
              <input placeholder="username" />
            </div>
            <div>
              <label className="field-label">סיסמת ענן</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="btn-primary text-xs">שמור הגדרות</button>
          </div>
        </div>
      </div>
    </div>
  );
}
