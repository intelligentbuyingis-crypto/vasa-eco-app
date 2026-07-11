"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, SampleRow } from "@/types/forms";
import { SOIL_TYPES, COLORS, MOISTURE, SMELL, WEATHER, DRILLING_TOOLS, SAMPLING_TOOLS, SAMPLE_TYPES, LAB_TESTS, PID_OPTIONS } from "@/types/forms";
import { getUsers } from "@/lib/users";
import SignaturePad from "./SignaturePad";
import DrillChart from "./DrillChart";

type Props = {
  user: User;
  data: FieldJournalData;
  onChange: (d: FieldJournalData) => void;
  onBack: () => void;
  onContinue: () => void;
};

type DrillGroup = { drillNum: string; samples: SampleRow[] };

function groupByDrill(samples: SampleRow[]): DrillGroup[] {
  const map = new Map<string, SampleRow[]>();
  samples.forEach(s => {
    if (!map.has(s.drillNum)) map.set(s.drillNum, []);
    map.get(s.drillNum)!.push(s);
  });
  return Array.from(map.entries()).map(([drillNum, samples]) => ({ drillNum, samples }));
}

const newSample = (drillNum: string, depth = "", prev?: SampleRow): SampleRow => ({
  id: crypto.randomUUID(), drillNum,
  sampleNum: depth ? `${drillNum}-${depth}` : `${drillNum}-`,
  depth, time: new Date().toTimeString().slice(0,5),
  // Auto-copy from previous sample if exists
  soilType: prev?.soilType ?? [], color: prev?.color ?? [],
  smell: prev?.smell ?? "", moisture: prev?.moisture ?? "",
  pid: "", pid20: "", notes: "",
  sendToLab: true, labChoice: "", samplingTool: "",
  numContainers: prev?.numContainers ?? "1",
  sampleType: prev?.sampleType ?? "ח", tests: prev?.tests ?? [],
});

// Multi-select circle component
function MultiCircleSelect({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter(x => x !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          className={`px-2 py-0.5 text-sm rounded-full border transition-all ${
            value.includes(opt) ? "border-gray-800 border-2 font-medium bg-gray-50" : "border-transparent text-gray-500"
          }`}>{opt}</button>
      ))}
    </div>
  );
}

