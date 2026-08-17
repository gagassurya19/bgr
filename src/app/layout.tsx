import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoGuideFab } from "@/components/auth/demo-guide-fab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BGR - Business Group Referral",
  description: "Sistem referral internal untuk jaringan LAN kantor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        {children}
        <DemoGuideFab />
      </body>
    </html>
  );
}
