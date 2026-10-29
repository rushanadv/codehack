'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, ArrowUpRight, Compass } from 'lucide-react';
import CoreParadoxSection from '@/components/CoreParadoxSection';
import ResourceTaxonomySection from '@/components/ResourceTaxonomySection';
import LifecycleOrchestrationSection from '@/components/LifecycleOrchestrationSection';
import IntentIntelligenceSection from '@/components/IntentIntelligenceSection';
import PromiseProtectionSection from '@/components/PromiseProtectionSection';
import ArchitecturalPillarsSection from '@/components/ArchitecturalPillarsSection';

export default function OverviewPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0706] text-[#F1E7DE] selection:bg-[#D4FF00] selection:text-black">
      
      {/* Editorial Overview Header & Back Navigation */}
      <div className="sticky top-0 z-30 bg-[#0F0A08]/95 backdrop-blur-md border-b border-[#AD7257]/30 px-6 sm:px-12 py-4 flex items-center justify-between font-mono text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#A99A90] hover:text-[#D4FF00] uppercase tracking-wider transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D4FF00]" />
          <span>RETURN TO 3D ROTOR</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-[#A99A90] text-[11px] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-[#D4FF00]" />
          <span>FULL ARCHITECTURAL MANIFEST</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#17110E] hover:bg-[#241712] border border-[#AD7257]/30 text-[#F1E7DE] transition-colors uppercase text-[11px]"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Marketplace</span>
          </Link>
          <Link
            href="/match"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold transition-colors uppercase text-[11px]"
          >
            <span>Intent Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. SECTION 01: THE CORE PARADOX */}
      <div id="narrative-section">
        <CoreParadoxSection />
      </div>

      {/* 2. SECTION 02: THE IDLEX RESOURCE UNIVERSE */}
      <ResourceTaxonomySection />

      {/* 3. SECTION 03: HOW IDLEX WORKS */}
      <LifecycleOrchestrationSection />

      {/* 4. SECTION 04: INTENT INTELLIGENCE */}
      <IntentIntelligenceSection />

      {/* 5. SECTION 05: REAL-TIME FAILURE MITIGATION */}
      <PromiseProtectionSection />

      {/* 6. SECTION 06: ARCHITECTURAL PILLARS */}
      <ArchitecturalPillarsSection />

      {/* 7. SECTION G: FINAL MONUMENTAL GRAPHIC CALL TO ACTION */}
      <section className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-[#180F0C] via-[#21120D] to-[#0A0706] text-center relative z-10 border-t-2 border-[#AD7257]/40">
        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-black bg-[#D4FF00] px-4 py-1.5 rounded-sm font-bold border border-[#D4FF00]"
          >
            <span className="w-2 h-2 bg-black" />
            IDLEX ARCHITECTURE • PRODUCTION READY
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#F1E7DE] tracking-tight leading-[0.92]"
          >
            NOTHING VALUABLE <br />
            <span className="text-[#D4FF00] bg-[#1A120E] px-4 py-1 inline-block mt-2 border-2 border-[#D4FF00]">
              SHOULD SIT IDLE.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-xl text-[#E6D7CB] max-w-2xl mx-auto leading-relaxed font-light"
          >
            Make existing capital assets work harder. Discover verified capacity across precision equipment, controlled spaces, and dedicated accelerated compute.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs uppercase tracking-wider"
          >
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-8 py-4 rounded-md font-bold transition-all border border-[#D4FF00] active:translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>

            <Link
              href="/match"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#B53F1E] hover:bg-[#C84725] text-white px-8 py-4 rounded-md font-bold border border-[#E25822] transition-all active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Launch Match Engine</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1C1411] hover:bg-[#2A1E19] text-[#F1E7DE] px-6 py-4 rounded-md border border-[#AD7257]/40 transition-all active:translate-y-0.5"
            >
              <span>Open Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D4FF00]" />
            </Link>
          </motion.div>

          {/* Micro-telemetry footer ribbon */}
          <div className="pt-12 border-t border-[#AD7257]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] text-[#A99A90] uppercase tracking-wider">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#D4FF00]" />
              <span>ACID SERIALIZABLE COMMITS</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#D95927]" />
              <span>SKILLGATE VERIFIED CUSTODY</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-emerald-400" />
              <span>PROMISE PROTECTION RE-ROUTING</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

