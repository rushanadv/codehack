import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DemoBar } from "@/components/DemoBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IdleX — The Intelligent Resource Exchange",
  description: "Every idle resource has a purpose. High-precision equipment, specialized facilities, and compute allocation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07090C] text-[#F4F4F0]">
        <Suspense fallback={<div className="h-8 bg-[#090B0E]"></div>}>
          <DemoBar />
        </Suspense>
        <Suspense fallback={<div className="h-14 bg-[#07090C]"></div>}>
          <Navbar />
        </Suspense>
        <main className="flex-1">
          <Suspense fallback={<div className="py-20 text-center font-mono text-xs text-neutral-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
