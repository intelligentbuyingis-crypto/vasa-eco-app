"use client";
import type { ChainOfCustodyData } from "@/types/forms";
import { buildChainHtml } from "./buildPdfHtml";

export async function generateAndDownloadPdf(
  data: ChainOfCustodyData,
  labSignature?: string
): Promise<void> {
  const html = buildChainHtml(data, labSignature);

  // Open in new window and trigger print dialog (Save as PDF)
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("הדפדפן חסם פתיחת חלון חדש. אנא אפשר popups לאתר זה.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Fallback if onload already fired
  setTimeout(() => {
    try { printWindow.print(); } catch (_) {}
  }, 1000);
}

export async function generatePdfBlob(
  data: ChainOfCustodyData,
  labSignature?: string
): Promise<{ url: string; filename: string }> {
  const html = buildChainHtml(data, labSignature);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const date = (data.date || "").replace(/-/g, "");
  const site = (data.site || "טופס").replace(/\s+/g, "_");
  const filename = `שרשרת_משמורת_${site}_${date}`;
  return { url, filename };
}
