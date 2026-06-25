"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, ChainOfCustodyData, SampleRow } from "@/types/forms";
import { LAB_TESTS, SAMPLING_TOOLS, WEATHER } from "@/types/forms";
import CircleSelect from "./CircleSelect";
import SignaturePad from "./SignaturePad";

type Props = {
  user: User;
  fieldData?: FieldJournalData;
  onBack: () => void;
  onDone: () => void;
};

const initFromField = (user: User, field?: FieldJournalData): ChainOfCustodyData => ({
  site: field?.site ?? "",
  date: field?.date ?? new Date().toISOString().split("T")[0],
  lab: "",
  billedTo: field?.client ?? "",
  address: field?.address ?? "",
  weather: field?.weather ?? "",
  landUse: "",
  groundwaterLevel: "",
  pid: field?.pid ?? "",
  samplerName: user.name,
  reportApprover: "",
  clientName: field?.client ?? "",
  contactPerson: field?.clientRep ?? "",
  drilledBySubcontractor: "",
  sampledBySubcontractor: "",
  deviations: "",
  tests: [],
  storageLocation: "",
  storageManager: "",
  storageStartDate: "",
  storageStartTime: "",
  storageEndDate: "",
  storageEndTime: "",
  storageCondition: "",
  deliveredBy: user.name,
  deliveryDate: new Date().toISOString().split("T")[0],
  deliveryTime: "",
  receivedBy: "",
  receivedDate: "",
  receivedTime: "",
  signature: "",
  samples: field?.samples ?? [],
});

