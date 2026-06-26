import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import type { ChainOfCustodyData } from "@/types/forms";

const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.5, 0.5, 0.5);
const GREEN = rgb(0.18, 0.45, 0.27);
const LIGHT_GRAY = rgb(0.95, 0.95, 0.95);
const RED = rgb(0.8, 0.1, 0.1);

function drawText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size = 10, color = BLACK) {
  if (!text) return;
  page.drawText(text, { x, y, size, font, color });
}

function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number, thickness = 0.5, color = GRAY) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
}

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, fill = LIGHT_GRAY, border = GRAY) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill, borderColor: border, borderWidth: 0.5 });
}

function drawField(page: PDFPage, label: string, value: string, x: number, y: number, w: number, font: PDFFont, boldFont: PDFFont) {
  drawText(page, label + ":", x, y, font, 8, GRAY);
  drawText(page, value || "—", x, y - 13, boldFont, 9, BLACK);
  drawLine(page, x, y - 15, x + w, y - 15);
}

export async function generateChainPdf(data: ChainOfCustodyData, labSignature?: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 30;
  const M = 35; // margin

  // ── Header bar ──
  drawRect(page, M, y - 30, width - M * 2, 38, GREEN, GREEN);
  drawText(page, "CHAIN OF CUSTODY / שרשרת משמורת", M + 10, y - 10, bold, 14, rgb(1, 1, 1));
  drawText(page, "טופס 33.1", width - M - 60, y - 10, font, 10, rgb(0.8, 1, 0.8));
  drawText(page, "וזה אקולוגיה", M + 10, y - 22, font, 9, rgb(0.8, 1, 0.8));
  y -= 48;

  // ── Row 1: Site, Date, Lab ──
  drawField(page, "האתר", data.site, M, y, 180, font, bold);
  drawField(page, "תאריך", data.date, M + 200, y, 120, font, bold);
  const labsLabel = data.lab ? data.lab.split(",").join(", ") : "—";
  drawField(page, "מעבדה", labsLabel, M + 340, y, 180, font, bold);
  y -= 35;

  // ── Row 2: Address, Weather, Land use ──
  drawField(page, "כתובת", data.address, M, y, 180, font, bold);
  drawField(page, "מזג אוויר", data.weather, M + 200, y, 120, font, bold);
  drawField(page, "יעוד הקרקע", data.landUse, M + 340, y, 180, font, bold);
  y -= 35;

  // ── Row 3: People ──
  drawField(page, "שם הדוגם", data.samplerName, M, y, 150, font, bold);
  drawField(page, "מאשר הדו\"ח", data.reportApprover, M + 170, y, 150, font, bold);
  drawField(page, "לקוח", data.clientName, M + 340, y, 180, font, bold);
  y -= 35;

  // ── Row 4: PID, Groundwater, Contact ──
  drawField(page, "PID", data.pid, M, y, 80, font, bold);
  drawField(page, "מפלס מי תהום", data.groundwaterLevel, M + 100, y, 100, font, bold);
  drawField(page, "איש קשר", data.contactPerson, M + 220, y, 130, font, bold);
  drawField(page, "לחייב", data.billedTo, M + 370, y, 150, font, bold);
  y -= 35;

  // ── Declarations ──
  drawRect(page, M, y - 6, width - M * 2, 22, LIGHT_GRAY, GRAY);
  drawText(page, "הצהרות", M + 5, y + 6, bold, 9, GREEN);
  const decls = [
    `קידוח ע"י קבלן: ${data.drilledBySubcontractor || "—"}`,
    `דיגום ע"י קבלן: ${data.sampledBySubcontractor || "—"}`,
    `חריגות: ${data.deviations || "—"}`,
  ];
  decls.forEach((d, i) => drawText(page, d, M + 90 + i * 150, y + 6, font, 8, BLACK));
  y -= 30;

  // ── Tests required ──
  drawRect(page, M, y - 6, width - M * 2, 22, LIGHT_GRAY, GRAY);
  drawText(page, "בדיקות נדרשות:", M + 5, y + 6, bold, 9, GREEN);
  const testsStr = data.tests.length > 0 ? data.tests.join("  |  ") : "לא נבחרו בדיקות";
  drawText(page, testsStr, M + 90, y + 6, font, 8, data.tests.length > 0 ? BLACK : RED);
  y -= 30;

  // ── Samples table ──
  const sendSamples = data.samples.filter(s => s.sendToLab);
  drawRect(page, M, y - 4, width - M * 2, 18, GREEN, GREEN);
  drawText(page, `טבלת דגימות  (${sendSamples.length} דגימות לשליחה)`, M + 5, y + 5, bold, 9, rgb(1, 1, 1));
  y -= 22;

  // Table header
  const cols = [
    { label: "זיהוי דגימה", w: 80 },
    { label: "קידוח", w: 55 },
    { label: "עומק", w: 45 },
    { label: "שעה", w: 45 },
    { label: "כלי דיגום", w: 65 },
    { label: "סוג קרקע", w: 65 },
    { label: "PID", w: 40 },
    { label: "הערות", w: 80 },
  ];
  let tx = M;
  drawRect(page, M, y - 14, width - M * 2, 18, rgb(0.88, 0.94, 0.90), GRAY);
  cols.forEach(col => {
    drawText(page, col.label, tx + 2, y - 8, bold, 7.5, GREEN);
    tx += col.w;
  });
  y -= 18;

  // Table rows
  sendSamples.forEach((s, i) => {
    const bg = i % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.97, 0.97);
    drawRect(page, M, y - 12, width - M * 2, 16, bg, rgb(0.85, 0.85, 0.85));
    const vals = [s.sampleNum, s.drillNum, s.depth ? s.depth + "מ'" : "", s.time, s.notes, s.soilType, s.pid, ""];
    tx = M;
    vals.forEach((v, ci) => {
      drawText(page, v ?? "", tx + 2, y - 8, font, 7.5, BLACK);
      tx += cols[ci].w;
    });
    y -= 16;
    if (y < 200) y = 200; // prevent overflow (multi-page left for future)
  });

  if (sendSamples.length === 0) {
    drawText(page, "לא נבחרו דגימות לשליחה", M + 5, y - 8, font, 9, RED);
    y -= 20;
  }

  y -= 10;
  drawLine(page, M, y, width - M, y, 0.5);
  y -= 20;

  // ── Storage ──
  if (data.storageLocation || data.storageManager) {
    drawRect(page, M, y - 6, width - M * 2, 22, LIGHT_GRAY, GRAY);
    drawText(page, "אחסון:", M + 5, y + 6, bold, 9, GREEN);
    drawText(page, `מיקום: ${data.storageLocation}  |  אחראי: ${data.storageManager}  |  תנאים: ${data.storageCondition}`, M + 60, y + 6, font, 8, BLACK);
    y -= 30;
  }

  // ── Delivery section ──
  drawRect(page, M, y - 4, width - M * 2, 18, LIGHT_GRAY, GRAY);
  drawText(page, "מסירה", M + 5, y + 5, bold, 9, GREEN);
  y -= 22;
  drawField(page, "נמסר ע\"י", data.deliveredBy, M, y, 150, font, bold);
  drawField(page, "תאריך", data.deliveryDate, M + 170, y, 80, font, bold);
  drawField(page, "שעה", data.deliveryTime, M + 260, y, 60, font, bold);
  drawField(page, "התקבל ע\"י", data.receivedBy, M + 340, y, 180, font, bold);
  y -= 38;

  // ── Signatures ──
  const sigBoxH = 70;
  const sigBoxW = (width - M * 2 - 20) / 2;

  // Sampler signature box
  drawRect(page, M, y - sigBoxH, sigBoxW, sigBoxH, rgb(0.98, 0.99, 0.98), GRAY);
  drawText(page, "חתימת הדוגם", M + 5, y - 8, bold, 9, GREEN);

  if (data.signature && data.signature.startsWith("data:image")) {
    try {
      const imgBytes = await fetch(data.signature).then(r => r.arrayBuffer());
      const img = await pdfDoc.embedPng(new Uint8Array(imgBytes));
      page.drawImage(img, { x: M + 5, y: y - sigBoxH + 5, width: sigBoxW - 10, height: sigBoxH - 20 });
    } catch (_) { /* skip if can't embed */ }
  } else {
    drawText(page, "חתימה לא צורפה", M + sigBoxW / 2 - 30, y - sigBoxH / 2, font, 8, GRAY);
  }
  drawLine(page, M + 5, y - sigBoxH + 18, M + sigBoxW - 10, y - sigBoxH + 18, 0.5, GRAY);

  // Lab receiver signature box
  const lx = M + sigBoxW + 20;
  drawRect(page, lx, y - sigBoxH, sigBoxW, sigBoxH, rgb(0.98, 0.98, 1.0), GRAY);
  drawText(page, "חתימת מקבל במעבדה", lx + 5, y - 8, bold, 9, GREEN);

  if (labSignature && labSignature.startsWith("data:image")) {
    try {
      const imgBytes = await fetch(labSignature).then(r => r.arrayBuffer());
      const img = await pdfDoc.embedPng(new Uint8Array(imgBytes));
      page.drawImage(img, { x: lx + 5, y: y - sigBoxH + 5, width: sigBoxW - 10, height: sigBoxH - 20 });
    } catch (_) { /* skip */ }
  } else {
    drawText(page, "ימולא עם קבלה במעבדה", lx + sigBoxW / 2 - 40, y - sigBoxH / 2, font, 8, GRAY);
  }
  drawLine(page, lx + 5, y - sigBoxH + 18, lx + sigBoxW - 10, y - sigBoxH + 18, 0.5, GRAY);

  y -= sigBoxH + 15;

  // ── Footer ──
  drawLine(page, M, y, width - M, y, 0.5, GRAY);
  const generatedAt = new Date().toLocaleString("he-IL");
  drawText(page, `נוצר ב-${generatedAt} · וזה אקולוגיה · מערכת דיגום שדה v1.0`, M, y - 12, font, 7, GRAY);

  return pdfDoc.save();
}
