import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { DemoBar } from "@/components/DemoBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Slotly — Bloom: A Living Resource Exchange",
  description: "Nature, sculpted through technology. High-integrity shared access to precision facilities, advanced hardware, and accelerated compute with Slotly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-[#0B1510] text-[#F1F0E5] selection:bg-[#82996D] selection:text-[#0B1510]">
        <Suspense fallback={null}>
          <DemoBar />
        </Suspense>
        <Suspense fallback={<div className="h-14 bg-[#101D15]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">
          <Suspense fallback={<div className="py-20 text-center font-mono text-xs text-[#B7C2B1]">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
