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

const LAB_OPTIONS = ["מעבדה ראשית", "מעבדה משנית", "ללא"];

const OFFICE_EMAIL = "office@vasa-eco.co.il"; // ← תעדכן עם המייל האמיתי

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
  deliveryTime: new Date().toTimeString().slice(0, 5),
  receivedBy: "",
  receivedDate: "",
  receivedTime: "",
  signature: "",
  samples: field?.samples ?? [],
});

// Required field definitions per step
const REQUIRED_HEADER = [
  { key: "site", label: "שם האתר" },
  { key: "date", label: "תאריך" },
  { key: "samplerName", label: "שם הדוגם" },
];

function RequiredNote({ label }: { label: string }) {
  return (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <span>⚠</span> שדה חובה: <strong>{label}</strong> חייב להיות מלא להמשך
    </p>
  );
}

export default function ChainOfCustodyForm({ user, fieldData, onBack, onDone }: Props) {
  const [data, setData] = useState<ChainOfCustodyData>(() => initFromField(user, fieldData));
  const [step, setStep] = useState<"header" | "samples" | "sign">("header");
  const [labSignature, setLabSignature] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState("שרשרת_משמורת");
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [signErrors, setSignErrors] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState(OFFICE_EMAIL);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  const set = (k: keyof ChainOfCustodyData, v: string | string[]) =>
    setData(d => ({ ...d, [k]: v }));

  // Labs
  const labsArray = data.lab ? data.lab.split(",").filter(Boolean) : [];
  const toggleLab = (opt: string) => {
    if (opt === "ללא") { set("lab", labsArray.includes("ללא") ? "" : "ללא"); return; }
    const without = labsArray.filter(l => l !== "ללא");
    const next = without.includes(opt) ? without.filter(l => l !== opt) : [...without, opt];
    set("lab", next.join(","));
  };

  const toggleTest = (t: string) =>
    setData(d => ({ ...d, tests: d.tests.includes(t) ? d.tests.filter(x => x !== t) : [...d.tests, t] }));

  const toggleSend = (id: string) =>
    setData(d => ({ ...d, samples: d.samples.map(s => s.id === id ? { ...s, sendToLab: !s.sendToLab } : s) }));

  const updateSampleTool = (id: string, v: string) =>
    setData(d => ({ ...d, samples: d.samples.map(s => s.id === id ? { ...s, notes: v } : s) }));

  // Validate header required fields
  const validateHeader = () => {
    const errs = REQUIRED_HEADER.filter(f => !data[f.key as keyof ChainOfCustodyData]).map(f => f.label);
    setHeaderErrors(errs);
    return errs.length === 0;
  };

  // Validate sign step — only deliveredBy is required; signature is strongly recommended
  const validateSign = () => {
    const errs: string[] = [];
    if (!data.deliveredBy) errs.push("שם הממסר");
    // signature is recommended but not blocking
    setSignErrors(errs);
    return errs.length === 0;
  };

  const handleGeneratePdf = async () => {
    if (!validateSign()) return;
    setGenerating(true);
    setPdfError("");
    try {
      const { generatePdfBlob } = await import("@/lib/generatePdfClient");
      const { url, filename } = await generatePdfBlob(data, labSignature || undefined);
      setPdfUrl(url);
      setPdfFilename(filename);
    } catch (e) {
      console.error("PDF generation error:", e);
      setPdfError(`שגיאה ביצירת PDF: ${e instanceof Error ? e.message : String(e)}`);
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    // Open HTML in new tab with print dialog
    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => setTimeout(() => printWindow.print(), 400);
      setTimeout(() => { try { printWindow.print(); } catch(_){} }, 900);
    }
  };

  const handleEmail = async () => {
    if (!pdfUrl) return;
    setEmailSending(true);
    setEmailSent(false);
    setEmailError("");
    try {
      // Fetch the HTML blob and convert to base64 for email
      const pdfBlob = await fetch(pdfUrl).then(r => r.blob());
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const dateStr = data.date.replace(/-/g, "");
      const filename = `שרשרת_משמורת_${data.site || "ללא_שם"}_${dateStr}.pdf`;
      const subject = `שרשרת משמורת · ${data.site} · ${data.date}`;
      const body = `אתר: ${data.site}
תאריך: ${data.date}
דוגם: ${data.samplerName}
מעבדה: ${data.lab || "—"}
דגימות לשליחה: ${data.samples.filter(s => s.sendToLab).length}
בדיקות: ${data.tests.join(", ") || "—"}

הדו"ח נוצר אוטומטית ממערכת דיגום השדה.`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customEmail, subject, body, pdfBase64: base64, filename }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.instructions) {
          // Resend not configured — fall back to mailto + download
          handleDownload();
          const sub = encodeURIComponent(subject);
          const bod = encodeURIComponent(body);
          window.open(`mailto:${customEmail}?subject=${sub}&body=${bod}`);
          setEmailError("שלב ביניים: המייל נפתח בתוכנתך — צרף את ה-PDF שהורד");
        } else {
          throw new Error(result.error || "שגיאה בשליחת המייל");
        }
      } else {
        setEmailSent(true);
      }
    } catch (e) {
      setEmailError(`שגיאה: ${e instanceof Error ? e.message : String(e)}`);
    }
    setEmailSending(false);
  };

  const handleDone = () => {
    setSubmitted(true);
    setTimeout(onDone, 2000);
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
        <p className="text-green-300 text-sm">שרשרת משמורת נשמרה בהצלחה</p>
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
              (step === "samples" && s === "header") || step === "sign"
                ? "bg-green-700 border-green-600 text-green-200"
                : "border-green-700 text-green-500"
            }`}>{i+1}</div>
          ))}
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-24">

        {/* ─── STEP 1: Header ─── */}
        {step === "header" && (
          <div className="space-y-4">

            {/* Required fields notice */}
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-start gap-2">
              <span className="text-red-400 text-sm mt-0.5">*</span>
              <p className="text-red-500 text-xs">שדות המסומנים ב-<strong>*</strong> הם שדות חובה ויש למלא אותם לפני המשך</p>
            </div>

            <div className="card">
              <p className="section-title">פרטי הטופס</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">האתר <span className="text-red-500">*</span></label>
                  <input
                    value={data.site}
                    onChange={e => { set("site", e.target.value); setHeaderErrors(p => p.filter(e => e !== "שם האתר")); }}
                    placeholder="שם האתר"
                    className={!data.site && headerErrors.includes("שם האתר") ? "border-red-400 bg-red-50" : ""}
                  />
                  {!data.site && headerErrors.includes("שם האתר") && <RequiredNote label="שם האתר" />}
                </div>
                <div>
                  <label className="field-label">תאריך <span className="text-red-500">*</span></label>
                  <input type="date" value={data.date} onChange={e => set("date", e.target.value)}
                    className={!data.date && headerErrors.includes("תאריך") ? "border-red-400 bg-red-50" : ""}
                  />
                </div>
                <div className="col-span-2">
                  <label className="field-label">מעבדה (ניתן לבחור יותר מאחת)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {LAB_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleLab(opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          labsArray.includes(opt)
                            ? opt === "ללא" ? "bg-gray-600 text-white border-gray-600" : "bg-green-800 text-white border-green-800"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}>
                        {labsArray.includes(opt) ? "✓ " : ""}{opt}
                      </button>
                    ))}
                  </div>
                  {labsArray.length > 0 && <p className="text-xs text-gray-400 mt-1">נבחר: {labsArray.join(", ")}</p>}
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
                  <label className="field-label">מפלס מי תהום</label>
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
                  <label className="field-label">שם הדוגם <span className="text-red-500">*</span></label>
                  <input value={data.samplerName}
                    onChange={e => { set("samplerName", e.target.value); setHeaderErrors(p => p.filter(e => e !== "שם הדוגם")); }}
                    className={!data.samplerName && headerErrors.includes("שם הדוגם") ? "border-red-400 bg-red-50" : ""}
                  />
                  {!data.samplerName && headerErrors.includes("שם הדוגם") && <RequiredNote label="שם הדוגם" />}
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
                  <button key={t} type="button" onClick={() => toggleTest(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      data.tests.includes(t)
                        ? "bg-green-800 text-white border-green-800"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}>
                    {t}
                  </button>
                ))}
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

            <button
              onClick={() => { if (validateHeader()) setStep("samples"); }}
              className="btn-primary w-full"
            >
              המשך לבחירת דגימות ←
            </button>
          </div>
        )}

        {/* ─── STEP 2: Samples ─── */}
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
                      {row.depth && <span className="text-gray-500 text-xs">· {row.depth} מ&#39;</span>}
                    </div>
                    <button onClick={() => toggleSend(row.id)}
                      className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                        row.sendToLab ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-500 border-gray-200"
                      }`}>
                      {row.sendToLab ? "✓ שולחים" : "לא שולחים"}
                    </button>
                  </div>
                  {row.sendToLab && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="field-label">כלי דיגום</label>
                        <select className="text-xs py-1" value={row.notes} onChange={e => updateSampleTool(row.id, e.target.value)}>
                          <option value="">בחר...</option>
                          {SAMPLING_TOOLS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">מס&#39; אריזות</label>
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

        {/* ─── STEP 3: Signatures + PDF ─── */}
        {step === "sign" && (
          <div className="space-y-4">

            {/* Sampler signature */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-medium">1</div>
                <p className="section-title mb-0">חתימת הדוגם <span className="text-red-500">*</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">נמסר ע"י <span className="text-red-500">*</span></label>
                  <input value={data.deliveredBy}
                    onChange={e => { set("deliveredBy", e.target.value); setSignErrors(p => p.filter(x => x !== "שם הממסר")); }}
                    className={!data.deliveredBy && signErrors.includes("שם הממסר") ? "border-red-400 bg-red-50" : ""}
                  />
                  {!data.deliveredBy && signErrors.includes("שם הממסר") && <RequiredNote label="שם הממסר" />}
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
                label="חתום/י עם העט או האצבע — חתימת הדוגם:"
                onChange={v => { set("signature", v); setSignErrors(p => p.filter(x => x !== "חתימת הדוגם")); }}
              />
              {!data.signature && signErrors.includes("חתימת הדוגם") && <RequiredNote label="חתימת הדוגם" />}
            </div>

            {/* Lab receiver signature */}
            <div className="card border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">2</div>
                <p className="section-title mb-0 text-blue-800">חתימת מקבל במעבדה</p>
                <span className="text-xs text-gray-400">(אופציונלי — ימולא בקבלה)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">שם המקבל</label>
                  <input value={data.receivedBy} onChange={e => set("receivedBy", e.target.value)} placeholder="שם מקבל הדגימות" />
                </div>
                <div>
                  <label className="field-label">תאריך קבלה</label>
                  <input type="date" value={data.receivedDate} onChange={e => set("receivedDate", e.target.value)} />
                </div>
                <div>
                  <label className="field-label">שעת קבלה</label>
                  <input type="time" value={data.receivedTime} onChange={e => set("receivedTime", e.target.value)} />
                </div>
              </div>
              <SignaturePad
                label="חתימת מקבל הדגימות במעבדה:"
                onChange={setLabSignature}
              />
            </div>

            {/* Summary */}
            <div className="card bg-green-50 border-green-100">
              <p className="section-title text-green-800">סיכום לפני יצירת PDF</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>אתר: <strong>{data.site}</strong></p>
                <p>מעבדה: <strong>{labsArray.length > 0 ? labsArray.join(", ") : "—"}</strong></p>
                <p>דגימות לשליחה: <strong>{data.samples.filter(s => s.sendToLab).length}</strong></p>
                <p>בדיקות: <strong>{data.tests.join(", ") || "—"}</strong></p>
                <p>דוגם: <strong>{data.samplerName}</strong></p>
                <p>חתימת דוגם: <strong className={data.signature ? "text-green-600" : "text-red-500"}>{data.signature ? "✓ חתום" : "✗ חסרה"}</strong></p>
                <p>חתימת מעבדה: <strong className={labSignature ? "text-green-600" : "text-gray-400"}>{labSignature ? "✓ חתום" : "—"}</strong></p>
              </div>
            </div>

            {/* Validation errors */}
            {signErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium mb-1">⚠ חסרים שדות חובה:</p>
                <ul className="text-red-500 text-xs list-disc list-inside">
                  {signErrors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}

            {/* Generate PDF button */}
            {!pdfUrl ? (
              <>
              <button
                onClick={handleGeneratePdf}
                disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><span className="animate-spin">⏳</span> יוצר PDF...</>
                ) : (
                  <><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> צור PDF</>
                )}
              </button>
              {pdfError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  ⚠ {pdfError}
                </div>
              )}
              </>
            ) : (
              <div className="space-y-3">
                {/* PDF ready */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm font-medium mb-1">✓ הטופס מוכן להדפסה</p>
                  <p className="text-green-600 text-xs">לחץ "פתח והדפס" ← בחר "שמור כ-PDF" ← שמור</p>
                </div>

                {/* Print/Download button */}
                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  פתח והדפס / שמור PDF
                </button>

                {/* Email section */}
                <div className="card">
                  <p className="section-title">שלח למייל המשרד</p>
                  <div className="mb-3">
                    <label className="field-label">כתובת מייל</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      placeholder="office@vasa-eco.co.il"
                    />
                    <p className="text-xs text-gray-400 mt-1">הזן את כתובת המייל הרצויה</p>
                  </div>
                  {emailSent && (
                    <p className="text-green-600 text-xs mb-2">✓ המייל נשלח בהצלחה עם ה-PDF מצורף!</p>
                  )}
                  {emailError && (
                    <p className="text-amber-600 text-xs mb-2">{emailError}</p>
                  )}
                  <button
                    onClick={handleEmail}
                    disabled={emailSending}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {emailSending ? (
                      <><span className="animate-spin">⏳</span> שולח מייל...</>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        שלח במייל עם PDF מצורף
                      </>
                    )}
                  </button>
                </div>

                {/* Done button */}
                <div className="flex gap-2">
                  <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
                  <button onClick={handleDone} className="btn-primary flex-1">✓ סיים</button>
                </div>
              </div>
            )}

            {!pdfUrl && (
              <div className="flex gap-2">
                <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
