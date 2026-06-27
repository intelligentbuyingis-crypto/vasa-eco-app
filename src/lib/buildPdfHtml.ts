import type { ChainOfCustodyData } from "@/types/forms";

const LAB_TESTS_ORDER = [
  "TPH GRO", "VOC", "SVOC", "PH", "PFAS", "CR+6", "ICP מתכות", "TPH D+O"
];

export function buildChainHtml(
  data: ChainOfCustodyData,
  labSignature?: string
): string {
  const sendSamples = data.samples.filter(s => s.sendToLab);
  const labsLabel = data.lab
    ? data.lab.split(",").filter(Boolean).join(", ")
    : "—";

  // Build sample rows
  const sampleRows = sendSamples.map((s, i) => {
    const bg = i % 2 === 0 ? "#ffffff" : "#f8f8f8";
    const testCells = LAB_TESTS_ORDER.map(t => {
      const key = t === "CR+6" ? "CR+6" : t;
      const checked = data.tests.includes(key) || data.tests.includes(t);
      return `<td>${checked ? '<span class="check">✓</span>' : ""}</td>`;
    }).join("");

    return `
    <tr style="background:${bg}">
      <td>${s.sampleNum || `${s.drillNum}-${i + 1}`}</td>
      <td>${s.depth ? s.depth + "מ'" : ""}</td>
      <td>${s.time || ""}</td>
      <td>${s.notes || ""}</td>
      <td></td>
      <td></td>
      ${testCells}
      <td>${s.pid || ""}</td>
      <td></td>
    </tr>`;
  }).join("");

  // Empty filler rows (min 10 rows total)
  const fillerCount = Math.max(0, 10 - sendSamples.length);
  const fillerRows = Array.from({ length: fillerCount }, (_, i) => {
    const bg = (sendSamples.length + i) % 2 === 0 ? "#ffffff" : "#f8f8f8";
    return `<tr style="background:${bg}; height:15px">
      <td></td><td></td><td></td><td></td><td></td><td></td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
      <td></td><td></td>
    </tr>`;
  }).join("");

  const generatedAt = new Date().toLocaleString("he-IL");

  // Sampler signature image or placeholder
  const samplerSigHtml = data.signature
    ? `<img src="${data.signature}" style="max-width:100%;max-height:35px;display:block;" />`
    : `<div style="color:#bbb;font-size:7pt;margin-top:8px;">חתימה לא צורפה</div>`;

  const labSigHtml = labSignature
    ? `<img src="${labSignature}" style="max-width:100%;max-height:35px;display:block;" />`
    : `<div style="color:#bbb;font-size:7pt;margin-top:8px;">ימולא עם קבלה במעבדה</div>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 8pt; padding: 8px; background: white; color: #111; }

  /* Header */
  .header { background: #0d6626; color: white; display: flex; align-items: stretch; margin-bottom: 3px; }
  .logo-box { background: white; color: #0d6626; padding: 5px 8px; min-width: 85px; display:flex; flex-direction:column; justify-content:center; }
  .logo-main { font-size: 16pt; font-weight: bold; line-height: 1; }
  .logo-sub  { font-size: 9pt; font-weight: bold; }
  .title-area { flex: 1; text-align: center; padding: 6px 0; }
  .title-area h1 { font-size: 15pt; font-weight: bold; }
  .title-area h2 { font-size: 10pt; font-weight: normal; margin-top: 3px; }
  .meta-area { font-size: 6.5pt; padding: 5px 8px; text-align: left; opacity: 0.85; display:flex; flex-direction:column; justify-content:center; }

  /* Info tables */
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
  .info-table td { border: 0.5px solid #999; padding: 2px 5px; vertical-align: top; }
  .field-label { font-size: 6.5pt; color: #666; display: block; }
  .field-val   { font-weight: bold; font-size: 8.5pt; }

  /* Declarations */
  .decl-bar { background: #f0f0f0; border: 0.5px solid #aaa; padding: 3px 6px; margin-bottom: 2px; font-size: 7.5pt; }

  /* Section title */
  .section-title { background: #0d6626; color: white; padding: 4px 8px; font-weight: bold; font-size: 9pt; }

  /* Samples table */
  .samples-table { width: 100%; border-collapse: collapse; }
  .samples-table th {
    background: #c8e6c9; color: #0d5520; border: 0.5px solid #999;
    padding: 2px 1px; text-align: center; font-size: 6.2pt; font-weight: bold;
    line-height: 1.2;
  }
  .samples-table td { border: 0.5px solid #ccc; padding: 1px 2px; text-align: center; font-size: 7pt; }
  .check { color: #0d6626; font-weight: bold; font-size: 10pt; line-height: 1; }

  /* Notes */
  .note-box { background: #f5f5f5; border: 0.5px solid #aaa; padding: 4px 8px; margin-top: 3px; font-size: 6.8pt; line-height: 1.5; }

  /* Signatures */
  .sig-row { display: flex; gap: 6px; margin-top: 4px; }
  .sig-box { flex: 1; border: 0.5px solid #aaa; padding: 5px 8px; min-height: 55px; }
  .sig-box.sampler { background: #f0fff4; }
  .sig-box.lab     { background: #f0f0ff; }
  .sig-title { font-weight: bold; color: #0d6626; font-size: 8pt; margin-bottom: 3px; }
  .sig-line  { border-top: 0.5px solid #ccc; margin-top: 14px; padding-top: 2px; font-size: 6.5pt; color: #aaa; }

  /* Footer */
  .footer { background: #0d6626; color: #b2dfb2; padding: 3px 8px; margin-top: 4px; font-size: 6.5pt; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="logo-box">
    <div class="logo-main">וזה</div>
    <div class="logo-sub">אקולוגיה</div>
  </div>
  <div class="title-area">
    <h1>וזה אקולוגיה בע"מ</h1>
    <h2>הנושא: טופס משמורת לדיגום קרקע</h2>
  </div>
  <div class="meta-area">
    מהדורה: 20<br>
    תוקף: 10.03.2026<br>
    טופס מס': 33.1<br>
    דף 1 מתוך 1
  </div>
</div>

<!-- INFO ROW 1 -->
<table class="info-table">
  <tr>
    <td style="width:30%"><span class="field-label">האתר:</span><span class="field-val">${data.site || "—"}</span></td>
    <td style="width:18%"><span class="field-label">תאריך:</span><span class="field-val">${data.date || "—"}</span></td>
    <td style="width:28%"><span class="field-label">מעבדה:</span><span class="field-val">${labsLabel}</span></td>
    <td style="width:24%"><span class="field-label">לחייב:</span><span class="field-val">${data.billedTo || "—"}</span></td>
  </tr>
  <tr>
    <td><span class="field-label">כתובת:</span><span class="field-val">${data.address || "—"}</span></td>
    <td><span class="field-label">מזג האוויר:</span><span class="field-val">${data.weather || "—"}</span></td>
    <td><span class="field-label">יעוד הקרקע:</span><span class="field-val">${data.landUse || "—"}</span></td>
    <td><span class="field-label">מפלס מי תהום (משוער):</span><span class="field-val">${data.groundwaterLevel || "—"}</span></td>
  </tr>
  <tr>
    <td><span class="field-label">שם הדוגם:</span><span class="field-val">${data.samplerName || "—"}</span></td>
    <td><span class="field-label">מאשר הדו"ח:</span><span class="field-val">${data.reportApprover || "—"}</span></td>
    <td><span class="field-label">לקוח:</span><span class="field-val">${data.clientName || "—"}</span></td>
    <td><span class="field-label">איש קשר / PID:</span><span class="field-val">${data.contactPerson || "—"} / ${data.pid || "—"}</span></td>
  </tr>
</table>

<!-- DECLARATIONS -->
<div class="decl-bar">
  קידוח ע"י קבלן משנה: <strong>${data.drilledBySubcontractor || "—"}</strong>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  דיגום ע"י קבלן משנה: <strong>${data.sampledBySubcontractor || "—"}</strong>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  חריגות: <strong>${data.deviations || "—"}</strong>
</div>

<!-- TABLE TITLE -->
<div class="section-title">טופס משמורת לדיגום קרקע ודרישת בדיקות</div>

<!-- SAMPLES TABLE -->
<table class="samples-table">
  <thead>
    <tr>
      <th style="width:9%">זיהוי דגימה</th>
      <th style="width:6%">עומק<br>(מטר)</th>
      <th style="width:6%">שעת<br>דיגום</th>
      <th style="width:8%">כלי<br>דיגום</th>
      <th style="width:5%">מספר<br>אריזות</th>
      <th style="width:5%">סוג<br>דגימה</th>
      <th style="width:5%">TPH<br>GRO</th>
      <th style="width:4%">VOC</th>
      <th style="width:5%">SVOC</th>
      <th style="width:4%">PH</th>
      <th style="width:5%">PFAS</th>
      <th style="width:5%">6CR+</th>
      <th style="width:6%">ICP<br>מתכות</th>
      <th style="width:6%">TPH<br>D+O</th>
      <th style="width:6%">PID<br>(ppm)</th>
      <th style="width:9%">הערות</th>
    </tr>
  </thead>
  <tbody>
    ${sampleRows}
    ${fillerRows}
  </tbody>
</table>

<!-- NOTES -->
<div class="note-box">
  <strong>הצהרה:</strong> טופס זה מתייחס רק לפריטים שנדגמו.
  &nbsp;&nbsp;<strong>סוג דגימה:</strong> מ = מורכב &nbsp; ח = חטף
  &nbsp;&nbsp; קידוח ע"י קבלן משנה: כן / לא
  &nbsp;&nbsp; דיגום ע"י קבלן משנה: כן / לא
  &nbsp;&nbsp; חריגות: אין / יש
  <br>
  ${data.storageLocation ? `<strong>אחסון:</strong> ${data.storageLocation} | אחראי: ${data.storageManager} | תנאים: ${data.storageCondition}` : ""}
</div>

<!-- SIGNATURES -->
<div class="sig-row">
  <div class="sig-box sampler">
    <div class="sig-title">חתימת הדוגם</div>
    <div style="font-size:7.5pt">נמסר ע"י: <strong>${data.deliveredBy || "—"}</strong></div>
    <div style="font-size:7.5pt">תאריך: ${data.deliveryDate || "—"} &nbsp; שעה: ${data.deliveryTime || "—"}</div>
    ${samplerSigHtml}
    <div class="sig-line">חתימה</div>
  </div>
  <div class="sig-box lab">
    <div class="sig-title">חתימת מקבל במעבדה</div>
    <div style="font-size:7.5pt">התקבל ע"י: <strong>${data.receivedBy || "_______________"}</strong></div>
    <div style="font-size:7.5pt">תאריך: ${data.receivedDate || "___________"} &nbsp; שעה: ${data.receivedTime || "_______"}</div>
    ${labSigHtml}
    <div class="sig-line">חתימה</div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <span>נוצר: ${generatedAt} · וזה אקולוגיה · טופס 33.1</span>
  <span>*** סוף דו"ח ***</span>
</div>

</body>
</html>`;
}
