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
  Zap
} from 'lucide-react';
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
    <div className="relative min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 px-4 lg:px-8 border-b border-white/8 overflow-hidden bg-grid-tech">
        {/* Ambient Glows (Restrained, subtle) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4FF00]/5 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            {/* Top Micro-Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151B] border border-white/10 text-xs font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping"></span>
              <span className="text-[#D4FF00] font-semibold">IdleX v2.6 Platform</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-300">National Research Resource Exchange</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
              Nothing valuable <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F4F4F0] to-[#D4FF00]">
                should sit idle.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed mb-10">
              Discover, share, and coordinate the resources around you. IdleX transforms unused laboratory equipment, experimental spaces, and technical capabilities into collaborative research capital.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/explore"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-8 py-3.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#D4FF00]/15 cursor-pointer"
              >
                Explore Resources
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/match"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12151B] hover:bg-[#181D26] text-white px-8 py-3.5 rounded-lg font-mono text-sm uppercase tracking-wider border border-white/10 hover:border-white/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4FF00]" />
                Unlock Idle Capacity
              </Link>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/8 w-full text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">₹1.84 Cr</div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mt-1">Capital Mobilized</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#D4FF00]">94.2%</div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mt-1">Buffer Utilization</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">0</div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mt-1">Double Bookings Permitted</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">100%</div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mt-1">SkillGate Enforced</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (Split Editorial Composition) */}
      <section className="py-24 px-4 lg:px-8 border-b border-white/8 bg-[#090B0E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>01 / The Core Paradox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12">
            The problem isn't a shortage of resources. <br />
            <span className="text-neutral-500">It's the inability to coordinate them.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Side A: Idle Capital */}
            <div className="p-8 rounded-xl bg-[#0F1217] border border-white/8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-red-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  The Institutional Blindspot
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Multi-Crore Equipment Locked in Siloes
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed space-y-3">
                  In universities, laboratories, and R&D facilities across the nation, high-precision electron microscopes, industrial 3D printers, cleanrooms, and GPU servers sit completely dark after hours or between disconnected academic schedules.
                </p>
                <div className="mt-6 p-4 rounded bg-[#151921] border border-white/5 font-mono text-xs text-neutral-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Average Departmental Asset Idle Rate:</span>
                    <span className="text-red-400 font-bold">68.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capital Amortization Loss:</span>
                    <span className="text-neutral-400">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Lab Visibility:</span>
                    <span className="text-red-400">Near Zero</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side B: Access Bottleneck */}
            <div className="p-8 rounded-xl bg-[#0F1217] border border-white/8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  The Researcher's Dilemma
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Breakthrough Research Delayed by Months
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Meanwhile, undergraduate innovators, postgraduate researchers, and startup spin-outs wait 12 weeks for external vendor quotes or abandon promising prototypes entirely because they cannot locate accessible local facilities or prove verified operating credentials.
                </p>
                <div className="mt-6 p-4 rounded bg-[#151921] border border-white/5 font-mono text-xs text-neutral-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Average Prototype Lead Time:</span>
                    <span className="text-amber-400 font-bold">42 Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outsourced Fabrication Markup:</span>
                    <span className="text-neutral-400">350–500%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Prerequisite Checks:</span>
                    <span className="text-neutral-400">Manual Paper Forms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IDLEX WORKS (Interactive Sequence Flow) */}
      <section className="py-24 px-4 lg:px-8 border-b border-white/8 bg-[#07090C]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>02 / The Coordination Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            How IdleX Works: The 5-Phase Lifecycle
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl mb-12">
            A frictionless, verifiable exchange mechanism backed by ACID transactions and cryptographic QR passports.
          </p>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
            {steps.map((st, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-3 text-left rounded-lg border transition-all cursor-pointer font-mono ${
                  activeStep === i
                    ? 'bg-[#151921] border-[#D4FF00] text-white shadow-lg'
                    : 'bg-[#0E1117] border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="text-[10px] text-neutral-500 mb-1">{st.num}</div>
                <div className="font-bold text-xs">{st.title}</div>
              </button>
            ))}
          </div>

          {/* Stepper Display Card */}
          <div className="p-8 rounded-xl bg-[#0F1217] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 rounded border border-[#D4FF00]/25 mb-2">
                {steps[activeStep].pill}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Phase {steps[activeStep].num}: {steps[activeStep].title} — {steps[activeStep].tagline}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {steps[activeStep].desc}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/explore"
                className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-5 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Test Live Flow
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE RESOURCE CATEGORIES */}
      <section className="py-24 px-4 lg:px-8 border-b border-white/8 bg-[#090B0E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>03 / Unified Taxonomy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12">
            Three Core Resource Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Category 1: Physical Equipment */}
            <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-[#D4FF00]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-5 group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Physical Equipment</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Industrial 3D printers, field emission scanning electron microscopes, 8K ultra-high-speed cameras, and 33 GHz real-time oscilloscopes.
                </p>
                <ul className="text-xs font-mono space-y-2 text-neutral-300 border-t border-white/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Stratasys Fortus 450mc (FDM)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    JEOL JSM-IT800 FE-SEM
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    RED V-Raptor 8K VV Cinema
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/explore?category=equipment"
                  className="text-xs font-mono text-[#D4FF00] flex items-center gap-1 hover:underline"
                >
                  Browse Physical Assets →
                </Link>
              </div>
            </div>

            {/* Category 2: Spaces and Facilities */}
            <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-[#D4FF00]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-5 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Spaces & Facilities</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  ISO Class 5 nanofabrication cleanroom bays, autonomous drone flight arenas with 16-camera Vicon MoCap cages, and full anechoic acoustic suites.
                </p>
                <ul className="text-xs font-mono space-y-2 text-neutral-300 border-t border-white/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    ISO Class 5 Cleanroom Bay
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Autonomous UAV Flight Arena
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Anechoic Acoustic Chamber
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/explore?category=space"
                  className="text-xs font-mono text-[#D4FF00] flex items-center gap-1 hover:underline"
                >
                  Browse Research Spaces →
                </Link>
              </div>
            </div>

            {/* Category 3: Digital and Technical */}
            <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-[#D4FF00]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00] mb-5 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Digital & Compute</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Authorized access to NVIDIA H100 SXM5 supercomputing cluster nodes and licensed multiphysics tokens (Ansys Rocky DEM & Fluent CFD).
                </p>
                <ul className="text-xs font-mono space-y-2 text-neutral-300 border-t border-white/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    NVIDIA HGX H100 8x80GB
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Ansys DEM & Fluent Floating Token
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Zero raw password leakage
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/explore?category=digital"
                  className="text-xs font-mono text-[#D4FF00] flex items-center gap-1 hover:underline"
                >
                  Browse Compute Allocations →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIGNATURE FEATURE LIVE DEMO: PROMISE PROTECTION */}
      <section className="py-24 px-4 lg:px-8 border-b border-white/8 bg-[#07090C]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
              <span>04 / Real-Time Failure Mitigation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Promise Protection™ Live Disruption Simulator
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl mt-2">
              Unlike static mockups, IdleX runs real business logic and transaction updates. Trigger a delay below to observe buffer clearance, cascading alert dispatches, and automated equivalent rerouting.
            </p>
          </div>

          {/* Interactive Component Embedded Directly */}
          <InteractiveDelaySimulator />
        </div>
      </section>

      {/* 6. PLATFORM SIGNATURE CAPABILITIES (Passports, SkillGate, FairShare) */}
      <section className="py-24 px-4 lg:px-8 border-b border-white/8 bg-[#090B0E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>05 / Architectural Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12">
            Engineered for Zero Operational Fragility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Resource Passport */}
            <div className="p-6 rounded-xl bg-[#0F1217] border border-white/8 space-y-4">
              <div className="w-10 h-10 rounded bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00]">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Resource Passport</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Persistent cryptographic identity with scannable QR code resolving to asset maintenance logs, checkout condition checklists, and verified custody history.
              </p>
              <div className="font-mono text-[10px] text-neutral-400 pt-2 border-t border-white/5">
                STATUS: IMMUTABLE AUDIT TRAIL
              </div>
            </div>

            {/* Pillar 2: SkillGate */}
            <div className="p-6 rounded-xl bg-[#0F1217] border border-white/8 space-y-4">
              <div className="w-10 h-10 rounded bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">SkillGate Safety</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mandatory qualification gatekeeper. Restricted laser, chemical, or cleanroom assets reject reservations on the server unless verified training records exist.
              </p>
              <div className="font-mono text-[10px] text-neutral-400 pt-2 border-t border-white/5">
                STATUS: SERVER-SIDE AUTHORIZATION
              </div>
            </div>

            {/* Pillar 3: FairShare */}
            <div className="p-6 rounded-xl bg-[#0F1217] border border-white/8 space-y-4">
              <div className="w-10 h-10 rounded bg-[#151921] border border-white/10 flex items-center justify-center text-[#D4FF00]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">FairShare Queuing</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Deterministic allocation scoring when resources are congested. Prevents hoarding, accounts for thesis deadlines, and provides clear waitlist visibility.
              </p>
              <div className="font-mono text-[10px] text-neutral-400 pt-2 border-t border-white/5">
                STATUS: EXPLAINABLE ALLOCATION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-24 px-4 lg:px-8 bg-gradient-to-b from-[#090B0E] to-[#050608] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-3 py-1 rounded-full border border-[#D4FF00]/25">
            Ready for Institutional Deployment
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transform idle capacity into your next breakthrough.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Experience the full live platform across user booking, owner inventory management, and administrative safety verification.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-8 py-3.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#D4FF00]/20 cursor-pointer"
            >
              Explore Marketplace Now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#151921] hover:bg-[#1D232F] text-white px-8 py-3.5 rounded-lg font-mono text-sm uppercase tracking-wider border border-white/10 hover:border-white/25 transition-all cursor-pointer"
            >
              Open Mission Control
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
