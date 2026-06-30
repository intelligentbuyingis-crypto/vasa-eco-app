"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, SampleRow } from "@/types/forms";
import { SOIL_TYPES, COLORS, MOISTURE, SMELL, WEATHER, DRILLING_TOOLS } from "@/types/forms";
import CircleSelect from "./CircleSelect";
import SignaturePad from "./SignaturePad";
import DrillChart from "./DrillChart";

type Props = {
  user: User;
  data: FieldJournalData;
  onChange: (d: FieldJournalData) => void;
  onBack: () => void;
  onContinue: () => void;
};

// Group samples by drill number
type DrillGroup = { drillNum: string; samples: SampleRow[] };

const newSample = (drillNum: string): SampleRow => ({
  id: crypto.randomUUID(), drillNum, sampleNum: "", depth: "", time: "",
  soilType: "", color: "", smell: "", moisture: "", pid: "", pid20: "", notes: "",
  sendToLab: true
});

function groupByDrill(samples: SampleRow[]): DrillGroup[] {
  const map = new Map<string, SampleRow[]>();
  samples.forEach(s => {
    if (!map.has(s.drillNum)) map.set(s.drillNum, []);
    map.get(s.drillNum)!.push(s);
  });
  return Array.from(map.entries()).map(([drillNum, samples]) => ({ drillNum, samples }));
}

