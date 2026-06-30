"use client";
import { useState, useEffect } from "react";
import { getProjects, addProject, type Project } from "@/lib/projects";

type Props = {
  onSelect: (project: Project) => void;
  onBack: () => void;
};

export default function ProjectSelector({ onSelect, onBack }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newClient, setNewClient] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleCreate = () => {
    if (!newName.trim()) return;
    const project = addProject(newName, newAddress, newClient);
    onSelect(project);
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
          <div className="font-medium text-sm">בחירת פרויקט</div>
          <div className="text-green-300 text-xs">בחר פרויקט קיים או צור חדש</div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">

        {!showNew ? (
          <>
            <button
              onClick={() => setShowNew(true)}
              className="card w-full text-right flex items-center gap-3 mb-4 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-green-800">פרויקט חדש</div>
                <div className="text-sm text-green-600">פתח אתר עבודה חדש</div>
              </div>
            </button>

            {projects.length > 0 && (
              <>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="חפש פרויקט..."
                  className="mb-3"
                />
                <p className="text-sm font-medium text-gray-600 mb-2">פרויקטים קיימים ({filtered.length})</p>
                <div className="space-y-2">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onSelect(p)}
                      className="card w-full text-right flex items-center gap-3 hover:border-green-200 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        {p.address && <div className="text-xs text-gray-400">{p.address}</div>}
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}

            {projects.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">אין פרויקטים עדיין — צור פרויקט חדש למעלה</p>
            )}
          </>
        ) : (
          <div className="card">
            <p className="section-title">פתיחת פרויקט חדש</p>
            <div className="space-y-3">
              <div>
                <label className="field-label">שם הפרויקט / האתר <span className="text-red-500">*</span></label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="לדוגמה: כפר סבא - מתחם תעשייה"
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label">כתובת</label>
                <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="כתובת האתר" />
              </div>
              <div>
                <label className="field-label">לקוח</label>
                <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="שם הלקוח" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">ביטול</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="btn-primary flex-1 disabled:opacity-50">
                צור והמשך ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
