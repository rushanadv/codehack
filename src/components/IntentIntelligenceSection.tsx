'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Search, Sparkles, ArrowRight, MapPin, Calendar, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface PresetQuery {
  id: string;
  tag: string;
  query: string;
  matchedTitle: string;
  matchedCategory: string;
  matchedSpecs: string;
  matchedLocation: string;
  matchedRate: string;
  aggregateScore: number;
  factors: {
    label: string;
    score: number;
    maxScore: number;
    highlightText?: string;
    barColor: string;
  }[];
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'cnc',
    tag: 'PRECISION CNC FABRICATION',
    query: 'Need 40 hours of 5-axis CNC time near Whitefield with ISO-9001 operator verification before Friday afternoon under ₹600/hr.',
    matchedTitle: 'Haas UMC-750 5-Axis Machining Center',
    matchedCategory: 'Physical Assets & Tools',
    matchedSpecs: '12,000 RPM spindle · 40+1 tool changer · Renishaw probe wireless inspection',
    matchedLocation: 'Advanced Manufacturing Hub · Bay 04',
    matchedRate: '₹550 / hr',
    aggregateScore: 96.5,
    factors: [
      {
        label: 'Proximity & Campus Distance (4.2 km)',
        score: 94,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'Schedule & Turnaround Buffer (+30m Clearance)',
        score: 98,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'SkillGate Safety Qualification (Operator Certified)',
        score: 100,
        maxScore: 100,
        highlightText: '100 / 100 (VERIFIED)',
        barColor: 'bg-emerald-400',
      },
      {
        label: 'FairShare Non-Monopolizing Priority Balance',
        score: 94,
        maxScore: 100,
        barColor: 'bg-[#D95927]',
      },
    ],
  },
  {
    id: 'tem',
    tag: 'HIGH-RESOLUTION IMAGING',
    query: 'Urgent high-resolution Cryo-TEM session for nanoparticle structure resolution with Class 2 biological containment induction.',
    matchedTitle: 'Thermo Scientific Krios G4 Cryo-TEM',
    matchedCategory: 'Physical Assets & Tools',
    matchedSpecs: '300 kV X-FEG · Falcon 4i Direct Electron Detector · Automated grid exchange',
    matchedLocation: 'Bio-Imaging Facility · Suite B-12',
    matchedRate: '₹1,200 / hr',
    aggregateScore: 94.2,
    factors: [
      {
        label: 'Proximity & Campus Distance (6.8 km)',
        score: 88,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'Schedule & Turnaround Buffer (+45m Liquid N2 Prep)',
        score: 96,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'SkillGate Safety Qualification (Cryo-Safety L3 Verified)',
        score: 100,
        maxScore: 100,
        highlightText: '100 / 100 (VERIFIED)',
        barColor: 'bg-emerald-400',
      },
      {
        label: 'FairShare Non-Monopolizing Priority Balance',
        score: 92,
        maxScore: 100,
        barColor: 'bg-[#D95927]',
      },
    ],
  },
  {
    id: 'gpu',
    tag: 'ACCELERATED AI COMPUTE',
    query: 'Dedicated 8x NVIDIA H100 cluster for 72-hour distributed PyTorch model training with NVLink and 100Gbps RDMA ingress.',
    matchedTitle: 'NVIDIA DGX H100 8-GPU Node',
    matchedCategory: 'Digital & Tech Resources',
    matchedSpecs: '640GB SXM5 VRAM · 3.2Tbps InfiniBand · Zero persistent data residual wipe',
    matchedLocation: 'Cloud Cluster Pod 08 · Sandboxed VPN',
    matchedRate: '₹850 / hr',
    aggregateScore: 98.0,
    factors: [
      {
        label: 'Network Latency & Ingress (< 1.2ms RDMA)',
        score: 99,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'Schedule & Immediate Slot Availability',
        score: 98,
        maxScore: 100,
        barColor: 'bg-[#D4FF00]',
      },
      {
        label: 'SkillGate Security Qualification (SSH Public Key Validated)',
        score: 100,
        maxScore: 100,
        highlightText: '100 / 100 (VERIFIED)',
        barColor: 'bg-emerald-400',
      },
      {
        label: 'FairShare Non-Monopolizing Priority Balance',
        score: 95,
        maxScore: 100,
        barColor: 'bg-[#D95927]',
      },
    ],
  },
];

