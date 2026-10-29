'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Activity, 
  Cpu, 
  Box, 
  Building2, 
  Terminal,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  QrCode,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import CinematicHeroExperience from '@/components/CinematicHeroExperience';
import { InteractiveDelaySimulator } from '@/components/InteractiveDelaySimulator';

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Discover',
      tagline: 'Multi-Institutional Telemetry',
      desc: 'Scan distributed inventories across engineering bays, quantum spectroscopy chambers, and supercomputing clusters in real-time.',
      pill: 'Real-time telemetry'
    },
    {
      num: '02',
      title: 'Match',
      tagline: 'IdleX Intent Engine',
      desc: 'Express natural language research requirements. Semantic vectors weigh budget, proximity, and hard SkillGate safety clearances.',
      pill: 'Deterministic Gating'
    },
    {
      num: '03',
      title: 'Reserve',
      tagline: 'Transactional Integrity',
      desc: 'Atomic database locking prevents double bookings. FairShare transparently schedules queues with explainable institutional priorities.',
      pill: 'ACID Atomic Lock'
    },
    {
      num: '04',
      title: 'Access',
      tagline: 'Resource Passport Handover',
      desc: 'Scan persistent QR identity. Submit side-by-side photographic condition inspections before physical unlocking occurs.',
      pill: 'QR Audited Handover'
    },
    {
      num: '05',
      title: 'Protect & Return',
      tagline: 'Promise Protection Network',
      desc: 'Dynamic 30–60m turnaround buffers absorb overruns. If delays occur, automated cascades identify equivalent alternatives with zero downtime.',
      pill: 'Zero-Collision Cascade'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#07080A] text-[#F4F4F0] selection:bg-[#D4FF00] selection:text-black">
      
      {/* 1. CINEMATIC FULL-VIEWPORT 3D ROTOR EXPERIENCE (Inspired by guillaumecolombel.fr) */}
      <CinematicHeroExperience />

      {/* 2. CONTINUATION: THE CORE PARADOX (Editorial Split Narrative) */}
      <section className="py-28 px-6 sm:px-12 lg:px-16 border-t border-b border-white/8 bg-[#090B0E] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00]">
            <span>01 / The Core Paradox</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-16 max-w-4xl">
            The problem isn't always a shortage of resources. <br />
            <span className="text-neutral-500 font-normal">
              It's the inability to discover, access, and coordinate what already exists.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Side A: Institutional Blindspot */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#0F1217] border border-white/8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  The Institutional Blindspot
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Multi-Crore Equipment Locked in Departmental Siloes
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  In universities, laboratories, and R&D facilities across the nation, high-precision electron microscopes, industrial 3D printers, cleanrooms, and GPU servers sit completely dark after hours or between disconnected academic schedules.
                </p>
                <div className="mt-8 p-5 rounded-xl bg-[#141822] border border-white/5 font-mono text-xs text-neutral-300 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Average Departmental Asset Idle Rate:</span>
                    <span className="text-red-400 font-bold text-sm">68.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Capital Amortization Loss:</span>
                    <span className="text-neutral-300 font-bold">Severe</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Cross-Institution Visibility:</span>
                    <span className="text-red-400 font-bold">Near Zero</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side B: Access Bottleneck */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#0F1217] border border-white/8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  The Researcher's Bottleneck
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Breakthrough Research Delayed by Months
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Meanwhile, undergraduate innovators, postgraduate researchers, and startup spin-outs wait 12 weeks for external vendor quotes or abandon promising prototypes entirely because they cannot locate accessible local facilities or verify operating credentials.
                </p>
                <div className="mt-8 p-5 rounded-xl bg-[#141822] border border-white/5 font-mono text-xs text-neutral-300 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Average Prototype Lead Time:</span>
                    <span className="text-amber-400 font-bold text-sm">42 Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Commercial Outsource Markup:</span>
                    <span className="text-neutral-300 font-bold">350–500%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Safety Prerequisite Verification:</span>
                    <span className="text-amber-400 font-bold">Manual Paperwork</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IDLEX WORKS: 5-PHASE LIFECYCLE SEQUENCE */}
      <section className="py-28 px-6 sm:px-12 lg:px-16 border-b border-white/8 bg-[#07090C] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00]">
            <span>02 / The Coordination Engine</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            How IdleX Works: The 5-Phase Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mb-12">
            A frictionless, verifiable exchange mechanism backed by atomic ACID transactions and cryptographic QR passports.
          </p>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
            {steps.map((st, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer font-mono ${
                  activeStep === i
                    ? 'bg-[#151921] border-[#D4FF00] text-white shadow-xl'
                    : 'bg-[#0E1117] border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="text-[10px] text-neutral-500 mb-1">{st.num}</div>
                <div className="font-bold text-xs">{st.title}</div>
              </button>
            ))}
          </div>

          {/* Stepper Display Card */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0F1217] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-2.5 py-0.5 rounded border border-[#D4FF00]/25 mb-3">
                {steps[activeStep].pill}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Phase {steps[activeStep].num}: {steps[activeStep].title} — {steps[activeStep].tagline}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {steps[activeStep].desc}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/explore"
                className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#D4FF00]/15 cursor-pointer"
              >
                <span>Test Live Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PROMISE PROTECTION LIVE SIMULATOR */}
      <section className="py-28 px-6 sm:px-12 lg:px-16 border-b border-white/8 bg-[#090B0E] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00]">
              <span>03 / Real-Time Failure Mitigation</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Promise Protection™ Live Disruption Simulator
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              IdleX executes real backend state transitions and atomic conflict management. Trigger an unexpected equipment delay below to observe dynamic turnaround buffers, cascading notification dispatches, and automated equivalent alternative matching.
            </p>
          </div>

          {/* Interactive Component Embedded Directly */}
          <InteractiveDelaySimulator />

        </div>
      </section>

      {/* 5. ARCHITECTURAL PILLARS (Resource Passport, SkillGate, FairShare) */}
      <section className="py-28 px-6 sm:px-12 lg:px-16 border-b border-white/8 bg-[#07090C] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00]">
            <span>04 / Architectural Pillars</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-14">
            Engineered for Zero Operational Fragility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1: Resource Passport */}
            <div className="p-8 rounded-2xl bg-[#0F1217] border border-white/8 flex flex-col justify-between hover:border-[#D4FF00]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Resource Passport</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  Persistent cryptographic identity with scannable QR code resolving to asset maintenance logs, checkout condition checklists, and verified custody history.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-400 pt-4 border-t border-white/5 flex items-center justify-between">
                <span>AUDIT TRAIL</span>
                <span className="text-[#D4FF00]">IMMUTABLE QR RECORD</span>
              </div>
            </div>

            {/* Pillar 2: SkillGate */}
            <div className="p-8 rounded-2xl bg-[#0F1217] border border-white/8 flex flex-col justify-between hover:border-[#D4FF00]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">SkillGate Safety</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  Mandatory qualification gatekeeper. Restricted laser, chemical, or cleanroom assets reject reservations on the server unless verified training records exist.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-400 pt-4 border-t border-white/5 flex items-center justify-between">
                <span>AUTHORIZATION</span>
                <span className="text-[#D4FF00]">SERVER-SIDE ENFORCED</span>
              </div>
            </div>

            {/* Pillar 3: FairShare */}
            <div className="p-8 rounded-2xl bg-[#0F1217] border border-white/8 flex flex-col justify-between hover:border-[#D4FF00]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">FairShare Queuing</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  Deterministic allocation scoring when resources are congested. Prevents hoarding, accounts for thesis deadlines, and provides clear waitlist visibility.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-400 pt-4 border-t border-white/5 flex items-center justify-between">
                <span>SCHEDULER</span>
                <span className="text-[#D4FF00]">NON-MONOPOLIZING</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. EDITORIAL CLOSING HERO CALL TO ACTION */}
      <section className="py-32 px-6 sm:px-12 lg:px-16 bg-gradient-to-b from-[#07090C] to-[#040507] text-center relative overflow-hidden z-10">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          
          <div className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4FF00] bg-[#D4FF00]/10 px-4 py-1 rounded-full border border-[#D4FF00]/25">
            IDLEX ARCHITECTURE • PRODUCTION READY
          </div>
          
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95]">
            Nothing valuable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-[#D4FF00]">
              should sit idle.
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Experience the complete live platform across user booking, owner inventory telemetry, and automated promise protection.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-8 py-4 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-2xl shadow-[#D4FF00]/25 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/match"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12151B] hover:bg-[#1A202A] text-white px-8 py-4 rounded-full font-mono text-xs uppercase tracking-wider border border-white/10 hover:border-white/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4FF00]" />
              <span>Launch Match Engine</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white px-6 py-4 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
