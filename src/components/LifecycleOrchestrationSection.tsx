'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight,
  Search,
  Sliders,
  Lock,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';

interface Step {
  num: string;
  title: string;
  tagline: string;
  desc: string;
  pill: string;
  mechanism: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  stateBadge: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Discover',
    tagline: 'Multi-Institutional Telemetry',
    desc: 'Scan distributed inventories across engineering bays, quantum spectroscopy chambers, and supercomputing clusters in real-time.',
    pill: 'Real-Time Telemetry',
    mechanism: 'Federated sync across academic & lab inventories with live availability calendars and certified calibration records.',
    badgeBg: 'bg-[#B53F1E]',
    badgeText: 'text-white',
    borderAccent: 'border-[#B53F1E]',
    stateBadge: 'DISCOVERY_POLL: SYNCED',
    icon: Search,
  },
  {
    num: '02',
    title: 'Match',
    tagline: 'IdleX Intent Engine',
    desc: 'Express natural language research requirements. Semantic vectors weigh budget, proximity, and hard SkillGate safety clearances.',
    pill: 'Deterministic Gating',
    mechanism: 'Multi-factor scoring algorithm balancing geographical distance, operator clearances, and machine turnaround readiness.',
    badgeBg: 'bg-[#D4FF00]',
    badgeText: 'text-black',
    borderAccent: 'border-[#D4FF00]',
    stateBadge: 'VECTOR_SCORE: 95.0/100',
    icon: Sliders,
  },
  {
    num: '03',
    title: 'Reserve & Escrow',
    tagline: 'Atomic Time Locking',
    desc: 'Lock calibrated operational windows with zero double-booking risks. ACID-compliant escrow guarantees machine readiness.',
    pill: 'Atomic ACID Escrow',
    mechanism: 'Serialized transaction engine locking calendar slots and custodial escrow simultaneously in a single atomic commit.',
    badgeBg: 'bg-[#8A4C2E]',
    badgeText: 'text-white',
    borderAccent: 'border-[#8A4C2E]',
    stateBadge: 'ACID_ESCROW: COMMITTED',
    icon: Lock,
  },
  {
    num: '04',
    title: 'Handover & Passport',
    tagline: 'Cryptographic Condition Reporting',
    desc: 'Verify equipment baseline state via photographic condition report and cryptographic QR passport before powering on.',
    pill: 'Cryptographic QR Passport',
    mechanism: 'Scannable hardware passport bound to verified operator session and time-stamped checklist on an immutable ledger.',
    badgeBg: 'bg-[#D97706]',
    badgeText: 'text-black',
    borderAccent: 'border-[#D97706]',
    stateBadge: 'QR_PASSPORT: VERIFIED',
    icon: QrCode,
  },
  {
    num: '05',
    title: 'Return & Re-Verification',
    tagline: 'Automated Post-Run Check',
    desc: 'Inspect calibration delta, sign-off custodial custody handover, and release the security buffer automatically.',
    pill: 'Zero-Dispute Settlement',
    mechanism: 'Two-party cryptographic sign-off releasing escrow and updating machine maintenance ledger with zero residual debt.',
    badgeBg: 'bg-[#15803D]',
    badgeText: 'text-white',
    borderAccent: 'border-[#15803D]',
    stateBadge: 'SETTLEMENT: EXECUTED',
    icon: CheckCircle2,
  },
];