function buildFieldJournalHtml(data: FieldJournalData, samplerName: string): string {
  const genAt = new Date().toLocaleString("he-IL");
  const groups = groupByDrill(data.samples);

  const drillSections = groups.map(g => {
    const rows = g.samples.map((s, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f8f8f8";
      return "<tr style=\"background:" + bg + "\">" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;font-size:7.5pt\">" + (s.sampleNum || "#" + (i+1)) + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.depth ? s.depth + "מ'" : "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.time || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.soilType || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.color || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.smell || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.moisture || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.pid || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;font-size:7.5pt\">" + (s.notes || "") + "</td>" +
        "</tr>";
    }).join("");

    return "<div style=\"margin-bottom:8px\">" +
      "<div style=\"background:#0d6626;color:white;padding:3px 8px;font-weight:bold;font-size:8.5pt\">קידוח " + g.drillNum + "</div>" +
      "<table style=\"width:100%;border-collapse:collapse\">" +
      "<thead><tr style=\"background:#c8e6c9\">" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">מס' דגימה</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">עומק</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">שעה</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">סוג קרקע</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">צבע</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">ריח</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">לחות</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">PID</th>" +
      "<th style=\"border:0.5px solid #999;padding:3px;font-size:7pt;color:#0d5520\">הערות</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }).join("");

  const sigHtml = data.signature
    ? "<img src=\"" + data.signature + "\" style=\"max-height:35px;display:block\"/>"
    : "<div style=\"color:#aaa;font-size:7pt;margin-top:8px\">חתימה לא צורפה</div>";

  return "<!DOCTYPE html>" +
    "<html dir=\"rtl\" lang=\"he\"><head><meta charset=\"UTF-8\">" +
    "<style>*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}" +
    "body{padding:8px;font-size:8pt}@media print{body{padding:0}}</style></head><body>" +

    "<div style=\"background:#0d6626;color:white;display:flex;align-items:stretch;margin-bottom:6px\">" +
    "<div style=\"flex:1;text-align:center;padding:8px 0\">" +
    "<div style=\"font-size:14pt;font-weight:bold\">וזה אקולוגיה בע&quot;מ</div>" +
    "<div style=\"font-size:10pt\">יומן שדה — טופס 57</div></div></div>" +

    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:6px\">" +
    "<tr>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">האתר:</span><br><b>" + (data.site || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">תאריך:</span><br><b>" + (data.date || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">שעת הגעה-סיום:</span><br><b>" + (data.arrivalTime || "—") + " - " + (data.endTime || "—") + "</b></td>" +
    "</tr><tr>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">כתובת:</span><br><b>" + (data.address || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">לקוח:</span><br><b>" + (data.client || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">מזג אוויר:</span><br><b>" + (data.weather || "—") + "</b></td>" +
    "</tr><tr>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">דוגם:</span><br><b>" + (data.sampler1 || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">PID:</span><br><b>" + (data.pid || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">בדיקת מוכנות:</span><br><b>" + (data.readinessCheck || "—") + "</b></td>" +
    "</tr></table>" +

    drillSections +

    "<div style=\"border:0.5px solid #aaa;padding:5px 8px;background:#f0fff4;margin-top:6px\">" +
    "<div style=\"font-weight:bold;color:#0d6626;font-size:8pt;margin-bottom:3px\">חתימת הדוגם</div>" +
    sigHtml +
    "</div>" +

    "<div style=\"background:#0d6626;color:#b2dfb2;padding:3px 8px;margin-top:6px;font-size:6.5pt\">" +
    "נוצר: " + genAt + " · וזה אקולוגיה · טופס 57 · דוגם: " + samplerName +
    "</div>" +
    "</body></html>";
}

export default function FieldJournalForm({ user, data, onChange, onBack, onContinue }: Props) {
  const [step, setStep] = useState<"header" | "samples" | "chart" | "sign">("header");
  const [expandedDrills, setExpandedDrills] = useState<Record<string,boolean>>({});
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [newDrillNum, setNewDrillNum] = useState("");
  const [cloudUploading, setCloudUploading] = useState(false);
  const [cloudUploaded, setCloudUploaded] = useState(false);
  const [cloudError, setCloudError] = useState("");

  const handleCloudUpload = async () => {
    setCloudUploading(true);
    setCloudUploaded(false);
    setCloudError("");
    try {
      const html = buildFieldJournalHtml(data, user.name);
      const dateStr = (data.date || "").replace(/-/g, "");
      const siteStr = (data.site || "טופס").replace(/\s+/g, "_");
      const filename = `יומן_שדה_${siteStr}_${dateStr}.html`;

      const res = await fetch("/api/upload-dropbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: html,
          filename,
          projectName: data.site,
          date: data.date,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.instructions || result.error || "שגיאה בהעלאה לענן");
      }
      setCloudUploaded(true);
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : String(e));
    }
    setCloudUploading(false);
  };

  const set = (k: keyof FieldJournalData, v: string) => onChange({ ...data, [k]: v });

  const toggleDrill = (drillNum: string) => {
    setExpandedDrills(prev => ({ ...prev, [drillNum]: !prev[drillNum] }));
  };

  const addDrill = () => {
    const num = newDrillNum.trim() || `B-${groupByDrill(data.samples).length + 1}`;
    const sample = newSample(num);
    onChange({ ...data, samples: [...data.samples, sample] });
    setExpandedDrills(prev => ({ ...prev, [num]: true }));
    setNewDrillNum("");
  };

  const addSampleToDrill = (drillNum: string) => {
    onChange({ ...data, samples: [...data.samples, newSample(drillNum)] });
  };

  const updateSample = (id: string, k: keyof SampleRow, v: string) =>
    onChange({ ...data, samples: data.samples.map(s => s.id === id ? { ...s, [k]: v } : s) });

  const removeSample = (id: string) =>
    onChange({ ...data, samples: data.samples.filter(s => s.id !== id) });

  const removeDrill = (drillNum: string) =>
    onChange({ ...data, samples: data.samples.filter(s => s.drillNum !== drillNum) });

  const validateHeader = () => {
    const errs: string[] = [];
    if (!data.site) errs.push("שם האתר");
    if (!data.date) errs.push("תאריך");
    if (!data.sampler1) errs.push("שם הדוגם");
    setHeaderErrors(errs);
    return errs.length === 0;
  };

  const groups = groupByDrill(data.samples);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-green-300 hover:text-white">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div>
          <div className="font-medium text-sm">יומן שדה · טופס 57</div>
          <div className="text-green-300 text-xs">{user.name}</div>
        </div>
        <div className="flex gap-1.5 mr-auto">
          {(["header","samples","chart","sign"] as const).map((s, i) => (
            <div key={s} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border ${
              step === s ? "bg-white text-green-900 border-white" :
              ["header","samples","chart"].indexOf(s) < ["header","samples","chart","sign"].indexOf(step)
                ? "bg-green-700 border-green-600 text-green-200"
                : "border-green-700 text-green-500"
            }`}>{i+1}</div>
          ))}
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-24">

        {/* STEP 1: Header */}
        {step === "header" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">פרטי האתר</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">שם האתר <span className="text-red-500">*</span></label>
                  <input value={data.site} onChange={e => set("site", e.target.value)} placeholder="שם האתר" />
                </div>
                <div className="col-span-2">
                  <label className="field-label">כתובת</label>
                  <input value={data.address} onChange={e => set("address", e.target.value)} placeholder="כתובת האתר" />
                </div>
                <div>
                  <label className="field-label">תאריך</label>
                  <input type="date" value={data.date} onChange={e => set("date", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">שעת הגעה</label>
                  <input type="time" value={data.arrivalTime} onChange={e => set("arrivalTime", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">שעת סיום</label>
                  <input type="time" value={data.endTime} onChange={e => set("endTime", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">כלי קידוח</label>
                  <select value={data.drillingTool} onChange={e => set("drillingTool", e.target.value)}>
                    <option value="">בחר...</option>
                    {DRILLING_TOOLS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">טמפ' תחילה (°C)</label>
                  <input type="number" value={data.tempStart} onChange={e => set("tempStart", e.target.value)} placeholder="22" />
                </div>
                <div>
                  <label className="field-label">טמפ' סוף (°C)</label>
                  <input type="number" value={data.tempEnd} onChange={e => set("tempEnd", e.target.value)} placeholder="24" />
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">אנשים</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">הלקוח</label>
                  <input value={data.client} onChange={e => set("client", e.target.value)} placeholder="שם הלקוח" />
                </div>
                <div>
                  <label className="field-label">נציג הלקוח</label>
                  <input value={data.clientRep} onChange={e => set("clientRep", e.target.value)} placeholder="שם נציג" />
                </div>
                <div>
                  <label className="field-label">PID</label>
                  <input value={data.pid} onChange={e => set("pid", e.target.value)} placeholder="מס' מכשיר" />
                </div>
                <div>
                  <label className="field-label">PID באוויר הפתוח</label>
                  <input value={data.pidOpenAir} onChange={e => set("pidOpenAir", e.target.value)} placeholder="ערך ppm" />
                </div>
                <div className="col-span-2">
                  <label className="field-label">דוגם 1 <span className="text-red-500">*</span></label>
                  <input value={data.sampler1} onChange={e => set("sampler1", e.target.value)} placeholder="שם הדוגם" />
                </div>
                <div className="col-span-2">
                  <label className="field-label">דוגם 2 (אם יש)</label>
                  <input value={data.sampler2} onChange={e => set("sampler2", e.target.value)} placeholder="שם הדוגם" />
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">תנאים ובדיקות</p>
              <div className="space-y-3">
                <div>
                  <label className="field-label">מזג האוויר</label>
                  <CircleSelect options={WEATHER} value={data.weather} onChange={v => set("weather", v)} />
                </div>
                <div>
                  <label className="field-label">וודא/י בדיקת מוכנות (טפסים 55,56)</label>
                  <CircleSelect options={["כן","לא"]} value={data.readinessCheck} onChange={v => set("readinessCheck", v)} />
                </div>
                <div>
                  <label className="field-label">כיול מעבדה בתוקף</label>
                  <CircleSelect options={["כן","לא"]} value={data.labCalibValid} onChange={v => set("labCalibValid", v)} />
                </div>
                <div>
                  <label className="field-label">כיול 100 ppm יומי</label>
                  <CircleSelect options={["כן","לא"]} value={data.dailyCalib} onChange={v => set("dailyCalib", v)} />
                </div>
                <div>
                  <label className="field-label">אחסון דגימות בקירור</label>
                  <CircleSelect options={["כן","לא","לא רלוונטי"]} value={data.coldStorage} onChange={v => set("coldStorage", v)} />
                </div>
              </div>
            </div>

            {headerErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium mb-1">⚠ לא ניתן להמשיך — חסרים שדות חובה:</p>
                <ul className="text-red-500 text-xs list-disc list-inside space-y-0.5">
                  {headerErrors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}
            <button onClick={() => { if (validateHeader()) setStep("samples"); }} className="btn-primary w-full">
              המשך לדגימות ←
            </button>
          </div>
        )}

        {/* STEP 2: Drills + Samples */}
        {step === "samples" && (
          <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {groups.length} קידוחים · {data.samples.length} דגימות
              </span>
              {data.samples.length > 0 && (
                <button
                  onClick={() => setStep("chart")}
                  className="text-xs text-green-700 border border-green-200 rounded-lg px-3 py-1.5 bg-green-50 flex items-center gap-1.5"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  הצג גרף
                </button>
              )}
            </div>

            {/* Drill groups */}
            {groups.length === 0 && (
              <div className="card text-center py-8 mb-3">
                <p className="text-gray-400 text-sm mb-1">אין קידוחים עדיין</p>
                <p className="text-gray-300 text-xs">הוסף קידוח ראשון למטה</p>
              </div>
            )}

            {groups.map(({ drillNum, samples }) => {
              const isOpen = !!expandedDrills[drillNum];
              return (
                <div key={drillNum} className="card mb-3 overflow-hidden p-0">
                  {/* Drill header - always visible */}
                  <button
                    onClick={() => toggleDrill(drillNum)}
                    className="w-full flex items-center justify-between p-3 text-right hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2d6645" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-800 text-sm">קידוח {drillNum}</div>
                        <div className="text-xs text-gray-400">{samples.length} דגימות</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); removeDrill(drillNum); }}
                        className="text-red-300 hover:text-red-500 p-1"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2"
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Samples inside drill */}
                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
                      {samples.map((row, idx) => (
                        <div key={row.id} className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              דגימה {idx + 1}
                            </span>
                            <button onClick={() => removeSample(row.id)} className="text-xs text-red-300 hover:text-red-500">
                              הסר
                            </button>
                          </div>

                          {/* Row 1: number, depth, time */}
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                              <label className="field-label">מס' דגימה</label>
                              <input value={row.sampleNum} onChange={e => updateSample(row.id, "sampleNum", e.target.value)} placeholder="1-0.5" />
                            </div>
                            <div>
                              <label className="field-label">עומק (מ')</label>
                              <input type="number" step="0.5" value={row.depth} onChange={e => updateSample(row.id, "depth", e.target.value)} placeholder="0.5" />
                            </div>
                            <div>
                              <label className="field-label">שעה</label>
                              <input type="time" value={row.time} onChange={e => updateSample(row.id, "time", e.target.value)} />
                            </div>
                          </div>

                          {/* Row 2: PID values */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <label className="field-label">ערך PID (ppm)</label>
                              <input value={row.pid} onChange={e => updateSample(row.id, "pid", e.target.value)} placeholder="0.0" />
                            </div>
                            <div>
                              <label className="field-label">PID 20%</label>
                              <input value={row.pid20} onChange={e => updateSample(row.id, "pid20", e.target.value)} placeholder="0.0" />
                            </div>
                          </div>

                          {/* Circle selects — compact rows */}
                          <div className="space-y-2 border-t border-gray-50 pt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0">סוג קרקע</span>
                              <CircleSelect options={SOIL_TYPES} value={row.soilType} onChange={v => updateSample(row.id, "soilType", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0">צבע</span>
                              <CircleSelect options={COLORS} value={row.color} onChange={v => updateSample(row.id, "color", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0">ריח</span>
                              <CircleSelect options={SMELL} value={row.smell} onChange={v => updateSample(row.id, "smell", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0">לחות</span>
                              <CircleSelect options={MOISTURE} value={row.moisture} onChange={v => updateSample(row.id, "moisture", v)} />
                            </div>
                            <div>
                              <input value={row.notes} onChange={e => updateSample(row.id, "notes", e.target.value)} placeholder="הערות..." />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add sample to this drill */}
                      <button
                        onClick={() => addSampleToDrill(drillNum)}
                        className="w-full text-xs text-green-700 border border-dashed border-green-300 rounded-lg py-2 hover:bg-green-50 transition-colors"
                      >
                        + הוסף דגימה לקידוח {drillNum}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add new drill */}
            <div className="card border-dashed border-2 border-gray-200 bg-transparent">
              <p className="text-sm font-medium text-gray-600 mb-2">הוסף קידוח חדש</p>
              <div className="flex gap-2">
                <input
                  value={newDrillNum}
                  onChange={e => setNewDrillNum(e.target.value)}
                  placeholder={`B-${groups.length + 1}`}
                  className="flex-1"
                  onKeyDown={e => e.key === "Enter" && addDrill()}
                />
                <button onClick={addDrill} className="btn-primary whitespace-nowrap">
                  + קידוח
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep("header")} className="btn-secondary flex-1">← חזרה</button>
              <button onClick={() => setStep("sign")} className="btn-primary flex-1">המשך לחתימה ←</button>
            </div>
          </div>
        )}

        {/* STEP 3: Chart */}
        {step === "chart" && (
          <div>
            <DrillChart samples={data.samples} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה לדגימות</button>
              <button onClick={() => setStep("sign")} className="btn-primary flex-1">המשך לחתימה ←</button>
            </div>
          </div>
        )}

        {/* STEP 4: Signature */}
        {step === "sign" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">חתימת הדוגם</p>
              <SignaturePad
                label="חתום/י עם העט או האצבע:"
                onChange={v => set("signature", v)}
              />
            </div>

            <div className="card">
              <p className="section-title">שמירה אוטומטית בענן</p>
              {cloudUploaded && (
                <p className="text-green-600 text-xs mb-2">✓ יומן השדה נשמר בענן! נתיב: {data.site}/{data.date}</p>
              )}
              {cloudError && (
                <p className="text-amber-600 text-xs mb-2">{cloudError}</p>
              )}
              <button onClick={handleCloudUpload} disabled={cloudUploading || !data.site}
                className="w-full flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">
                {cloudUploading ? <><span>⏳</span> מעלה לענן...</> : <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  שמור יומן שדה בענן (Dropbox)
                </>}
              </button>
              <p className="text-xs text-gray-400 mt-1">ישמר בנתיב: {data.site || "פרויקט"}/{data.date}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
              <button
                onClick={onContinue}
                disabled={!data.site}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                המשך לשרשרת משמורת ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
