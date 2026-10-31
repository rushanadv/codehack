import { Suspense } from "react";
import type { Metadata } from "next";
import { Fraunces, Albert_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoBar } from "@/components/DemoBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slotly — Bloom: A Living Resource Exchange",
  description: "Nature, sculpted through technology. High-integrity shared access to precision facilities, advanced hardware, and accelerated compute with Slotly.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Slotly — Bloom: A Living Resource Exchange",
    description: "Nature, sculpted through technology. High-integrity shared access to precision facilities, advanced hardware, and accelerated compute with Slotly.",
    url: "https://codehack-self.vercel.app/",
    siteName: "Slotly",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slotly — Bloom: A Living Resource Exchange",
    description: "Nature, sculpted through technology. High-integrity shared access to precision facilities, advanced hardware, and accelerated compute with Slotly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark ${fraunces.variable} ${albertSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#0B1510] text-[#F1F0E5] font-sans selection:bg-[#82996D] selection:text-[#0B1510]">
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
