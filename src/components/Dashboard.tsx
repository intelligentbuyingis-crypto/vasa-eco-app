"use client";
import { useState, useEffect, useCallback } from "react";
import type { User } from "@/lib/users";
import type { ProjectDetails } from "./ProjectSelector";
import FieldJournalForm from "./FieldJournalForm";
import ChainOfCustodyForm from "./ChainOfCustodyForm";
import AdminPanel from "./AdminPanel";
import ProjectSelector from "./ProjectSelector";
import DaySummary from "./DaySummary";
import type { FieldJournalData } from "@/types/forms";
import {
  saveSession, loadSession, clearSession,
  saveJournal, loadJournal,
  saveStep, loadStep, type AppStep,
} from "@/lib/sessionState";

const emptyJournal = (p?: ProjectDetails, samplerName = ""): FieldJournalData => ({
  site: p?.name ?? "", address: p?.address ?? "",
  date: new Date().toISOString().split("T")[0],
  readinessCheck: "", drillingTool: "",
  arrivalTime: new Date().toTimeString().slice(0,5),
  tempStart: "", endTime: "", tempEnd: "",
  sampler1: samplerName, sampler2: "",
  client: p?.client ?? "", clientRep: "",
  pid: "", pidOpenAir: "",
  weather: [], labCalibValid: "", dailyCalib: "", coldStorage: "",
  samples: [], signature: "",
  groundwaterLevel: p?.groundwaterLevel ?? "",
  reportApprover: p?.reportApprover ?? "",
  landUse: p?.landUse ?? "",
  showIsracLogo: true,
  locationITM_E: p?.locationITM_E ?? "",
  locationITM_N: p?.locationITM_N ?? "",
  endTimeRequired: false,
});

type Props = { user: User; onLogout: () => void };

export default function Dashboard({ user, onLogout }: Props) {
  const [screen, setScreen] = useState<AppStep>("dashboard");
  const [journalData, setJournalData] = useState<FieldJournalData>(emptyJournal());
  const [activeProject, setActiveProject] = useState<ProjectDetails | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    const draft = loadJournal();
    const step = loadStep();
    if (session && draft) {
      setJournalData(draft);
      setActiveProject({
        id: session.projectId,
        name: session.projectName,
        address: draft.address,
        client: draft.client,
        groundwaterLevel: draft.groundwaterLevel,
        reportApprover: draft.reportApprover,
        landUse: draft.landUse,
        showIsracLogo: draft.showIsracLogo,
        locationITM_E: draft.locationITM_E,
        locationITM_N: draft.locationITM_N,
        locationAccuracy: "",
        createdAt: session.startedAt,
        createdBy: user.name,
      });
      setScreen(step === "dashboard" ? "field" : step);
    }
    setLoaded(true);
  }, [user.name]);

  const goTo = useCallback((step: AppStep) => {
    setScreen(step);
    saveStep(step);
  }, []);

  const handleJournalChange = useCallback((data: FieldJournalData) => {
    setJournalData(data);
    saveJournal(data);
  }, []);

  const handleProjectSelected = (project: ProjectDetails) => {
    setActiveProject(project);
    const today = new Date().toISOString().split("T")[0];
    const existing = loadJournal();
    let journal: FieldJournalData;
    if (existing && existing.site === project.name && existing.date === today) {
      journal = existing;
    } else {
      journal = emptyJournal(project, user.name);
    }
    setJournalData(journal);
    saveJournal(journal);
    saveSession({
      projectId: project.id,
      projectName: project.name,
      date: today,
      startedAt: new Date().toISOString(),
    });
    goTo("field");
  };

  const handleFinishDay = () => {
    clearSession();
    setJournalData(emptyJournal());
    setActiveProject(null);
    goTo("dashboard");
  };

  const startNewProject = () => {
    clearSession();
    setJournalData(emptyJournal());
    setActiveProject(null);
    goTo("project-select");
  };

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  if (!loaded) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-400 text-sm">טוען...</p>
    </div>
  );

  if (screen === "project-select") return (
    <ProjectSelector userName={user.name} onSelect={handleProjectSelected} onBack={() => goTo("dashboard")} />
  );
  if (screen === "field") return (
    <FieldJournalForm user={user} data={journalData} onChange={handleJournalChange}
      onBack={() => goTo("dashboard")} onContinue={() => goTo("summary")} />
  );
  if (screen === "summary") return (
    <DaySummary user={user} data={journalData} onChange={handleJournalChange}
      onBack={() => goTo("field")} onSendToLab={() => goTo("chain")} onFinishDay={handleFinishDay} />
  );
  if (screen === "chain") return (
    <ChainOfCustodyForm user={user} fieldData={journalData} projectName={activeProject?.name}
      onBack={() => goTo("summary")} onDone={handleFinishDay} />
  );
  if (screen === "admin" && user.isAdmin) return (
    <AdminPanel user={user} onBack={() => goTo("dashboard")} />
  );

  const hasSession = loadSession() !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="וזה אקולוגיה" className="h-8 w-auto" />
          <div className="text-green-300 text-xs">{today}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-sm">{user.name}</div>
            {user.isAdmin && <div className="text-xs text-yellow-300">מנהל מערכת</div>}
          </div>
          <button onClick={onLogout} className="text-xs text-green-300 border border-green-700 rounded px-2 py-1 hover:bg-green-800">
            יציאה
          </button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">

        {/* Resume banner */}
        {hasSession && activeProject && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium text-sm">יום עבודה פתוח</p>
              <p className="text-amber-600 text-xs mt-0.5">
                {activeProject.name} · {journalData.samples.length} דגימות
              </p>
            </div>
            <button onClick={() => goTo("field")} className="btn-primary text-sm">המשך ←</button>
          </div>
        )}

        <h2 className="text-gray-700 font-medium mb-4">בחר פעולה</h2>
        <div className="grid grid-cols-1 gap-3">

          {/* Field journal */}
          <button onClick={() => hasSession ? goTo("field") : goTo("project-select")}
            className="card text-right flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2d6645" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800">{hasSession ? "המשך יומן שדה" : "יומן שדה"}</div>
              <div className="text-sm text-gray-500 mt-0.5">טופס 57 · פרטי אתר, קידוחים, דגימות</div>
              {hasSession && <div className="text-xs text-amber-600 mt-1">← ממשיך מהיכן שעצרת</div>}
            </div>
          </button>

          {/* Day summary */}
          {hasSession && (
            <button onClick={() => goTo("summary")}
              className="card text-right flex items-start gap-4 hover:border-blue-200 hover:shadow-md transition-all border-blue-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">סיכום יום · שליחה למעבדה</div>
                <div className="text-sm text-gray-500 mt-0.5">ניתוב דגימות · שרשרת משמורת · PDF</div>
              </div>
            </button>
          )}

          {/* New project */}
          {hasSession && (
            <button onClick={startNewProject}
              className="card text-right flex items-start gap-4 hover:border-gray-200 transition-all opacity-70">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-600">פרויקט חדש</div>
                <div className="text-sm text-gray-400 mt-0.5">סגור פרויקט נוכחי ופתח חדש</div>
              </div>
            </button>
          )}

          {/* Admin */}
          {user.isAdmin && (
            <button onClick={() => goTo("admin")}
              className="card text-right flex items-start gap-4 hover:border-yellow-200 hover:shadow-md transition-all border-yellow-100">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#92400e" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">ניהול מערכת</div>
                <div className="text-sm text-gray-500 mt-0.5">משתמשים · הגדרות · Admin בלבד</div>
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