export default function LifecycleOrchestrationSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const currentStep = STEPS[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0F0C0A] relative z-10"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A120E] border border-[#AD7257]/40 rounded-sm font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00] mb-4">
              <span className="w-2 h-2 bg-[#D4FF00]" />
              <span>03 / End-to-End Orchestration</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-3">
              How IdleX Works: The 5-Phase Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
              A verifiable, atomic resource exchange sequence designed to eliminate double-bookings, protect expensive equipment from uncertified operators, and settle usage transparently.
            </p>
          </motion.div>

          <div className="font-mono text-xs text-[#A99A90] uppercase tracking-wider flex items-center gap-2 bg-[#17110E] p-2.5 rounded border border-[#AD7257]/30">
            <span className="w-2 h-2 bg-[#D4FF00]" />
            <span>EXECUTION PHASE 0{activeStep + 1} OF 05</span>
          </div>
        </div>

        {/* 5-Phase Horizontal Architectural Sequence Rack */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
          {STEPS.map((st, i) => {
            const isActive = activeStep === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`p-4 text-left rounded-lg border-2 transition-all cursor-pointer font-mono relative overflow-hidden ${
                  isActive
                    ? `${st.borderAccent} bg-[#1D1410] text-[#F1E7DE]`
                    : 'border-[#AD7257]/20 bg-[#140E0C] text-[#A99A90] hover:text-[#F1E7DE] hover:border-[#AD7257]/40'
                }`}
              >
                {/* Top Accent Stripe */}
                <div
                  className={`h-1.5 w-full absolute top-0 left-0 transition-opacity ${
                    isActive ? `${st.badgeBg} opacity-100` : 'opacity-0'
                  }`}
                />

                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase ${
                    isActive ? `${st.badgeBg} ${st.badgeText}` : 'bg-black/40 text-[#A99A90]'
                  }`}>
                    PHASE {st.num}
                  </span>
                  <st.icon className={`w-4 h-4 ${isActive ? 'text-[#D4FF00]' : 'text-[#A99A90]'}`} />
                </div>

                <div className="font-bold text-sm text-[#F1E7DE] mb-1">
                  {st.title}
                </div>
                <div className="text-[10px] text-[#A99A90] truncate uppercase tracking-wider">
                  {st.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Phase Operational Manifest Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl overflow-hidden border-2 ${currentStep.borderAccent} bg-[#16100E]`}
          >
            {/* Solid Status Banner */}
            <div className={`px-6 sm:px-8 py-3.5 ${currentStep.badgeBg} ${currentStep.badgeText} flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider`}>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-current" />
                <span>STATE MACHINE COMMIT // PHASE 0{activeStep + 1}: {currentStep.title.toUpperCase()}</span>
              </div>
              <span className="bg-black/30 text-white px-2.5 py-0.5 rounded text-[11px] font-mono">
                {currentStep.stateBadge}
              </span>
            </div>

            <div className="p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Phase Blueprint */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-mono text-[#D95927] uppercase tracking-wider mb-2 font-semibold">
                    {currentStep.tagline}
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-[#F1E7DE] tracking-tight leading-tight mb-4">
                    {currentStep.title}
                  </h3>
                  <p className="text-base text-[#D9C5B4] leading-relaxed font-light">
                    {currentStep.desc}
                  </p>
                </div>

                {/* Concrete Mechanism Box */}
                <div className="p-5 rounded-lg bg-[#201612] border border-[#AD7257]/30 font-mono text-xs space-y-2">
                  <div className="text-[11px] text-[#A99A90] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
                    <span>Deterministic Operational Mechanism</span>
                  </div>
                  <div className="text-sm text-[#F1E7DE] font-sans">
                    {currentStep.mechanism}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2 font-mono text-xs">
                  <button
                    onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1))}
                    className="px-4 py-2 rounded bg-[#201612] hover:bg-[#2D1F1A] text-[#F1E7DE] border border-[#AD7257]/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>PREVIOUS</span>
                  </button>

                  <button
                    onClick={() => setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0))}
                    className="px-4 py-2 rounded bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>NEXT PHASE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Industrial Diagnostic Checklist */}
              <div className="lg:col-span-5 bg-[#1B120E] border border-[#AD7257]/35 rounded-lg p-6 font-mono text-xs space-y-4">
                <div className="pb-3 border-b border-[#AD7257]/20 flex items-center justify-between text-[#A99A90] uppercase">
                  <span>AUDIT PROTOCOL</span>
                  <span className="text-[#D4FF00] font-bold">SHA-256 LEDGER</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-[#F1E7DE]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Zero Race-Condition Scheduling</div>
                      <div className="text-[11px] text-[#A99A90]">Serializable transaction locks prevent concurrent conflicts.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-[#F1E7DE]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Automated Turnaround Buffer</div>
                      <div className="text-[11px] text-[#A99A90]">Mandatory recalibration clearance window between bookings.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-[#F1E7DE]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Verified Operator Induction</div>
                      <div className="text-[11px] text-[#A99A90]">Hardware lockout until prerequisite safety certifications verified.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#AD7257]/20 flex items-center justify-between text-[11px]">
                  <span className="text-[#A99A90]">PLATFORM STATUS:</span>
                  <span className="text-emerald-400 font-bold">100% DETERMINISTIC</span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
