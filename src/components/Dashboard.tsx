"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { Project } from "@/lib/projects";
import FieldJournalForm from "./FieldJournalForm";
import ChainOfCustodyForm from "./ChainOfCustodyForm";
import AdminPanel from "./AdminPanel";
import ProjectSelector from "./ProjectSelector";
import type { FieldJournalData } from "@/types/forms";

type Screen = "dashboard" | "project-select-field" | "project-select-chain" | "field" | "chain" | "admin";

const emptyJournal = (project?: Project): FieldJournalData => ({
  site: project?.name ?? "", address: project?.address ?? "", date: new Date().toISOString().split("T")[0],
  readinessCheck: "", drillingTool: "", arrivalTime: new Date().toTimeString().slice(0,5),
  tempStart: "", endTime: "", tempEnd: "", sampler1: "", sampler2: "",
  client: project?.client ?? "", clientRep: "", pid: "", pidOpenAir: "", weather: "",
  labCalibValid: "", dailyCalib: "", coldStorage: "", samples: [], signature: ""
});

type Props = { user: User; onLogout: () => void };

export default function Dashboard({ user, onLogout }: Props) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [journalData, setJournalData] = useState<FieldJournalData>(emptyJournal());
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const today = new Date().toLocaleDateString("he-IL", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  const handleProjectSelectedForField = (project: Project) => {
    setActiveProject(project);
    setJournalData(emptyJournal(project));
    setScreen("field");
  };

  const handleProjectSelectedForChain = (project: Project) => {
    setActiveProject(project);
    setJournalData(emptyJournal(project));
    setScreen("chain");
  };

  if (screen === "project-select-field") return (
    <ProjectSelector
      onSelect={handleProjectSelectedForField}
      onBack={() => setScreen("dashboard")}
    />
  );

  if (screen === "project-select-chain") return (
    <ProjectSelector
      onSelect={handleProjectSelectedForChain}
      onBack={() => setScreen("dashboard")}
    />
  );

  if (screen === "field") return (
    <FieldJournalForm
      user={user}
      data={journalData}
      onChange={setJournalData}
      onBack={() => setScreen("dashboard")}
      onContinue={() => setScreen("chain")}
    />
  );
  if (screen === "chain") return (
    <ChainOfCustodyForm
      user={user}
      fieldData={journalData}
      projectName={activeProject?.name}
      onBack={() => setScreen("field")}
      onDone={() => { setJournalData(emptyJournal()); setActiveProject(null); setScreen("dashboard"); }}
    />
  );
  if (screen === "admin" && user.isAdmin) return (
    <AdminPanel user={user} onBack={() => setScreen("dashboard")} />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
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
        <h2 className="text-gray-700 font-medium mb-4">בחר פעולה</h2>

        <div className="grid grid-cols-1 gap-3">
          {/* Field Journal */}
          <button
            onClick={() => setScreen("project-select-field")}
            className="card text-right flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2d6645" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800">יומן שדה</div>
              <div className="text-sm text-gray-500 mt-0.5">טופס 57 · פרטי אתר, דגימות, חתימה</div>
              <div className="text-xs text-green-700 mt-1">→ ממלא ומוביל לשרשרת משמורת</div>
            </div>
          </button>

          {/* Chain of Custody only */}
          <button
            onClick={() => setScreen("project-select-chain")}
            className="card text-right flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800">שרשרת משמורת בלבד</div>
              <div className="text-sm text-gray-500 mt-0.5">טופס 33.1 · כשיש יציאה ישירה למעבדה</div>
            </div>
          </button>

          {/* Admin - only for admin users */}
          {user.isAdmin && (
            <button
              onClick={() => setScreen("admin")}
              className="card text-right flex items-start gap-4 hover:border-yellow-200 hover:shadow-md transition-all border-yellow-100"
            >
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#92400e" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">ניהול מערכת</div>
                <div className="text-sm text-gray-500 mt-0.5">ניהול משתמשים · הרשאות · Admin בלבד</div>
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
