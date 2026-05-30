import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "درّة | المستودع", template: "%s | درّة" },
  description: "بوابة المستودع — منصة درّة",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#064E3B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#0A1628" }}>{children}</body>
    </html>
  );
}
