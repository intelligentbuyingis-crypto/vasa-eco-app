"use client";
import { useState } from "react";
import type { User } from "@/lib/users";
import type { FieldJournalData, ChainOfCustodyData } from "@/types/forms";
import { LAB_TESTS, SAMPLING_TOOLS, WEATHER } from "@/types/forms";
import CircleSelect from "./CircleSelect";
import SignaturePad from "./SignaturePad";

type Props = {
  user: User;
  fieldData?: FieldJournalData;
  projectName?: string;
  onBack: () => void;
  onDone: () => void;
};

const LAB_OPTIONS = ["מעבדה ראשית", "מעבדה משנית", "ללא"];
const OFFICE_EMAIL = "office@vasa-eco.co.il";

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

const REQUIRED_HEADER = [
  { key: "site", label: "שם האתר" },
  { key: "date", label: "תאריך" },
  { key: "samplerName", label: "שם הדוגם" },
];

function RequiredNote({ label }: { label: string }) {
  return (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <span>⚠</span> שדה חובה: <strong>{label}</strong>
    </p>
  );
}

function buildPdfHtml(data: ChainOfCustodyData, labSignature: string): string {
  const labsLabel = data.lab ? data.lab.split(",").filter(Boolean).join(", ") : "—";
  const sendSamples = data.samples.filter(s => s.sendToLab);
  const LAB_TESTS_ORDER = ["TPH GRO", "VOC", "SVOC", "PH", "PFAS", "CR+6", "ICP מתכות", "TPH D+O"];
  const genAt = new Date().toLocaleString("he-IL");

  const sampleRows = sendSamples.map((s, i) => {
    const bg = i % 2 === 0 ? "#ffffff" : "#f8f8f8";
    const testCells = LAB_TESTS_ORDER.map(t => {
      const checked = data.tests.includes(t);
      return "<td style=\"border:0.5px solid #ccc;padding:2px;text-align:center;font-size:7pt\">" +
        (checked ? "<span style=\"color:#0d6626;font-weight:bold\">&#10003;</span>" : "") +
        "</td>";
    }).join("");
    return "<tr style=\"background:" + bg + "\">" +
      "<td style=\"border:0.5px solid #ccc;padding:2px 4px;font-size:7pt\">" + (s.sampleNum || (s.drillNum + "-" + (i + 1))) + "</td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;text-align:center;font-size:7pt\">" + (s.depth ? s.depth + "מ'" : "") + "</td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;text-align:center;font-size:7pt\">" + (s.time || "") + "</td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;text-align:center;font-size:7pt\">" + (s.notes || "") + "</td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;font-size:7pt\"></td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;font-size:7pt\"></td>" +
      testCells +
      "<td style=\"border:0.5px solid #ccc;padding:2px;text-align:center;font-size:7pt\">" + (s.pid || "") + "</td>" +
      "<td style=\"border:0.5px solid #ccc;padding:2px;font-size:7pt\"></td>" +
      "</tr>";
  }).join("");

  const fillerCount = Math.max(0, 8 - sendSamples.length);
  const fillerRows = Array.from({ length: fillerCount }, (_, i) => {
    const bg = (sendSamples.length + i) % 2 === 0 ? "#ffffff" : "#f8f8f8";
    return "<tr style=\"background:" + bg + ";height:14px\"><td colspan=\"16\" style=\"border:0.5px solid #ccc\"></td></tr>";
  }).join("");

  const samplerSig = data.signature
    ? "<img src=\"" + data.signature + "\" style=\"max-height:30px;display:block\"/>"
    : "<div style=\"color:#aaa;font-size:7pt;margin-top:8px\">חתימה לא צורפה</div>";

  const labSigHtml = labSignature
    ? "<img src=\"" + labSignature + "\" style=\"max-height:30px;display:block\"/>"
    : "<div style=\"color:#aaa;font-size:7pt;margin-top:8px\">ימולא עם קבלה במעבדה</div>";

  const thStyle = "border:0.5px solid #999;padding:2px;font-size:6.2pt;color:#0d5520;text-align:center;background:#c8e6c9";

  return "<!DOCTYPE html>" +
    "<html dir=\"rtl\" lang=\"he\"><head><meta charset=\"UTF-8\">" +
    "<style>*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}" +
    "body{padding:8px;font-size:8pt}@media print{body{padding:0}}</style></head><body>" +

    "<div style=\"background:#0d6626;color:white;display:flex;align-items:stretch;margin-bottom:3px\">" +
    "<div style=\"background:white;padding:4px 6px;min-width:80px\">" +
    "<img src=\"data:image/png;base64,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\" style=\"height:44px;width:auto\" />" +
    "</div>" +
    "<div style=\"flex:1;text-align:center;padding:6px 0\">" +
    "<div style=\"font-size:14pt;font-weight:bold\">וזה אקולוגיה בע&quot;מ</div>" +
    "<div style=\"font-size:10pt\">הנושא: טופס משמורת לדיגום קרקע</div></div>" +
    "<div style=\"font-size:6.5pt;padding:5px 8px;opacity:0.85;text-align:left\">" +
    "מהדורה: 20<br>תוקף: 10.03.2026<br>טופס מס': 33.1</div></div>" +

    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:2px\">" +
    "<tr>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px;width:30%\"><span style=\"font-size:6.5pt;color:#666\">האתר:</span><br><b>" + (data.site || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">תאריך:</span><br><b>" + (data.date || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">מעבדה:</span><br><b>" + labsLabel + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">לחייב:</span><br><b>" + (data.billedTo || "—") + "</b></td>" +
    "</tr><tr>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">כתובת:</span><br><b>" + (data.address || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">מזג אוויר:</span><br><b>" + (data.weather || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">יעוד קרקע:</span><br><b>" + (data.landUse || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">PID / מפלס מי תהום:</span><br><b>" + (data.pid || "—") + " / " + (data.groundwaterLevel || "—") + "</b></td>" +
    "</tr><tr>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">שם הדוגם:</span><br><b>" + (data.samplerName || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">מאשר הדו\"ח:</span><br><b>" + (data.reportApprover || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">לקוח:</span><br><b>" + (data.clientName || "—") + "</b></td>" +
    "<td style=\"border:0.5px solid #999;padding:2px 5px\"><span style=\"font-size:6.5pt;color:#666\">איש קשר:</span><br><b>" + (data.contactPerson || "—") + "</b></td>" +
    "</tr></table>" +

    "<div style=\"background:#f0f0f0;border:0.5px solid #aaa;padding:3px 6px;margin-bottom:2px;font-size:7.5pt\">" +
    "קידוח ע\"י קבלן: <b>" + (data.drilledBySubcontractor || "—") + "</b> &nbsp;|&nbsp; " +
    "דיגום ע\"י קבלן: <b>" + (data.sampledBySubcontractor || "—") + "</b> &nbsp;|&nbsp; " +
    "חריגות: <b>" + (data.deviations || "—") + "</b></div>" +

    "<div style=\"background:#0d6626;color:white;padding:4px 8px;font-weight:bold;font-size:9pt\">טופס משמורת לדיגום קרקע ודרישת בדיקות</div>" +

    "<table style=\"width:100%;border-collapse:collapse\">" +
    "<thead><tr>" +
    "<th style=\"" + thStyle + "\">זיהוי דגימה</th>" +
    "<th style=\"" + thStyle + "\">עומק<br>(מטר)</th>" +
    "<th style=\"" + thStyle + "\">שעת<br>דיגום</th>" +
    "<th style=\"" + thStyle + "\">כלי<br>דיגום</th>" +
    "<th style=\"" + thStyle + "\">מספר<br>אריזות</th>" +
    "<th style=\"" + thStyle + "\">סוג<br>דגימה</th>" +
    "<th style=\"" + thStyle + "\">TPH<br>GRO</th>" +
    "<th style=\"" + thStyle + "\">VOC</th>" +
    "<th style=\"" + thStyle + "\">SVOC</th>" +
    "<th style=\"" + thStyle + "\">PH</th>" +
    "<th style=\"" + thStyle + "\">PFAS</th>" +
    "<th style=\"" + thStyle + "\">6CR+</th>" +
    "<th style=\"" + thStyle + "\">ICP<br>מתכות</th>" +
    "<th style=\"" + thStyle + "\">TPH<br>D+O</th>" +
    "<th style=\"" + thStyle + "\">PID<br>(ppm)</th>" +
    "<th style=\"" + thStyle + "\">הערות</th>" +
    "</tr></thead>" +
    "<tbody>" + sampleRows + fillerRows + "</tbody></table>" +

    "<div style=\"background:#f5f5f5;border:0.5px solid #aaa;padding:4px 8px;margin-top:3px;font-size:6.8pt\">" +
    "<b>הצהרה:</b> טופס זה מתייחס רק לפריטים שנדגמו. &nbsp;" +
    "<b>סוג דגימה:</b> מ = מורכב &nbsp; ח = חטף" +
    (data.storageLocation ? " &nbsp;|&nbsp; <b>אחסון:</b> " + data.storageLocation + " אחראי: " + data.storageManager : "") +
    "</div>" +

    "<div style=\"display:flex;gap:6px;margin-top:4px\">" +
    "<div style=\"flex:1;border:0.5px solid #aaa;padding:5px 8px;background:#f0fff4;min-height:55px\">" +
    "<div style=\"font-weight:bold;color:#0d6626;font-size:8pt;margin-bottom:3px\">חתימת הדוגם</div>" +
    "<div style=\"font-size:7.5pt\">נמסר ע\"י: <b>" + (data.deliveredBy || "—") + "</b></div>" +
    "<div style=\"font-size:7.5pt\">תאריך: " + (data.deliveryDate || "—") + " שעה: " + (data.deliveryTime || "—") + "</div>" +
    samplerSig +
    "<div style=\"border-top:0.5px solid #ccc;margin-top:10px;font-size:6.5pt;color:#aaa\">חתימה</div></div>" +

    "<div style=\"flex:1;border:0.5px solid #aaa;padding:5px 8px;background:#f0f0ff;min-height:55px\">" +
    "<div style=\"font-weight:bold;color:#0d6626;font-size:8pt;margin-bottom:3px\">חתימת מקבל במעבדה</div>" +
    "<div style=\"font-size:7.5pt\">התקבל ע\"י: <b>" + (data.receivedBy || "_______________") + "</b></div>" +
    "<div style=\"font-size:7.5pt\">תאריך: " + (data.receivedDate || "___________") + " שעה: " + (data.receivedTime || "_______") + "</div>" +
    labSigHtml +
    "<div style=\"border-top:0.5px solid #ccc;margin-top:10px;font-size:6.5pt;color:#aaa\">חתימה</div></div></div>" +

    "<div style=\"background:#0d6626;color:#b2dfb2;padding:3px 8px;margin-top:4px;font-size:6.5pt;display:flex;justify-content:space-between\">" +
    "<span>נוצר: " + genAt + " · וזה אקולוגיה · טופס 33.1</span>" +
    "<span>*** סוף דו&quot;ח ***</span></div>" +
    "</body></html>";
}

export default function ChainOfCustodyForm({ user, fieldData, projectName, onBack, onDone }: Props) {
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
  const [cloudUploading, setCloudUploading] = useState(false);
  const [cloudUploaded, setCloudUploaded] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [emailError, setEmailError] = useState("");

  const set = (k: keyof ChainOfCustodyData, v: string | string[]) =>
    setData(d => ({ ...d, [k]: v }));

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

  const validateHeader = () => {
    const errs = REQUIRED_HEADER.filter(f => !data[f.key as keyof ChainOfCustodyData]).map(f => f.label);
    setHeaderErrors(errs);
    return errs.length === 0;
  };

  const validateSign = () => {
    const errs: string[] = [];
    if (!data.deliveredBy) errs.push("שם הממסר");
    setSignErrors(errs);
    return errs.length === 0;
  };

  const handleGeneratePdf = async () => {
    if (!validateSign()) return;
    setGenerating(true);
    setPdfError("");
    try {
      const html = buildPdfHtml(data, labSignature);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const dateStr = (data.date || "").replace(/-/g, "");
      const siteStr = (data.site || "טופס").replace(/\s+/g, "_");
      setPdfUrl(url);
      setPdfFilename("שרשרת_משמורת_" + siteStr + "_" + dateStr);
    } catch (e) {
      setPdfError("שגיאה ביצירת הטופס: " + (e instanceof Error ? e.message : String(e)));
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
      setTimeout(() => { try { printWindow.print(); } catch (_) {} }, 1000);
    }
  };

  const handleEmail = async () => {
    if (!pdfUrl) return;
    setEmailSending(true);
    setEmailSent(false);
    setEmailError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: customEmail,
          subject: "שרשרת משמורת · " + data.site + " · " + data.date,
          body: "אתר: " + data.site + "\nתאריך: " + data.date + "\nדוגם: " + data.samplerName + "\nדגימות: " + data.samples.filter(s => s.sendToLab).length,
          htmlUrl: pdfUrl,
          filename: pdfFilename,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
      } else {
        const dateStr = (data.date || "").replace(/-/g, "");
        const sub = encodeURIComponent("שרשרת משמורת · " + data.site + " · " + data.date);
        const bod = encodeURIComponent("אתר: " + data.site + "\nתאריך: " + data.date + "\nדוגם: " + data.samplerName);
        window.open("mailto:" + customEmail + "?subject=" + sub + "&body=" + bod);
        handleDownload();
        setEmailError("תוכנת המייל נפתחה — צרף את הקובץ שהורד");
      }
    } catch (e) {
      setEmailError("שגיאה: " + (e instanceof Error ? e.message : String(e)));
    }
    setEmailSending(false);
  };

  const handleCloudUpload = async () => {
    if (!pdfUrl) return;
    setCloudUploading(true);
    setCloudUploaded(false);
    setCloudError("");
    try {
      const htmlContent = await fetch(pdfUrl).then(r => r.text());
      const res = await fetch("/api/upload-dropbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent,
          filename: pdfFilename + ".html",
          projectName: projectName || data.site,
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
        <p className="text-green-300 text-sm">חוזר לדף הבית...</p>
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

        {step === "header" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-start gap-2">
              <span className="text-red-400 text-sm">*</span>
              <p className="text-red-500 text-xs">שדות המסומנים ב-<strong>*</strong> הם חובה</p>
            </div>

            <div className="card">
              <p className="section-title">פרטי הטופס</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="field-label">האתר <span className="text-red-500">*</span></label>
                  <input value={data.site} onChange={e => { set("site", e.target.value); setHeaderErrors(p => p.filter(x => x !== "שם האתר")); }}
                    className={!data.site && headerErrors.includes("שם האתר") ? "border-red-400 bg-red-50" : ""} placeholder="שם האתר" />
                  {!data.site && headerErrors.includes("שם האתר") && <RequiredNote label="שם האתר" />}
                </div>
                <div>
                  <label className="field-label">תאריך <span className="text-red-500">*</span></label>
                  <input type="date" value={data.date} onChange={e => set("date", e.target.value)} />
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
                <div className="col-span-2">
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
                    onChange={e => { set("samplerName", e.target.value); setHeaderErrors(p => p.filter(x => x !== "שם הדוגם")); }}
                    className={!data.samplerName && headerErrors.includes("שם הדוגם") ? "border-red-400 bg-red-50" : ""}
                  />
                  {!data.samplerName && headerErrors.includes("שם הדוגם") && <RequiredNote label="שם הדוגם" />}
                </div>
                <div>
                  <label className="field-label">מאשר הדו&quot;ח</label>
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
                  <label className="field-label">קידוח בוצע ע&quot;י קבלן משנה</label>
                  <CircleSelect options={["כן","לא"]} value={data.drilledBySubcontractor} onChange={v => set("drilledBySubcontractor", v)} />
                </div>
                <div>
                  <label className="field-label">דיגום בוצע ע&quot;י קבלן משנה</label>
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
                      data.tests.includes(t) ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-600 border-gray-200"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {headerErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium mb-1">⚠ חסרים שדות חובה:</p>
                <ul className="text-red-500 text-xs list-disc list-inside">
                  {headerErrors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}
            <button onClick={() => { if (validateHeader()) setStep("samples"); }} className="btn-primary w-full">
              המשך לבחירת דגימות ←
            </button>
          </div>
        )}

        {step === "samples" && (
          <div className="space-y-4">
            <div className="card">
              <p className="section-title">בחירת דגימות לשליחה למעבדה</p>
              {data.samples.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">אין דגימות מיומן השדה.</p>
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

        {step === "sign" && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-medium">1</div>
                <p className="section-title mb-0">חתימת הדוגם <span className="text-red-500">*</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">נמסר ע&quot;י <span className="text-red-500">*</span></label>
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
              <SignaturePad label="חתום/י עם העט או האצבע:" onChange={v => set("signature", v)} />
            </div>

            <div className="card border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">2</div>
                <p className="section-title mb-0 text-blue-800">חתימת מקבל במעבדה</p>
                <span className="text-xs text-gray-400">(אופציונלי)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">שם המקבל</label>
                  <input value={data.receivedBy} onChange={e => set("receivedBy", e.target.value)} />
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
              <SignaturePad label="חתימת מקבל הדגימות במעבדה:" onChange={setLabSignature} />
            </div>

            <div className="card bg-green-50 border-green-100">
              <p className="section-title text-green-800">סיכום</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>אתר: <strong>{data.site}</strong></p>
                <p>מעבדה: <strong>{labsArray.length > 0 ? labsArray.join(", ") : "—"}</strong></p>
                <p>דגימות לשליחה: <strong>{data.samples.filter(s => s.sendToLab).length}</strong></p>
                <p>בדיקות: <strong>{data.tests.join(", ") || "—"}</strong></p>
              </div>
            </div>

            {signErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium mb-1">⚠ חסרים שדות חובה:</p>
                <ul className="text-red-500 text-xs list-disc list-inside">
                  {signErrors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}

            {!pdfUrl ? (
              <>
                <button onClick={handleGeneratePdf} disabled={generating}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {generating ? <><span>⏳</span> מכין טופס...</> : <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    צור PDF
                  </>}
                </button>
                {pdfError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">⚠ {pdfError}</div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm font-medium mb-1">✓ הטופס מוכן</p>
                  <p className="text-green-600 text-xs">לחץ על הכפתור למטה ← בחלון שנפתח לחץ Ctrl+P ← שמור כ-PDF</p>
                </div>

                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  פתח והדפס / שמור PDF
                </button>

                <div className="card">
                  <p className="section-title">שלח למייל המשרד</p>
                  <div className="mb-3">
                    <label className="field-label">כתובת מייל</label>
                    <input type="email" value={customEmail} onChange={e => setCustomEmail(e.target.value)} />
                  </div>
                  {emailSent && <p className="text-green-600 text-xs mb-2">✓ המייל נשלח בהצלחה!</p>}
                  {emailError && <p className="text-amber-600 text-xs mb-2">{emailError}</p>}
                  <button onClick={handleEmail} disabled={emailSending}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                    {emailSending ? <><span>⏳</span> שולח...</> : <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      שלח במייל
                    </>}
                  </button>
                </div>

                <div className="card">
                  <p className="section-title">שמירה אוטומטית בענן</p>
                  {cloudUploaded && (
                    <p className="text-green-600 text-xs mb-2">✓ הקובץ נשמר בענן בהצלחה! נתיב: {data.site}/{data.date}</p>
                  )}
                  {cloudError && (
                    <p className="text-amber-600 text-xs mb-2">{cloudError}</p>
                  )}
                  <button onClick={handleCloudUpload} disabled={cloudUploading}
                    className="w-full flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">
                    {cloudUploading ? <><span>⏳</span> מעלה לענן...</> : <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      שמור בענן (Dropbox)
                    </>}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">ישמר בנתיב: {data.site || "פרויקט"}/{data.date}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep("samples")} className="btn-secondary flex-1">← חזרה</button>
                  <button onClick={handleDone} className="btn-primary flex-1">✓ סיים</button>
                </div>
              </div>
            )}

            {!pdfUrl && (
              <button onClick={() => setStep("samples")} className="btn-secondary w-full">← חזרה</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
