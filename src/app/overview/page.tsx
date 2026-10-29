'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Box, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Zap, 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  GitBranch, 
  Lock, 
  Activity 
} from 'lucide-react';

export default function OverviewPage() {
  const [openSection, setOpenSection] = useState<string | null>('acid-lock');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const domains = [
    {
      id: 'space',
      badge: 'Controlled Spaces & Facilities',
      title: 'Property & Spaces',
      icon: Building2,
      description: 'Physical cleanrooms, microfabrication bays, and EMI-shielded anechoic chambers requiring environmental certification and strict air particulate control.',
      examples: [
        { name: 'ISO Class 5 Microfabrication Cleanroom', spec: 'Sub-micron Photolithography & Wet Chemical Benches', rate: '$180/hr' },
        { name: 'EMI Shielded RF Anechoic Chamber', spec: 'DC to 40 GHz Anechoic Isolation with Keysight N5224B PNA', rate: '$195/hr' }
      ]
    },
    {
      id: 'equipment',
      badge: 'Precision Metrology & Machining',
      title: 'Physical Assets',
      icon: Box,
      description: 'Specialized capital equipment: 5-axis CNC machining centers, high-resolution electron microscopes, and high-frequency vector network analyzers.',
      examples: [
        { name: 'Markforged X7 Carbon Fiber 3D Printer', spec: 'Continuous Carbon Fiber Reinforcement, 50μm Layer Resolution', rate: '$85/hr' },
        { name: 'FEI Quanta 250 FEG Scanning Electron Microscope', spec: '1.2nm Resolution, Secondary & Backscatter Detectors', rate: '$165/hr' }
      ]
    },
    {
      id: 'digital',
      badge: 'Compute Allocations & Nodes',
      title: 'Digital & Tech',
      icon: Cpu,
      description: 'Dedicated high-performance computing partitions: Multi-GPU Slurm clusters, low-latency quantum simulation nodes, and FPGA synthesis racks.',
      examples: [
        { name: 'NVIDIA 8x H100 SXM5 GPU Cluster Node', spec: '640GB HBM3 VRAM, 3.2 Tbps InfiniBand Interconnect', rate: '$220/hr' },
        { name: 'AMD EPYC 9654 High-Memory Slurm Partition', spec: '192 Cores, 1.5TB DDR5-4800 RAM, Slurm Scheduler Access', rate: '$95/hr' }
      ]
    }
  ];

  const lifecycleStages = [
    {
      step: '01',
      name: 'Intent Matching & ACID Lock',
      summary: 'Deterministic compatibility scoring & serialized slot reservation',
      details: 'Evaluates natural-language experimental requirements against verified equipment specifications, validates operator credentials, and commits an atomic lock across operational time and mandatory recalibration buffers.'
    },
    {
      step: '02',
      name: 'SkillGate & Custody Handover',
      summary: 'Verified operator authentication & condition checkout',
      details: 'Ensures only verified profiles with valid safety training can release physical custody. Scannable physical QR passports link directly to calibration certificates and immutable condition history.'
    },
    {
      step: '03',
      name: 'Session Execution & Protection',
      summary: 'Autonomous monitoring & collision protection',
      details: 'Guarantees operational reliability during active runs. If an unexpected procedural delay occurs, autonomous cascade algorithms calculate buffer absorption and pre-stage compatible alternative bays.'
    },
    {
      step: '04',
      name: 'Audited Return & Recalibration',
      summary: 'Return verification & ledger finalization',
      details: 'Post-session return inspection confirms asset integrity. Any documented discrepancy or delay triggers automatic escrow adjustments or cascade rerouting.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5]">
      
      {/* Top Breadcrumb Header */}
      <div className="border-b border-[#344438] bg-[#101D15]/80 backdrop-blur sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link href="/" className="text-[#7E8D77] hover:text-[#F1F0E5] transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hero</span>
          </Link>
          <span className="text-[#344438]">/</span>
          <span className="text-[#B7C2B1] font-medium">Platform Architecture</span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <Link
            href="/explore"
            className="px-3 py-1.5 rounded-lg bg-[#203025] hover:bg-[#293B2F] text-[#F1F0E5] border border-[#344438] transition-colors"
          >
            Explore Directory
          </Link>
          <Link
            href="/match"
            className="px-3 py-1.5 rounded-lg bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] font-semibold transition-colors"
          >
            Match Engine
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 1. Executive Summary */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#203025] border border-[#344438] text-[11px] font-mono text-[#C7BC91]">
            <Activity className="w-3 h-3" />
            <span>IDLEX SYSTEM ARCHITECTURE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F1F0E5] tracking-tight leading-tight">
            High-Integrity Infrastructure Exchange
          </h1>

          <p className="text-base sm:text-lg text-[#B7C2B1] leading-relaxed max-w-3xl font-light">
            IdleX coordinates shared access to high-value physical infrastructure, controlled research environments, and high-performance computing clusters. By eliminating scheduling friction, enforcing verified operator passports, and guaranteeing delivery through automated failover cascades, specialized assets operate at peak utilization without operational risk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
              <div className="text-[10px] text-[#7E8D77] uppercase tracking-wider mb-1">Guaranteed Safety</div>
              <div className="text-lg font-semibold text-[#F1F0E5]">Operator Passports</div>
              <p className="text-[#7E8D77] text-[11px] mt-1 font-sans">Mandatory skill credentials and verified training prerequisites before custody release.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
              <div className="text-[10px] text-[#7E8D77] uppercase tracking-wider mb-1">Conflict-Free</div>
              <div className="text-lg font-semibold text-[#F1F0E5]">ACID Buffer Locks</div>
              <p className="text-[#7E8D77] text-[11px] mt-1 font-sans">Automated cooldown and recalibration padding to prevent back-to-back resource collisions.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
              <div className="text-[10px] text-[#7E8D77] uppercase tracking-wider mb-1">Autonomous Failover</div>
              <div className="text-lg font-semibold text-[#F1F0E5]">Promise Protection</div>
              <p className="text-[#7E8D77] text-[11px] mt-1 font-sans">Real-time overrun prediction with automated fallback routing and contingency allocation.</p>
            </div>
          </div>
        </div>

        {/* 2. The 3 Resource Domains */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#82996D] mb-1">Taxonomy</div>
            <h2 className="text-2xl font-semibold text-[#F1F0E5] tracking-tight">The Three Operational Domains</h2>
            <p className="text-sm text-[#7E8D77] mt-1">Specialized workflows tailored to physical constraints, cleanliness requirements, and computational scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {domains.map((dom) => (
              <div key={dom.id} className="p-6 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#203025] text-[#C7BC91] border border-[#344438]">
                      {dom.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#F1F0E5] mb-2">{dom.title}</h3>
                  <p className="text-xs text-[#B7C2B1] leading-relaxed mb-6 font-sans">
                    {dom.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#344438] font-mono text-xs">
                  <div className="text-[10px] text-[#7E8D77] uppercase tracking-wider">Verified Capacity:</div>
                  {dom.examples.map((ex, i) => (
                    <div key={i} className="p-2 rounded bg-[#0D1812] border border-[#344438]/50 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <div className="text-[#F1F0E5] text-[11px] font-medium truncate">{ex.name}</div>
                        <div className="text-[10px] text-[#7E8D77] truncate font-sans">{ex.spec}</div>
                      </div>
                      <span className="text-[#C7BC91] text-[10px] whitespace-nowrap">{ex.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. The 4-Stage Lifecycle */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#82996D] mb-1">Workflow</div>
            <h2 className="text-2xl font-semibold text-[#F1F0E5] tracking-tight">The 4-Stage Lifecycle Engine</h2>
            <p className="text-sm text-[#7E8D77] mt-1">Every physical or computational handover follows an immutable state machine.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifecycleStages.map((stage) => (
              <div key={stage.step} className="p-5 rounded-xl bg-[#17251B] border border-[#344438] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#82996D]">{stage.step}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F0E5]">{stage.name}</h3>
                <div className="text-xs font-mono text-[#C7BC91]">{stage.summary}</div>
                <p className="text-xs text-[#B7C2B1] leading-relaxed font-sans">{stage.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Expandable Technical Details */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#82996D] mb-1">Deep Dive</div>
            <h2 className="text-2xl font-semibold text-[#F1F0E5] tracking-tight">System Engineering Specifications</h2>
            <p className="text-sm text-[#7E8D77] mt-1">Core algorithmic foundations ensuring high-availability and zero double-allocation.</p>
          </div>

          <div className="space-y-3">
            {/* Spec 1: ACID Buffer Lock */}
            <div className="rounded-xl bg-[#17251B] border border-[#344438] overflow-hidden">
              <button
                onClick={() => toggleSection('acid-lock')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#203025] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#C7BC91]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F0E5]">1. ACID Buffer Lock Protocol</h4>
                    <span className="text-xs text-[#7E8D77] font-mono">Atomic slot booking & recalibration padding</span>
                  </div>
                </div>
                {openSection === 'acid-lock' ? <ChevronUp className="w-4 h-4 text-[#7E8D77]" /> : <ChevronDown className="w-4 h-4 text-[#7E8D77]" />}
              </button>

              {openSection === 'acid-lock' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B7C2B1] space-y-3 border-t border-[#344438]">
                  <p className="leading-relaxed">
                    Physical infrastructure cannot be hot-swapped without resetting physical baseline states. IdleX enforces an atomic lock across two distinct intervals: the requested operational duration <code className="text-[#C7BC91] font-mono">[t_start, t_end]</code> and an automated recalibration buffer <code className="text-[#C7BC91] font-mono">[t_end, t_end + \Delta t_buffer]</code>.
                  </p>
                  <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438] font-mono text-[11px] text-[#7E8D77]">
                    <div className="text-[#F1F0E5] font-semibold mb-1">Buffer Calculation Function:</div>
                    <code>Δt_buffer = base_maintenance_window + factor(risk_profile) * consumable_turnaround</code>
                  </div>
                  <p className="leading-relaxed">
                    Database writes operate under strict serializable isolation: if two concurrent match requests attempt to claim intersecting time horizons, the second transaction is safely rolled back before payment escrow lock.
                  </p>
                </div>
              )}
            </div>

            {/* Spec 2: Promise Protection State Machine */}
            <div className="rounded-xl bg-[#17251B] border border-[#344438] overflow-hidden">
              <button
                onClick={() => toggleSection('promise-protection')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#203025] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#82996D]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F0E5]">2. Promise Protection Cascade State Machine</h4>
                    <span className="text-xs text-[#7E8D77] font-mono">Real-time overrun prediction & autonomous rerouting</span>
                  </div>
                </div>
                {openSection === 'promise-protection' ? <ChevronUp className="w-4 h-4 text-[#7E8D77]" /> : <ChevronDown className="w-4 h-4 text-[#7E8D77]" />}
              </button>

              {openSection === 'promise-protection' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B7C2B1] space-y-3 border-t border-[#344438]">
                  <p className="leading-relaxed">
                    When active jobs overrun scheduled durations, standard reservation software causes domino failure across upcoming teams. IdleX Promise Protection continuously calculates cascade risk:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-[#0D1812] border border-[#344438]">
                      <span className="text-[#4E7A5D] font-semibold">Risk: Low</span>
                      <p className="text-[#7E8D77] text-[10px] mt-0.5 font-sans">Overrun absorbed entirely by existing buffer slot. Zero downstream impact.</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#0D1812] border border-[#344438]">
                      <span className="text-[#C79A49] font-semibold">Risk: Moderate</span>
                      <p className="text-[#7E8D77] text-[10px] mt-0.5 font-sans">Buffer depleted. Downstream team alerted; candidate alternative resources pre-staged.</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#0D1812] border border-[#344438]">
                      <span className="text-[#B84A39] font-semibold">Risk: Critical</span>
                      <p className="text-[#7E8D77] text-[10px] mt-0.5 font-sans">Autonomous reroute executed to identical-class secondary facility with compensation credit.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Spec 3: FairShare Queuing */}
            <div className="rounded-xl bg-[#17251B] border border-[#344438] overflow-hidden">
              <button
                onClick={() => toggleSection('fairshare')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#203025] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-[#4E7A5D]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F0E5]">3. FairShare Allocation & Anti-Hoarding Decay</h4>
                    <span className="text-xs text-[#7E8D77] font-mono">Balanced queueing for high-demand specialized hardware</span>
                  </div>
                </div>
                {openSection === 'fairshare' ? <ChevronUp className="w-4 h-4 text-[#7E8D77]" /> : <ChevronDown className="w-4 h-4 text-[#7E8D77]" />}
              </button>

              {openSection === 'fairshare' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B7C2B1] space-y-3 border-t border-[#344438]">
                  <p className="leading-relaxed">
                    To prevent single research groups or commercial organizations from monopolizing high-demand nodes (e.g., 5-axis CNCs or 8x H100 GPU clusters), priority scoring integrates historical usage decay:
                  </p>
                  <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438] font-mono text-[11px] text-[#7E8D77]">
                    <code>Priority_score = base_urgency / (1 + lambda * total_hours_consumed_last_14d)</code>
                  </div>
                  <p className="leading-relaxed">
                    High-utilization teams temporarily drop down the matching hierarchy for scarce slots unless an explicit off-peak reservation window is selected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Editorial Action Section */}
        <div className="p-8 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-[#F1F0E5] tracking-tight">Ready to verify and allocate capacity?</h3>
            <p className="text-xs text-[#7E8D77] mt-1 font-mono">
              Explore available precision instruments or evaluate matching constraints for your workload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <Link
              href="/explore"
              className="px-4 py-2.5 rounded-lg bg-[#203025] hover:bg-[#293B2F] text-[#F1F0E5] border border-[#344438] transition-colors"
            >
              Browse 11 Resources
            </Link>
            <Link
              href="/match"
              className="px-4 py-2.5 rounded-lg bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] font-semibold transition-colors"
            >
              Launch Match Engine
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