// Single circle select
function CircleSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt === value ? "" : opt)}
          className={`px-2 py-0.5 text-sm rounded-full border transition-all ${
            value === opt ? "border-gray-800 border-2 font-medium" : "border-transparent text-gray-500"
          }`}>{opt}</button>
      ))}
    </div>
  );
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
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (Array.isArray(s.soilType) ? s.soilType.join(", ") : s.soilType) + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (Array.isArray(s.color) ? s.color.join(", ") : s.color) + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.smell || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.moisture || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;text-align:center;font-size:7.5pt\">" + (s.pid || "") + "</td>" +
        "<td style=\"border:0.5px solid #ccc;padding:3px;font-size:7.5pt\">" + (s.notes || "") + "</td>" +
        "</tr>";
    }).join("");
    return "<div style=\"margin-bottom:8px\">" +
      "<div style=\"background:#0d6626;color:white;padding:3px 8px;font-weight:bold;font-size:8.5pt\">קידוח " + g.drillNum + "</div>" +
      "<table style=\"width:100%;border-collapse:collapse\"><thead><tr style=\"background:#c8e6c9\">" +
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

  return "<!DOCTYPE html><html dir=\"rtl\" lang=\"he\"><head><meta charset=\"UTF-8\">" +
    "<style>*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}body{padding:8px;font-size:8pt}@media print{body{padding:0}}</style></head><body>" +
    "<div style=\"background:#0d6626;color:white;display:flex;align-items:stretch;margin-bottom:6px\">" +
    "<div style=\"flex:1;text-align:center;padding:8px 0\">" +
    "<div style=\"font-size:14pt;font-weight:bold\">וזה אקולוגיה בע&quot;מ</div>" +
    "<div style=\"font-size:10pt\">יומן שדה — טופס 57</div></div></div>" +
    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:6px\"><tr>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">האתר:</span><br><b>" + (data.site||"—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">תאריך:</span><br><b>" + (data.date||"—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">שעות:</span><br><b>" + (data.arrivalTime||"—") + " - " + (data.endTime||"—") + "</b></td>" +
    "</tr><tr>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">דוגם:</span><br><b>" + (data.sampler1||"—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">מזג אוויר:</span><br><b>" + (Array.isArray(data.weather) ? data.weather.join(", ") : data.weather||"—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:3px 6px\"><span style=\"font-size:6.5pt;color:#666\">PID:</span><br><b>" + (data.pid||"—") + "</b></td>" +
    "</tr></table>" +
    drillSections +
    "<div style=\"background:#0d6626;color:#b2dfb2;padding:3px 8px;margin-top:6px;font-size:6.5pt\">נוצר: " + genAt + " · וזה אקולוגיה · טופס 57</div>" +
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
  const [pidCustom, setPidCustom] = useState("");

  const [fetchingWeather, setFetchingWeather] = useState(false);
  const allUsers = getUsers();
  const samplerNames = allUsers.map(u => u.name);

  const set = (k: keyof FieldJournalData, v: string | string[] | boolean) => onChange({ ...data, [k]: v });

  const fetchWeather = async () => {
    if (!navigator.geolocation) return;
    setFetchingWeather(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`
      );
      const json = await resp.json();
      const temp = Math.round(json.current?.temperature_2m ?? 0);
      const code = json.current?.weathercode ?? 0;
      // Map weather code to Hebrew
      const weatherMap: Record<string, string> = {
        "0": "שמשי", "1": "שמשי", "2": "מעונן חלקי", "3": "מעונן",
        "45": "ערפל", "48": "ערפל", "51": "גשום", "53": "גשום", "55": "גשום",
        "61": "גשום", "63": "גשום", "65": "גשום", "80": "גשום", "81": "גשום",
        "95": "סופת רעמים",
      };
      const wCode = String(code);
      const wLabel = weatherMap[wCode] ?? "מעונן";
      const isHot = temp >= 35;
      const finalLabel = isHot ? "חם מאוד" : temp >= 28 ? "חם" : wLabel;
      onChange({ ...data, tempStart: String(temp), weather: [finalLabel] });
    } catch (e) {
      console.error("Weather fetch failed:", e);
    }
    setFetchingWeather(false);
  };

  const toggleDrill = (drillNum: string) =>
    setExpandedDrills(prev => ({ ...prev, [drillNum]: !prev[drillNum] }));

  const addDrill = () => {
    const num = newDrillNum.trim() || `B-${groupByDrill(data.samples).length + 1}`;
    const sample = newSample(num);
    onChange({ ...data, samples: [...data.samples, sample] });
    setExpandedDrills(prev => ({ ...prev, [num]: true }));
    setNewDrillNum("");
  };

  const addSampleToDrill = (drillNum: string) => {
    const drillSamples = data.samples.filter(s => s.drillNum === drillNum);
    const prev = drillSamples.length > 0 ? drillSamples[drillSamples.length - 1] : undefined;
    onChange({ ...data, samples: [...data.samples, newSample(drillNum, "", prev)] });
  };

  const updateSample = (id: string, k: keyof SampleRow, v: string | string[] | boolean) =>
    onChange({ ...data, samples: data.samples.map(s => s.id === id ? { ...s, [k]: v } : s) });

  // Auto-update sampleNum when depth changes
  const updateDepth = (id: string, depth: string) => {
    const s = data.samples.find(x => x.id === id);
    if (!s) return;
    const autoNum = `${s.drillNum}-${depth}`;
    onChange({ ...data, samples: data.samples.map(x => x.id === id ? { ...x, depth, sampleNum: autoNum } : x) });
  };

  const getPidAlert = (pid: string) => parseFloat(pid || "0") > 20;

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

  const validateSign = () => true;

  const handleCloudUpload = async () => {
    if (!validateSign()) return;
    setCloudUploading(true);
    setCloudUploaded(false);
    setCloudError("");
    try {
      const html = buildFieldJournalHtml(data, user.name);
      const dateStr = (data.date || "").replace(/-/g, "");
      const siteStr = (data.site || "טופס").replace(/\s+/g, "_");
      const res = await fetch("/api/upload-dropbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: html,
          filename: `יומן_שדה_${siteStr}_${dateStr}.html`,
          projectName: data.site,
          date: data.date,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "שגיאה");
      setCloudUploaded(true);
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : String(e));
    }
    setCloudUploading(false);
  };

  const groups = groupByDrill(data.samples);
  const effectivePid = data.pid === "אחר" ? pidCustom : data.pid;

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
          <div className="text-green-300 text-xs">{data.site} · {user.name}</div>
        </div>
        <div className="flex gap-1.5 mr-auto">
          {(["header","samples","chart","sign"] as const).map((s, i) => (
            <div key={s} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border ${
              step === s ? "bg-white text-green-900 border-white" :
              ["header","samples","chart"].indexOf(s) < ["header","samples","chart","sign"].indexOf(step)
                ? "bg-green-700 border-green-600 text-green-200" : "border-green-700 text-green-500"
            }`}>{i+1}</div>
          ))}
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-24">

        {/* STEP 1: Header */}
        {step === "header" && (
          <div className="space-y-4">
            {headerErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">⚠ חסרים שדות חובה: {headerErrors.join(", ")}</p>
              </div>
            )}
            <div className="card">
              <p className="section-title">פרטי האתר (ממולאים מהפרויקט)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">שם האתר <span className="text-red-500">*</span></label>
                  <input value={data.site} onChange={e => { set("site", e.target.value); }} placeholder="שם האתר" />
                </div>
                <div className="col-span-2">
                  <label className="field-label">כתובת</label>
                  <input value={data.address} onChange={e => set("address", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">תאריך <span className="text-red-500">*</span></label>
                  <input type="date" value={data.date} onChange={e => set("date", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">שעת הגעה</label>
                  <input type="time" value={data.arrivalTime} onChange={e => set("arrivalTime", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">טמפ' תחילה (°C)</label>
                  <div className="flex gap-2">
                    <input type="number" value={data.tempStart} onChange={e => set("tempStart", e.target.value)} placeholder="--" className="flex-1" />
                    <button type="button" onClick={fetchWeather} disabled={fetchingWeather}
                      className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs whitespace-nowrap disabled:opacity-50">
                      {fetchingWeather ? "⏳" : "🌡 GPS"}
                    </button>
                  </div>
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
              <p className="section-title">דוגמים ואנשים</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">דוגם 1 <span className="text-red-500">*</span></label>
                  <select value={data.sampler1} onChange={e => set("sampler1", e.target.value)}>
                    <option value="">בחר דוגם...</option>
                    {samplerNames.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">דוגם 2 (אם יש)</label>
                  <select value={data.sampler2} onChange={e => set("sampler2", e.target.value)}>
                    <option value="">—</option>
                    {samplerNames.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">הלקוח</label>
                  <input value={data.client} onChange={e => set("client", e.target.value)} placeholder="שם הלקוח" />
                </div>
                <div>
                  <label className="field-label">נציג הלקוח</label>
                  <input value={data.clientRep} onChange={e => set("clientRep", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">מאשר הדו"ח</label>
                  <select value={data.reportApprover} onChange={e => set("reportApprover", e.target.value)}>
                    <option value="">בחר מאשר...</option>
                    {allUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">מכשור ותנאים</p>
              <div className="space-y-3">
                <div>
                  <label className="field-label">PID</label>
                  <select value={data.pid} onChange={e => set("pid", e.target.value)}>
                    <option value="">בחר PID...</option>
                    {PID_OPTIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  {data.pid === "אחר" && (
                    <input className="mt-2" value={pidCustom} onChange={e => setPidCustom(e.target.value)} placeholder="הזן מספר PID" />
                  )}
                </div>
                <div>
                  <label className="field-label">PID באוויר הפתוח (ppm)</label>
                  <input value={data.pidOpenAir} onChange={e => set("pidOpenAir", e.target.value)} placeholder="0.0" />
                </div>
                <div>
                  <label className="field-label">מזג האוויר (בחירה מרובה)</label>
                  <MultiCircleSelect options={WEATHER} value={Array.isArray(data.weather) ? data.weather : []} onChange={v => set("weather", v)} />
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

            <button onClick={() => { if (validateHeader()) setStep("samples"); }} className="btn-primary w-full">
              המשך לדגימות ←
            </button>
          </div>
        )}

        {/* STEP 2: Samples */}
        {step === "samples" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">{groups.length} קידוחים · {data.samples.length} דגימות</span>
              {data.samples.length > 0 && (
                <button onClick={() => setStep("chart")} className="text-xs text-green-700 border border-green-200 rounded-lg px-3 py-1.5 bg-green-50">
                  📊 הצג גרף
                </button>
              )}
            </div>

            {groups.length === 0 && (
              <div className="card text-center py-8 mb-3 text-gray-400 text-sm">הוסף קידוח ראשון למטה</div>
            )}

            {groups.map(({ drillNum, samples }) => {
              const isOpen = !!expandedDrills[drillNum];
              return (
                <div key={drillNum} className="card mb-3 overflow-hidden p-0">
                  <button onClick={() => toggleDrill(drillNum)}
                    className="w-full flex items-center justify-between p-3 text-right hover:bg-gray-50 transition-colors">
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
                      <button onClick={e => { e.stopPropagation(); removeDrill(drillNum); }} className="text-red-300 hover:text-red-500 p-1">
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

                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
                      {samples.map((row, idx) => (
                        <div key={row.id} className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">דגימה {idx + 1}</span>
                            <button onClick={() => removeSample(row.id)} className="text-xs text-red-300 hover:text-red-500">הסר</button>
                          </div>

                          {/* Single row for all numeric/time fields */}
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            <div>
                              <label className="field-label">עומק (מ')</label>
                              <input type="number" step="0.5" value={row.depth}
                                onChange={e => updateDepth(row.id, e.target.value)} placeholder="0.5" />
                            </div>
                            <div>
                              <label className="field-label">מס' דגימה</label>
                              <input value={row.sampleNum} onChange={e => updateSample(row.id, "sampleNum", e.target.value)} />
                            </div>
                            <div>
                              <label className="field-label">שעה</label>
                              <input type="time" value={row.time} onChange={e => updateSample(row.id, "time", e.target.value)} />
                            </div>
                            <div>
                              <label className="field-label">PID (ppm)</label>
                              <input
                                value={row.pid}
                                onChange={e => updateSample(row.id, "pid", e.target.value)}
                                placeholder="0.0"
                                className={getPidAlert(row.pid) ? "border-red-400 bg-red-50 font-bold" : ""}
                              />
                              {getPidAlert(row.pid) && (
                                <div className="mt-1 bg-red-100 border border-red-400 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                                  <span className="text-red-600 text-sm">⚠️</span>
                                  <span className="text-red-700 text-xs font-medium">ערך PID גבוה מ-20! נדרשת פעולה</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                              <label className="field-label">כלי דיגום</label>
                              <select value={row.samplingTool} onChange={e => updateSample(row.id, "samplingTool", e.target.value)}>
                                <option value="">בחר...</option>
                                {SAMPLING_TOOLS.map(t => <option key={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="field-label">מס' אריזות</label>
                              <input type="number" min="1" max="10" value={row.numContainers} onChange={e => updateSample(row.id, "numContainers", e.target.value)} />
                            </div>
                            <div>
                              <label className="field-label">סוג דגימה</label>
                              <CircleSelect options={SAMPLE_TYPES} value={row.sampleType} onChange={v => updateSample(row.id, "sampleType", v)} />
                            </div>
                          </div>

                          {/* Circle selects in rows */}
                          <div className="space-y-1.5 border-t border-gray-50 pt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0 text-xs">סוג קרקע</span>
                              <MultiCircleSelect options={SOIL_TYPES} value={Array.isArray(row.soilType) ? row.soilType : []} onChange={v => updateSample(row.id, "soilType", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0 text-xs">צבע</span>
                              <MultiCircleSelect options={COLORS} value={Array.isArray(row.color) ? row.color : []} onChange={v => updateSample(row.id, "color", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0 text-xs">ריח</span>
                              <CircleSelect options={SMELL} value={row.smell} onChange={v => updateSample(row.id, "smell", v)} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="field-label mb-0 w-16 flex-shrink-0 text-xs">לחות</span>
                              <CircleSelect options={MOISTURE} value={row.moisture} onChange={v => updateSample(row.id, "moisture", v)} />
                            </div>
                          </div>

                          {/* Lab selection + tests per sample */}
                          <div className="border-t border-gray-100 pt-2 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500 flex-shrink-0">שולח ל:</span>
                              <CircleSelect
                                options={["מעבדה ראשית","מעבדה משנית","לא שולח"]}
                                value={row.labChoice || (row.sendToLab ? "מעבדה ראשית" : "לא שולח")}
                                onChange={v => updateSample(row.id, "labChoice", v)}
                              />
                            </div>
                            {row.labChoice !== "לא שולח" && (
                              <div>
                                <span className="text-xs text-gray-500">בדיקות:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {LAB_TESTS.map(t => (
                                    <button key={t} type="button"
                                      onClick={() => {
                                        const cur = row.tests || [];
                                        updateSample(row.id, "tests", cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]);
                                      }}
                                      className={`px-2 py-0.5 rounded text-xs border transition-all ${
                                        (row.tests||[]).includes(t) ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-500 border-gray-200"
                                      }`}>{t}</button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-2">
                            <input value={row.notes} onChange={e => updateSample(row.id, "notes", e.target.value)} placeholder="הערות..." />
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addSampleToDrill(drillNum)}
                        className="w-full text-xs text-green-700 border border-dashed border-green-300 rounded-lg py-2 hover:bg-green-50 transition-colors">
                        + הוסף דגימה לקידוח {drillNum}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="card border-dashed border-2 border-gray-200 bg-transparent">
              <p className="text-sm font-medium text-gray-600 mb-2">הוסף קידוח חדש</p>
              <div className="flex gap-2">
                <input value={newDrillNum} onChange={e => setNewDrillNum(e.target.value)}
                  placeholder={`B-${groups.length + 1}`} className="flex-1"
                  onKeyDown={e => e.key === "Enter" && addDrill()} />
                <button onClick={addDrill} className="btn-primary whitespace-nowrap">+ קידוח</button>
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
              <SignaturePad label="חתום/י עם העט או האצבע:" onChange={v => set("signature", v)} />
            </div>

            <div className="card">
              <p className="section-title">שמירה בענן</p>
              {cloudUploaded && <p className="text-green-600 text-xs mb-2">✓ יומן השדה נשמר בענן!</p>}
              {cloudError && <p className="text-amber-600 text-xs mb-2">{cloudError}</p>}
              <button onClick={handleCloudUpload} disabled={cloudUploading || !data.site}
                className="w-full flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">
                {cloudUploading ? "⏳ מעלה..." : "☁ שמור יומן שדה בענן"}
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
              <button onClick={() => { if (validateSign()) onContinue(); }}
                disabled={!data.site} className="btn-primary flex-1 disabled:opacity-50">
                המשך לסיכום יום ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