export default function IntentIntelligenceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [selectedPreset, setSelectedPreset] = useState<PresetQuery>(PRESET_QUERIES[0]);

  return (
    <section
      ref={sectionRef}
      id="match-engine"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0C0806] relative z-10"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A120E] border border-[#AD7257]/40 rounded-sm font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00] mb-4">
              <span className="w-2 h-2 bg-[#D4FF00]" />
              <span>04 / Intent Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight">
              IdleX Match™ Engine Excerpt
            </h2>
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl mt-2 leading-relaxed">
              Skip multi-tiered rigid dropdown forms. Express real research intent in plain language and let deterministic multi-factor vectors calculate optimum allocation.
            </p>
          </motion.div>

          <Link
            href="/match"
            className="inline-flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold px-5 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all border border-[#D4FF00] active:translate-y-0.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Launch Match Console</span>
          </Link>
        </div>

        {/* Interactive Query Presets Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs">
          <span className="text-[#A99A90] uppercase tracking-wider text-[11px] mr-2">
            SELECT SAMPLE INTENT:
          </span>
          {PRESET_QUERIES.map((p) => {
            const isActive = selectedPreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p)}
                className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#B53F1E] text-white border border-[#E25822]'
                    : 'bg-[#18110E] text-[#A99A90] border border-[#AD7257]/30 hover:text-white'
                }`}
              >
                {p.tag}
              </button>
            );
          })}
        </div>

        {/* Main Terminal Container */}
        <div className="rounded-xl overflow-hidden border-2 border-[#AD7257]/40 bg-[#140F0D]">
          
          {/* Natural Language Query Bar */}
          <div className="p-6 sm:p-7 border-b border-[#AD7257]/30 bg-[#1B120E]">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A99A90] uppercase tracking-wider mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D4FF00]" />
                INPUT RESEARCH INTENT STREAM:
              </span>
              <span className="bg-[#D4FF00] text-black font-bold px-2 py-0.5 rounded-sm text-[10px]">
                LIVE VECTOR ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#0F0A08] border border-[#AD7257]/30 flex items-center gap-3.5 text-sm sm:text-base font-sans text-[#F1E7DE]">
              <Search className="w-5 h-5 text-[#D4FF00] shrink-0" />
              <span className="leading-relaxed font-mono text-sm sm:text-base">
                &ldquo;{selectedPreset.query}&rdquo;
              </span>
            </div>
          </div>

          {/* Split Content: Scoring Telemetry + Physical Boarding Ticket */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Score Decomposition (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider pb-3 border-b border-[#AD7257]/20">
                <span className="text-[#A99A90]">Multi-Factor Vector Breakdown</span>
                <span className="text-[#D4FF00] font-bold">
                  Aggregate: {selectedPreset.aggregateScore} / 100
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {selectedPreset.factors.map((factor, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[#D9C5B4]">
                      <span className="text-[11px]">{factor.label}</span>
                      <span className="font-bold text-[#F1E7DE]">
                        {factor.highlightText || `${factor.score} / ${factor.maxScore}`}
                      </span>
                    </div>

                    {/* Solid Crisp Progress Bar */}
                    <div className="w-full bg-[#1F1612] h-2.5 rounded-xs overflow-hidden border border-[#AD7257]/30">
                      <motion.div
                        key={selectedPreset.id + idx}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full ${factor.barColor}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded bg-[#1B120E] border border-[#AD7257]/25 font-mono text-[11px] text-[#A99A90] flex items-center justify-between">
                <span>CONCURRENCY LOCKING:</span>
                <span className="text-emerald-400 font-bold">ACID TRANSACTION SAFE</span>
              </div>
            </div>

            {/* Right: Physical Dispatch Voucher / Ticket (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border-2 border-[#D4FF00] bg-[#18110E] relative shadow-lg">
                
                {/* Ticket Top Ribbon */}
                <div className="bg-[#D4FF00] text-black px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>DISPATCH MANIFEST</span>
                  <span className="bg-black text-[#D4FF00] px-2 py-0.5 rounded-xs text-[10px]">
                    TOP CANDIDATE
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D95927] font-bold">
                      {selectedPreset.matchedCategory}
                    </span>
                    <h4 className="text-xl font-bold text-[#F1E7DE] tracking-tight leading-snug mt-1">
                      {selectedPreset.matchedTitle}
                    </h4>
                    <p className="text-xs font-mono text-[#A99A90] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4FF00]" />
                      {selectedPreset.matchedLocation}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#221713] border border-[#AD7257]/25 font-mono text-xs text-[#E6D7CB]">
                    {selectedPreset.matchedSpecs}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#AD7257]/20 font-mono">
                    <div>
                      <div className="text-[10px] text-[#A99A90] uppercase">Calculated Rate</div>
                      <div className="text-lg font-bold text-[#D4FF00]">{selectedPreset.matchedRate}</div>
                    </div>

                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-1.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-mono font-bold text-xs uppercase px-4 py-2 rounded-md transition-all active:translate-y-0.5"
                    >
                      <span>Claim Window</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Perforated Graphic Divider */}
                <div className="border-t-2 border-dashed border-[#AD7257]/40 px-5 py-2.5 bg-[#120B08] font-mono text-[10px] text-[#A99A90] flex items-center justify-between">
                  <span>HASH: 8F2A...E41C</span>
                  <span className="text-emerald-400 font-bold">SKILLGATE CLEARED</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
