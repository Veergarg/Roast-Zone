import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoastZone — Get Roasted by AI",
  description: "Get brutally roasted by AI. GitHub profiles or personal roasts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}