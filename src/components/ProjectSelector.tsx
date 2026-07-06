"use client";
import { useState, useEffect } from "react";

export type ProjectDetails = {
  id: string;
  name: string;
  address: string;
  client: string;
  groundwaterLevel: string;
  reportApprover: string;
  landUse: string;
  showIsracLogo: boolean;
  createdAt: string;
  createdBy: string;
};

type Props = {
  userName: string;
  onSelect: (project: ProjectDetails) => void;
  onBack: () => void;
};

export default function ProjectSelector({ userName, onSelect, onBack }: Props) {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  // Step: "list" | "new" | "details"
  const [step, setStep] = useState<"list" | "new" | "details">("list");
  const [selectedBase, setSelectedBase] = useState<ProjectDetails | null>(null);

  // New project fields
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newClient, setNewClient] = useState("");

  // Project details (filled before starting work day)
  const [details, setDetails] = useState({
    groundwaterLevel: "",
    reportApprover: "",
    landUse: "",
    showIsracLogo: false,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/projects");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "שגיאה בטעינת פרויקטים");
      setProjects(result.projects || []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "שגיאה — בדוק חיבור לענן");
    }
    setLoading(false);
  };

  useEffect(() => { loadProjects(); }, []);

  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleSelectExisting = (p: ProjectDetails) => {
    setSelectedBase(p);
    setDetails({
      groundwaterLevel: p.groundwaterLevel || "",
      reportApprover: p.reportApprover || "",
      landUse: p.landUse || "",
      showIsracLogo: p.showIsracLogo || false,
    });
    setStep("details");
  };

  const handleCreateNew = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, address: newAddress, client: newClient, createdBy: userName }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "שגיאה ביצירת פרויקט");
      setSelectedBase(result.project);
      setDetails({ groundwaterLevel: "", reportApprover: "", landUse: "", showIsracLogo: false });
      setStep("details");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "שגיאה ביצירת פרויקט");
    }
    setCreating(false);
  };

  const handleConfirmDetails = () => {
    if (!selectedBase) return;
    onSelect({ ...selectedBase, ...details });
  };

  // ─── STEP: DETAILS ───
  if (step === "details" && selectedBase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setStep("list")} className="text-green-300 hover:text-white">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div>
            <div className="font-medium text-sm">נתוני פרויקט יומיים</div>
            <div className="text-green-300 text-xs">{selectedBase.name}</div>
          </div>
        </header>
        <div className="p-4 max-w-2xl mx-auto space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-green-800 text-sm font-medium">מלא לפני תחילת יום העבודה</p>
            <p className="text-green-600 text-xs">הנתונים ימולאו אוטומטית בטפסים</p>
          </div>
          <div className="card space-y-3">
            <div>
              <label className="field-label">שם מאשר הדו&quot;ח <span className="text-red-500">*</span></label>
              <input value={details.reportApprover} onChange={e => setDetails(d => ({...d, reportApprover: e.target.value}))} placeholder="שם המאשר" />
            </div>
            <div>
              <label className="field-label">יעוד הקרקע</label>
              <input value={details.landUse} onChange={e => setDetails(d => ({...d, landUse: e.target.value}))} placeholder="מגורים / תעשייה / חקלאות..." />
            </div>
            <div>
              <label className="field-label">עומק מי תהום (משוער, מטר)</label>
              <input type="number" value={details.groundwaterLevel} onChange={e => setDetails(d => ({...d, groundwaterLevel: e.target.value}))} placeholder="לדוגמה: 5" />
            </div>
            <div>
              <label className="field-label">לוגו הרשות הלאומית ISRAC בטופס</label>
              <div className="flex items-center gap-4 mt-1">
                {["כן","לא"].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setDetails(d => ({...d, showIsracLogo: opt === "כן"}))}
                    className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                      (details.showIsracLogo && opt === "כן") || (!details.showIsracLogo && opt === "לא")
                        ? "border-gray-800 border-2 font-medium"
                        : "border-transparent text-gray-500"
                    }`}>{opt}</button>
                ))}
                {details.showIsracLogo && (
                  <img src="/israc-logo.png" alt="ISRAC" className="h-8 w-auto" />
                )}
              </div>
            </div>
          </div>
          <div className="card bg-gray-50">
            <p className="text-xs text-gray-500 mb-2 font-medium">פרטי פרויקט</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>אתר: <strong>{selectedBase.name}</strong></p>
              {selectedBase.address && <p>כתובת: {selectedBase.address}</p>}
              {selectedBase.client && <p>לקוח: {selectedBase.client}</p>}
            </div>
          </div>
          <button onClick={handleConfirmDetails} disabled={!details.reportApprover} className="btn-primary w-full disabled:opacity-50">
            התחל יום עבודה ←
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP: NEW PROJECT ───
  if (step === "new") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setStep("list")} className="text-green-300 hover:text-white">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="font-medium text-sm">פרויקט חדש</div>
        </header>
        <div className="p-4 max-w-2xl mx-auto">
          <div className="card space-y-3">
            <div>
              <label className="field-label">שם הפרויקט / האתר <span className="text-red-500">*</span></label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="לדוגמה: זמר — מתחם תעשייה" autoFocus />
            </div>
            <div>
              <label className="field-label">כתובת</label>
              <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="כתובת האתר" />
            </div>
            <div>
              <label className="field-label">לקוח</label>
              <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="שם הלקוח" />
            </div>
            {createError && <p className="text-red-500 text-xs">{createError}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep("list")} className="btn-secondary flex-1">ביטול</button>
              <button onClick={handleCreateNew} disabled={!newName.trim() || creating} className="btn-primary flex-1 disabled:opacity-50">
                {creating ? "יוצר..." : "המשך ←"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP: LIST ───
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
          <div className="text-green-300 text-xs">משותף לכל הדוגמים</div>
        </div>
      </header>
      <div className="p-4 max-w-2xl mx-auto">
        <button onClick={() => setStep("new")}
          className="card w-full text-right flex items-center gap-3 mb-4 border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
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

        {loading && <p className="text-center text-gray-400 text-sm py-8">טוען מהענן...</p>}
        {loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
            <p className="text-amber-700 text-sm">{loadError}</p>
            <button onClick={loadProjects} className="text-amber-800 text-xs underline mt-1">נסה שוב</button>
          </div>
        )}
        {!loading && !loadError && (
          <>
            {projects.length > 0 && (
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש פרויקט..." className="mb-3" />
            )}
            <div className="space-y-2">
              {filtered.map(p => (
                <button key={p.id} onClick={() => handleSelectExisting(p)}
                  className="card w-full text-right flex items-center gap-3 hover:border-green-200 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    {p.address && <div className="text-xs text-gray-400">{p.address}</div>}
                    {p.createdBy && <div className="text-xs text-gray-300">נפתח ע&quot;י {p.createdBy}</div>}
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
            {projects.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">אין פרויקטים עדיין</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
