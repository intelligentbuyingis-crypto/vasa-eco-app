"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, SampleRow } from "@/types/forms";
import { SAMPLING_TOOLS, SAMPLE_TYPES } from "@/types/forms";

type Props = {
  user: User;
  data: FieldJournalData;
  onChange: (d: FieldJournalData) => void;
  onBack: () => void;
  onSendToLab: () => void;
  onFinishDay: () => void;
};

const LAB_OPTIONS = ["מעבדה ראשית", "מעבדה משנית", "לא שולח"];

export default function DaySummary({ user, data, onChange, onBack, onSendToLab, onFinishDay }: Props) {
  const [confirmFinish, setConfirmFinish] = useState(false);

  const updateSample = (id: string, key: keyof SampleRow, val: string) => {
    onChange({
      ...data,
      samples: data.samples.map(s => s.id === id ? { ...s, [key]: val } : s),
    });
  };

  const sendSamples = data.samples.filter(s => s.labChoice && s.labChoice !== "לא שולח");
  const lab1Samples = data.samples.filter(s => s.labChoice === "מעבדה ראשית");
  const lab2Samples = data.samples.filter(s => s.labChoice === "מעבדה משנית");

  const hasSamplesToSend = sendSamples.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-green-300 hover:text-white">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div>
          <div className="font-medium text-sm">סיכום יום · {data.site}</div>
          <div className="text-green-300 text-xs">{data.date} · {data.samples.length} דגימות</div>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-32">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-gray-800">{data.samples.length}</p>
            <p className="text-xs text-gray-500">סה"כ דגימות</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-green-700">{lab1Samples.length}</p>
            <p className="text-xs text-gray-500">מעבדה ראשית</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-blue-700">{lab2Samples.length}</p>
            <p className="text-xs text-gray-500">מעבדה משנית</p>
          </div>
        </div>

        {/* Samples routing table */}
        <div className="card mb-4">
          <p className="section-title mb-3">ניתוב דגימות למעבדות</p>
          <p className="text-xs text-gray-400 mb-3">לכל דגימה — בחר מעבדה, כלי דיגום ומספר אריזות</p>

          {data.samples.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">לא נרשמו דגימות ביומן השדה</p>
          ) : (
            <div className="space-y-2">
              {data.samples.map((s, idx) => {
                const pidAlert = parseFloat(s.pid || "0") > 20;
                return (
                  <div key={s.id} className={`rounded-xl p-3 border transition-all ${
                    pidAlert ? "border-red-300 bg-red-50" :
                    s.labChoice === "מעבדה ראשית" ? "border-green-200 bg-green-50" :
                    s.labChoice === "מעבדה משנית" ? "border-blue-200 bg-blue-50" :
                    s.labChoice === "לא שולח" ? "border-gray-100 bg-gray-50 opacity-60" :
                    "border-gray-200 bg-white"
                  }`}>
                    {/* Sample info row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{s.sampleNum || `#${idx+1}`}</span>
                        <span className="text-xs text-gray-400">קידוח {s.drillNum}</span>
                        {s.depth && <span className="text-xs text-gray-400">· {s.depth}מ'</span>}
                        {s.time && <span className="text-xs text-gray-400">· {s.time}</span>}
                        {s.pid && <span className={`text-xs font-medium ${pidAlert ? "text-red-600" : "text-gray-500"}`}>· PID: {s.pid}</span>}
                      </div>
                      {pidAlert && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">⚠ PID גבוה!</span>
                      )}
                    </div>

                    {/* Routing controls */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="field-label text-xs">מעבדה</label>
                        <select
                          value={s.labChoice || ""}
                          onChange={e => updateSample(s.id, "labChoice", e.target.value)}
                          className="text-xs py-1"
                        >
                          <option value="">בחר...</option>
                          {LAB_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      {s.labChoice && s.labChoice !== "לא שולח" && (
                        <>
                          <div>
                            <label className="field-label text-xs">כלי דיגום</label>
                            <select
                              value={s.samplingTool || ""}
                              onChange={e => updateSample(s.id, "samplingTool", e.target.value)}
                              className="text-xs py-1"
                            >
                              <option value="">בחר...</option>
                              {SAMPLING_TOOLS.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="field-label text-xs">מס' אריזות</label>
                            <input
                              type="number" min="1" max="10"
                              value={s.numContainers || "1"}
                              onChange={e => updateSample(s.id, "numContainers", e.target.value)}
                              className="text-xs py-1"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary before sending */}
        {hasSamplesToSend && (
          <div className="card bg-green-50 border-green-200 mb-4">
            <p className="section-title text-green-800 mb-2">סיכום שליחה</p>
            <div className="text-sm text-green-700 space-y-1">
              {lab1Samples.length > 0 && (
                <p>✓ מעבדה ראשית: <strong>{lab1Samples.length} דגימות</strong> — יופק טופס 33.1</p>
              )}
              {lab2Samples.length > 0 && (
                <p>✓ מעבדה משנית: <strong>{lab2Samples.length} דגימות</strong> — יופק טופס 33.1</p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 p-4 space-y-2">
          {hasSamplesToSend && (
            <button onClick={onSendToLab} className="btn-primary w-full flex items-center justify-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              המשך לשרשרת משמורת ←
            </button>
          )}

          {!confirmFinish ? (
            <button onClick={() => setConfirmFinish(true)}
              className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
              סיים יום עבודה ללא שליחה למעבדה
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-800 text-sm font-medium mb-2">בטוח לסיים ללא שליחה?</p>
              <div className="flex gap-2">
                <button onClick={onFinishDay} className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm">כן, סיים יום</button>
                <button onClick={() => setConfirmFinish(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm">ביטול</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