export default function ChainOfCustodyForm({ user, fieldData, onBack, onDone }: Props) {
  const [data, setData] = useState<ChainOfCustodyData>(() => initFromField(user, fieldData));
  const [step, setStep] = useState<"header" | "samples" | "sign">("header");
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof ChainOfCustodyData, v: string | string[]) =>
    setData(d => ({ ...d, [k]: v }));

  const toggleTest = (t: string) =>
    setData(d => ({
      ...d,
      tests: d.tests.includes(t) ? d.tests.filter(x => x !== t) : [...d.tests, t]
    }));

  const toggleSend = (id: string) =>
    setData(d => ({
      ...d,
      samples: d.samples.map(s => s.id === id ? { ...s, sendToLab: !s.sendToLab } : s)
    }));

  const updateSampleTool = (id: string, v: string) =>
    setData(d => ({
      ...d,
      samples: d.samples.map(s => s.id === id ? { ...s, notes: v } : s)
    }));

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { onDone(); }, 2500);
  };

  if (submitted) return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-2">הטפסים הושלמו!</h2>
        <p className="text-green-300 text-sm">יומן שדה ושרשרת משמורת נשמרו</p>
        <p className="text-green-400 text-xs mt-1">חוזר לדף הבית...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-green-300 hover:text-white">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div>
          <div className="font-medium text-sm">שרשרת משמורת · טופס 33.1</div>
          <div className="text-green-300 text-xs">{user.name}</div>
        </div>
        <div className="flex gap-2 mr-auto">
          {(["header","samples","sign"] as const).map((s, i) => (
            <div key={s} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border ${
              step === s ? "bg-white text-green-900 border-white" :
              (step === "samples" && s === "header") || (step === "sign") ? "bg-green-700 border-green-600 text-green-200" :
              "border-green-700 text-green-500"
            }`}>{i+1}</div>
          ))}
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-24">

        {step === "header" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">פרטי הטופס</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">האתר *</label>
                  <input value={data.site} onChange={e => set("site", e.target.value)} placeholder="שם האתר" />
                </div>
                <div>
                  <label className="field-label">תאריך</label>
                  <input type="date" value={data.date} onChange={e => set("date", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">מעבדה</label>
                  <CircleSelect options={["מעבדה ראשית","מעבדה משנית"]} value={data.lab} onChange={v => set("lab", v)} />
                </div>
                <div className="col-span-2">
                  <label className="field-label">כתובת</label>
                  <input value={data.address} onChange={e => set("address", e.target.value)} placeholder="כתובת האתר" />
                </div>
                <div>
                  <label className="field-label">לחייב</label>
                  <input value={data.billedTo} onChange={e => set("billedTo", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">יעוד הקרקע</label>
                  <input value={data.landUse} onChange={e => set("landUse", e.target.value)} placeholder="מגורים / תעשייה..." />
                </div>
                <div>
                  <label className="field-label">מפלס מי תהום (משוער)</label>
                  <input value={data.groundwaterLevel} onChange={e => set("groundwaterLevel", e.target.value)} placeholder="מטר" />
                </div>
                <div>
                  <label className="field-label">PID</label>
                  <input value={data.pid} onChange={e => set("pid", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">מזג האוויר</label>
                  <CircleSelect options={WEATHER} value={data.weather} onChange={v => set("weather", v)} />
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">אנשים</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">שם הדוגם</label>
                  <input value={data.samplerName} onChange={e => set("samplerName", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">מאשר הדו"ח</label>
                  <input value={data.reportApprover} onChange={e => set("reportApprover", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">לקוח</label>
                  <input value={data.clientName} onChange={e => set("clientName", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">איש קשר</label>
                  <input value={data.contactPerson} onChange={e => set("contactPerson", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">הצהרות</p>
              <div className="space-y-3">
                <div>
                  <label className="field-label">קידוח בוצע ע"י קבלן משנה</label>
                  <CircleSelect options={["כן","לא"]} value={data.drilledBySubcontractor} onChange={v => set("drilledBySubcontractor", v)} />
                </div>
                <div>
                  <label className="field-label">דיגום בוצע ע"י קבלן משנה</label>
                  <CircleSelect options={["כן","לא"]} value={data.sampledBySubcontractor} onChange={v => set("sampledBySubcontractor", v)} />
                </div>
                <div>
                  <label className="field-label">חריגות</label>
                  <CircleSelect options={["אין","יש"]} value={data.deviations} onChange={v => set("deviations", v)} />
                </div>
              </div>
            </div>

            <div className="card">
              <p className="section-title">בדיקות נדרשות</p>
              <div className="flex flex-wrap gap-2">
                {LAB_TESTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTest(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      data.tests.includes(t)
                        ? "bg-green-800 text-white border-green-800"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setStep("samples")} className="btn-primary w-full">
              המשך לבחירת דגימות ←
            </button>
          </div>
        )}

        {step === "samples" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">בחירת דגימות לשליחה למעבדה</p>
              {data.samples.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">אין דגימות מיומן השדה. ניתן להמשיך ישירות.</p>
              )}
              {data.samples.map((row, idx) => (
                <div key={row.id} className={`border rounded-xl p-3 mb-2 transition-all ${
                  row.sendToLab ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">קידוח {row.drillNum || idx+1}</span>
                      {row.sampleNum && <span className="text-gray-500 text-xs mr-2">· {row.sampleNum}</span>}
                      {row.depth && <span className="text-gray-500 text-xs">· {row.depth} מ'</span>}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleSend(row.id)}
                        className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                          row.sendToLab
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        {row.sendToLab ? "✓ שולחים" : "לא שולחים"}
                      </button>
                    </div>
                  </div>
                  {row.sendToLab && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="field-label">כלי דיגום</label>
                        <select className="text-xs py-1"
                          value={row.notes}
                          onChange={e => updateSampleTool(row.id, e.target.value)}>
                          <option value="">בחר...</option>
                          {SAMPLING_TOOLS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">מס' אריזות</label>
                        <input type="number" min="1" max="10" className="text-xs py-1" placeholder="1" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <p className="section-title">אחסון (אם רלוונטי)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">מקום אחסון</label>
                  <input value={data.storageLocation} onChange={e => set("storageLocation", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">אחראי אחסון</label>
                  <input value={data.storageManager} onChange={e => set("storageManager", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">תנאי אחסון</label>
                  <CircleSelect options={["תקין","לא תקין"]} value={data.storageCondition} onChange={v => set("storageCondition", v)} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("header")} className="btn-secondary flex-1">← חזרה</button>
              <button onClick={() => setStep("sign")} className="btn-primary flex-1">המשך לחתימה ←</button>
            </div>
          </div>
        )}

        {step === "sign" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">מסירה</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">נמסר ע"י</label>
                  <input value={data.deliveredBy} onChange={e => set("deliveredBy", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">תאריך מסירה</label>
                  <input type="date" value={data.deliveryDate} onChange={e => set("deliveryDate", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">שעת מסירה</label>
                  <input type="time" value={data.deliveryTime} onChange={e => set("deliveryTime", e.target.value)} />
                </div>
              </div>
              <SignaturePad
                label="חתימת הדוגם:"
                onChange={v => set("signature", v)}
              />
            </div>

            <div className="card bg-green-50 border-green-100">
              <p className="section-title text-green-800">סיכום</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>אתר: <strong>{data.site || "—"}</strong></p>
                <p>מעבדה: <strong>{data.lab || "—"}</strong></p>
                <p>דגימות לשליחה: <strong>{data.samples.filter(s => s.sendToLab).length}</strong></p>
                <p>בדיקות: <strong>{data.tests.join(", ") || "—"}</strong></p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
              <button
                onClick={handleSubmit}
                disabled={!data.site}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                ✓ סיים ושמור
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
