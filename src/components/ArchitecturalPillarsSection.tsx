'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { QrCode, ShieldCheck, TrendingUp, Check, Lock, Cpu, Sparkles } from 'lucide-react';

export default function ArchitecturalPillarsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="architectural-pillars"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0A0706] relative z-10"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A120E] border border-[#AD7257]/40 rounded-sm font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00] mb-4">
              <span className="w-2 h-2 bg-[#D4FF00]" />
              <span>06 / Architectural Pillars</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-3">
              Engineered for Zero Operational Fragility
            </h2>
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
              Three immutable principles baked into the transaction engine. Every checkout, operator clearance, and queue position is mathematically verifiable.
            </p>
          </motion.div>
        </div>

        {/* 3 Pillars Grid (Solid Hue Engineered Panels) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pillar 1: Resource Passport */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-xl overflow-hidden border-2 border-[#D4FF00]/50 bg-[#130E0C] flex flex-col justify-between"
          >
            {/* Solid Header Band */}
            <div className="bg-[#D4FF00] text-black px-6 py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-black" />
                <span>PILLAR 01 // CUSTODY RECORD</span>
              </div>
              <span className="bg-black text-[#D4FF00] px-2 py-0.5 rounded text-[10px]">
                IMMUTABLE
              </span>
            </div>

            <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-1 tracking-tight">
                  Resource Passport™
                </h3>
                
                <div className="text-xs font-mono text-[#D95927] uppercase tracking-wider mb-4 font-semibold">
                  Physical Custody Chain Verification
                </div>
                
                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Persistent cryptographic identity with scannable QR code resolving to asset maintenance logs, checkout condition checklists, and verified custody history.
                </p>

                {/* Simulated Ledger Entry */}
                <div className="p-4 rounded-lg bg-[#1C1411] border border-[#AD7257]/30 font-mono text-[11px] space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[#A99A90] pb-2 border-b border-[#AD7257]/20">
                    <span className="text-[#F1E7DE] font-bold">PASSPORT ID: #PAS-9481</span>
                    <span className="text-[#D4FF00] font-bold">VERIFIED</span>
                  </div>
                  <div className="text-[#D9C5B4] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400" />
                    <span>2026-10-24: Laser Diode Recalibration [OK]</span>
                  </div>
                  <div className="text-[#D9C5B4] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400" />
                    <span>2026-10-27: Return Sign-off by Lab Head [OK]</span>
                  </div>
                  <div className="text-[#A99A90] text-[10px] pt-1.5 border-t border-[#AD7257]/20 flex items-center justify-between">
                    <span>SHA-256: 7f8a...3b9e</span>
                    <span className="text-emerald-400 font-bold">(Uncompromised)</span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>AUDIT RECORD</span>
                <span className="text-[#D4FF00] font-bold">CRYPTOGRAPHIC TRACE</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2: SkillGate Safety */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="rounded-xl overflow-hidden border-2 border-[#D95927]/60 bg-[#130E0C] flex flex-col justify-between"
          >
            {/* Solid Header Band */}
            <div className="bg-[#B53F1E] text-white px-6 py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>PILLAR 02 // ACCESS GATING</span>
              </div>
              <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">
                SERVER ENFORCED
              </span>
            </div>

            <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-1 tracking-tight">
                  SkillGate™ Protocol
                </h3>

                <div className="text-xs font-mono text-[#D95927] uppercase tracking-wider mb-4 font-semibold">
                  Hardware-Enforced Operator Safety
                </div>

                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Mandatory qualification gatekeeper. Restricted laser, chemical, or cleanroom assets reject reservations on the server unless verified training records exist.
                </p>

                {/* Simulated Verification Pipeline */}
                <div className="p-4 rounded-lg bg-[#1C1411] border border-[#AD7257]/30 font-mono text-[11px] space-y-2 mb-6">
                  <div className="flex items-center justify-between text-emerald-400 pb-2 border-b border-[#AD7257]/20">
                    <span>ISO Class 5 Cleanroom Gowning</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 pb-2 border-b border-[#AD7257]/20">
                    <span>Class IV High-Power Laser Safety</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <span>Cryogenic Liquid N2 Handling</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/40 font-bold">
                      Required
                    </span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>AUTHORIZATION</span>
                <span className="text-[#D95927] font-bold">ZERO-TRUST CHECK</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 3: FairShare Queuing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-xl overflow-hidden border-2 border-[#D97706]/60 bg-[#130E0C] flex flex-col justify-between"
          >
            {/* Solid Header Band */}
            <div className="bg-[#D97706] text-black px-6 py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-black" />
                <span>PILLAR 03 // QUEUE SCHEDULER</span>
              </div>
              <span className="bg-black text-[#D97706] px-2 py-0.5 rounded text-[10px]">
                ANTI-HOARDING
              </span>
            </div>

            <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-1 tracking-tight">
                  FairShare™ Queuing
                </h3>

                <div className="text-xs font-mono text-[#D97706] uppercase tracking-wider mb-4 font-semibold">
                  Non-Monopolizing Priority Allocation
                </div>

                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Deterministic allocation scoring when resources are congested. Prevents hoarding, accounts for thesis deadlines, and provides clear waitlist visibility.
                </p>

                {/* Simulated Priority Allocation Bar */}
                <div className="p-4 rounded-lg bg-[#1C1411] border border-[#AD7257]/30 font-mono text-[11px] space-y-3 mb-6">
                  <div className="flex justify-between items-center text-[#A99A90]">
                    <span>Quota Consumption Meter:</span>
                    <span className="text-[#D4FF00] font-bold">18 / 40 hrs</span>
                  </div>

                  {/* 10 Solid LED segment meters */}
                  <div className="grid grid-cols-10 gap-1 h-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className={`h-full rounded-xs ${
                          bar <= 5
                            ? 'bg-[#D97706]'
                            : 'bg-[#291B14]'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-[#A99A90] pt-1 border-t border-[#AD7257]/20">
                    <span>Thesis Priority Multiplier:</span>
                    <span className="text-emerald-400 font-bold">1.4x Active</span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>SCHEDULER SLA</span>
                <span className="text-[#D97706] font-bold">FAIR-ACCESS GUARANTEE</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
