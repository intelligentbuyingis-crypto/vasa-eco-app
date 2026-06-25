import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "וזה אקולוגיה – מערכת דיגום שדה",
  description: "מערכת דיגיטלית לדיגום קרקע",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1a3a2a" />
      </head>
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
