"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, SampleRow } from "@/types/forms";
import { SOIL_TYPES, COLORS, MOISTURE, SMELL, WEATHER, DRILLING_TOOLS } from "@/types/forms";
import CircleSelect from "./CircleSelect";
import SignaturePad from "./SignaturePad";

type Props = {
  user: User;
  data: FieldJournalData;
  onChange: (d: FieldJournalData) => void;
  onBack: () => void;
  onContinue: () => void;
};

const newRow = (): SampleRow => ({
  id: crypto.randomUUID(), drillNum: "", sampleNum: "", depth: "", time: "",
  soilType: "", color: "", smell: "", moisture: "", pid: "", pid20: "", notes: "",
  sendToLab: true
});

export default function FieldJournalForm({ user, data, onChange, onBack, onContinue }: Props) {
  const [step, setStep] = useState<"header" | "samples" | "sign">("header");

  const set = (k: keyof FieldJournalData, v: string) => onChange({ ...data, [k]: v });

  const addRow = () => onChange({ ...data, samples: [...data.samples, newRow()] });

  const updateRow = (id: string, k: keyof SampleRow, v: string) =>
    onChange({ ...data, samples: data.samples.map(s => s.id === id ? { ...s, [k]: v } : s) });

  const removeRow = (id: string) =>
    onChange({ ...data, samples: data.samples.filter(s => s.id !== id) });

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
        {/* Steps indicator */}
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

        {/* STEP 1: Header fields */}
        {step === "header" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">פרטי האתר</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">שם האתר *</label>
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
              <p className="section-title">נתוני מדידה ואנשים</p>
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
                  <label className="field-label">דוגם 1</label>
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
                  <label className="field-label">וודא/י בדיקת מוכנות ליום דיגום (לפי טפסים 55,56)</label>
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

            <button onClick={() => setStep("samples")} className="btn-primary w-full">
              המשך לדגימות ←
            </button>
          </div>
        )}

        {/* STEP 2: Samples table */}
        {step === "samples" && (
          <div>
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="section-title mb-0">טבלת דגימות</p>
                <span className="text-xs text-gray-400">{data.samples.length} שורות</span>
              </div>

              {data.samples.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">לחץ על &quot;הוסף שורה&quot; להוספת דגימה</p>
              )}

              {data.samples.map((row, idx) => (
                <div key={row.id} className="border border-gray-100 rounded-xl p-3 mb-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">שורה {idx + 1}</span>
                    <button onClick={() => removeRow(row.id)} className="text-xs text-red-400 hover:text-red-600">
                      הסר
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="field-label">מס' קידוח</label>
                      <input value={row.drillNum} onChange={e => updateRow(row.id, "drillNum", e.target.value)} placeholder="B-1" />
                    </div>
                    <div>
                      <label className="field-label">מס' דגימה</label>
                      <input value={row.sampleNum} onChange={e => updateRow(row.id, "sampleNum", e.target.value)} placeholder="1-0.5" />
                    </div>
                    <div>
                      <label className="field-label">עומק (מ')</label>
                      <input type="number" step="0.5" value={row.depth} onChange={e => updateRow(row.id, "depth", e.target.value)} placeholder="0.5" />
                    </div>
                    <div>
                      <label className="field-label">שעה</label>
                      <input type="time" value={row.time} onChange={e => updateRow(row.id, "time", e.target.value)} />
                    </div>
                    <div>
                      <label className="field-label">ערך PID</label>
                      <input value={row.pid} onChange={e => updateRow(row.id, "pid", e.target.value)} placeholder="ppm" />
                    </div>
                    <div>
                      <label className="field-label">PID 20%</label>
                      <input value={row.pid20} onChange={e => updateRow(row.id, "pid20", e.target.value)} placeholder="ppm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="field-label">סוג קרקע</label>
                      <CircleSelect options={SOIL_TYPES} value={row.soilType} onChange={v => updateRow(row.id, "soilType", v)} />
                    </div>
                    <div>
                      <label className="field-label">צבע</label>
                      <CircleSelect options={COLORS} value={row.color} onChange={v => updateRow(row.id, "color", v)} />
                    </div>
                    <div>
                      <label className="field-label">ריח</label>
                      <CircleSelect options={SMELL} value={row.smell} onChange={v => updateRow(row.id, "smell", v)} />
                    </div>
                    <div>
                      <label className="field-label">לחות</label>
                      <CircleSelect options={MOISTURE} value={row.moisture} onChange={v => updateRow(row.id, "moisture", v)} />
                    </div>
                    <div>
                      <label className="field-label">הערות</label>
                      <input value={row.notes} onChange={e => updateRow(row.id, "notes", e.target.value)} placeholder="הערות נוספות..." />
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addRow} className="btn-secondary w-full mt-1">
                + הוסף שורת דגימה
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("header")} className="btn-secondary flex-1">← חזרה</button>
              <button onClick={() => setStep("sign")} className="btn-primary flex-1">המשך לחתימה ←</button>
            </div>
          </div>
        )}

        {/* STEP 3: Signature */}
        {step === "sign" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">חתימת הדוגם</p>
              <SignaturePad
                label="חתום/י עם העט או האצבע:"
                onChange={v => set("signature", v)}
              />
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
