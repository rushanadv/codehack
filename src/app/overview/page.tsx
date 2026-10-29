'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  GitBranch,
  Terminal,
  Activity,
  Zap,
  Lock,
  Compass
} from 'lucide-react';

export default function OverviewPage() {
  const [openSection, setOpenSection] = useState<string | null>('acid-lock');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const domains = [
    {
      id: 'property',
      title: 'Property & Spaces',
      badge: 'Controlled Environments',
      description: 'Certified ISO cleanrooms, climate test chambers, and precision assembly bays. Booked with integrated buffer zones to allow air purge and environmental recalibration.',
      examples: [
        { name: 'Cleanroom Bay 102', spec: 'ISO Class 5 • 420 sq ft • Positive pressure', rate: '$120/hr' },
        { name: 'Climate Test Chamber', spec: '-40°C to +150°C • Humidity controlled', rate: '$65/hr' },
        { name: 'Rapid Prototyping Suite', spec: 'ESD safe • Fume extraction • 650 sq ft', rate: '$55/hr' }
      ]
    },
    {
      id: 'physical',
      title: 'Physical Assets',
      badge: 'Precision Equipment',
      description: 'Industrial additive manufacturing systems, 5-axis CNC machining centers, and high-bandwidth RF test benches. Operated under verified operator passport credentials.',
      examples: [
        { name: 'Stratasys Fortus 450mc', spec: 'ULTEM 9085 & PEKK • 406x355x406 mm', rate: '$85/hr' },
        { name: 'Hermle C 400 5-Axis CNC', spec: '18,000 RPM • ±3 µm repeatability', rate: '$165/hr' },
        { name: 'Keysight 33 GHz RF Bench', spec: 'Multi-channel real-time oscilloscope', rate: '$140/hr' }
      ]
    },
    {
      id: 'digital',
      title: 'Digital & Tech',
      badge: 'Compute & Clusters',
      description: 'High-throughput GPU nodes, parallel CFD simulation clusters, and isolated pipeline environments with sub-millisecond network interconnects.',
      examples: [
        { name: 'NVIDIA H100 80GB SXM5', spec: '80GB HBM3 • NVLink 900 GB/s', rate: '$4.20/hr' },
        { name: 'CFD Sim Cluster (128 Cores)', spec: 'AMD EPYC 9654 • 1.5 TB ECC DDR5', rate: '$38/hr' },
        { name: 'Distributed ML Pipeline', spec: '4x A100 SXM4 • 3.2 Tbps RoCEv2', rate: '$14.50/hr' }
      ]
    }
  ];

  const lifecycleStages = [
    {
      step: '01',
      name: 'Discovery',
      summary: 'Deterministic search & constraint matching',
      details: 'Search by exact physical specifications, required operator certifications, or target time windows. Intent matching resolves semantic requests into concrete hardware configurations.'
    },
    {
      step: '02',
      name: 'Verification',
      summary: 'Credential checks & ACID buffer lock',
      details: 'Operator passport credentials and safety certifications are cryptographically checked against resource requirements. Confirmed bookings lock adjacent buffer slots to prevent scheduling collisions.'
    },
    {
      step: '03',
      name: 'Custody',
      summary: 'Condition check-in & telemetry logging',
      details: 'Operators perform baseline calibration and photographic condition inspection at session start. Runtime metrics and environmental conditions are logged throughout execution.'
    },
    {
      step: '04',
      name: 'Settlement',
      summary: 'Return verification & ledger finalization',
      details: 'Post-session return inspection confirms asset integrity. Any documented discrepancy or delay triggers automatic escrow adjustments or cascade rerouting.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#11100F] text-[#F3EADF]">
      
      {/* Top Breadcrumb Header */}
      <div className="border-b border-[#2C2723] bg-[#151312]/80 backdrop-blur sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link href="/" className="text-[#8C827A] hover:text-[#F3EADF] transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hero</span>
          </Link>
          <span className="text-[#544B43]">/</span>
          <span className="text-[#B8ADA0] font-medium">Platform Architecture</span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <Link
            href="/explore"
            className="px-3 py-1.5 rounded-lg bg-[#211E1B] hover:bg-[#2A2622] text-[#F3EADF] border border-[#38312C] transition-colors"
          >
            Explore Directory
          </Link>
          <Link
            href="/match"
            className="px-3 py-1.5 rounded-lg bg-[#B65E42] hover:bg-[#A35238] text-white font-medium transition-colors"
          >
            Match Engine
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 1. Executive Summary */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#211E1B] border border-[#38312C] text-[11px] font-mono text-[#D69A49]">
            <Activity className="w-3 h-3" />
            <span>IDLEX SYSTEM ARCHITECTURE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F3EADF] tracking-tight leading-tight">
            High-Integrity Infrastructure Exchange
          </h1>

          <p className="text-base sm:text-lg text-[#B8ADA0] leading-relaxed max-w-3xl font-light">
            IdleX coordinates shared access to high-value physical infrastructure, controlled research environments, and high-performance computing clusters. By eliminating scheduling friction, enforcing verified operator passports, and guaranteeing delivery through automated failover cascades, specialized assets operate at peak utilization without operational risk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#191715] border border-[#2C2723]">
              <div className="text-[10px] text-[#8C827A] uppercase tracking-wider mb-1">Guaranteed Safety</div>
              <div className="text-lg font-semibold text-[#F3EADF]">Operator Passports</div>
              <p className="text-[#8C827A] text-[11px] mt-1 font-sans">Mandatory skill credentials and verified training prerequisites before custody release.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#191715] border border-[#2C2723]">
              <div className="text-[10px] text-[#8C827A] uppercase tracking-wider mb-1">Conflict-Free</div>
              <div className="text-lg font-semibold text-[#F3EADF]">ACID Buffer Locks</div>
              <p className="text-[#8C827A] text-[11px] mt-1 font-sans">Automated cooldown and recalibration padding to prevent back-to-back resource collisions.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#191715] border border-[#2C2723]">
              <div className="text-[10px] text-[#8C827A] uppercase tracking-wider mb-1">Autonomous Failover</div>
              <div className="text-lg font-semibold text-[#F3EADF]">Promise Protection</div>
              <p className="text-[#8C827A] text-[11px] mt-1 font-sans">Real-time overrun prediction with automated fallback routing and contingency allocation.</p>
            </div>
          </div>
        </div>

        {/* 2. The 3 Resource Domains */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#B65E42] mb-1">Taxonomy</div>
            <h2 className="text-2xl font-semibold text-[#F3EADF] tracking-tight">The Three Operational Domains</h2>
            <p className="text-sm text-[#8C827A] mt-1">Specialized workflows tailored to physical constraints, cleanliness requirements, and computational scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {domains.map((dom) => (
              <div key={dom.id} className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#211E1B] text-[#D69A49] border border-[#38312C]">
                      {dom.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#F3EADF] mb-2">{dom.title}</h3>
                  <p className="text-xs text-[#8C827A] leading-relaxed mb-6 font-sans">
                    {dom.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#2C2723] font-mono text-xs">
                  <div className="text-[10px] text-[#6B6158] uppercase tracking-wider">Verified Capacity:</div>
                  {dom.examples.map((ex, i) => (
                    <div key={i} className="p-2 rounded bg-[#151312] border border-[#24201D] flex items-center justify-between">
                      <div className="truncate mr-2">
                        <div className="text-[#F3EADF] text-[11px] font-medium truncate">{ex.name}</div>
                        <div className="text-[10px] text-[#8C827A] truncate font-sans">{ex.spec}</div>
                      </div>
                      <span className="text-[#D69A49] text-[10px] whitespace-nowrap">{ex.rate}</span>
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
            <div className="text-xs font-mono uppercase tracking-wider text-[#B65E42] mb-1">Workflow</div>
            <h2 className="text-2xl font-semibold text-[#F3EADF] tracking-tight">The 4-Stage Lifecycle Engine</h2>
            <p className="text-sm text-[#8C827A] mt-1">Every physical or computational handover follows an immutable state machine.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifecycleStages.map((stage) => (
              <div key={stage.step} className="p-5 rounded-xl bg-[#191715] border border-[#2C2723] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#B65E42]">{stage.step}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
                </div>
                <h3 className="text-base font-semibold text-[#F3EADF]">{stage.name}</h3>
                <div className="text-xs font-mono text-[#D69A49]">{stage.summary}</div>
                <p className="text-xs text-[#8C827A] leading-relaxed font-sans">{stage.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Expandable Technical Details */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#B65E42] mb-1">Deep Dive</div>
            <h2 className="text-2xl font-semibold text-[#F3EADF] tracking-tight">System Engineering Specifications</h2>
            <p className="text-sm text-[#8C827A] mt-1">Core algorithmic foundations ensuring high-availability and zero double-allocation.</p>
          </div>

          <div className="space-y-3">
            {/* Spec 1: ACID Buffer Lock */}
            <div className="rounded-xl bg-[#191715] border border-[#2C2723] overflow-hidden">
              <button
                onClick={() => toggleSection('acid-lock')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#211E1B] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#D69A49]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F3EADF]">1. ACID Buffer Lock Protocol</h4>
                    <span className="text-xs text-[#8C827A] font-mono">Atomic slot booking & recalibration padding</span>
                  </div>
                </div>
                {openSection === 'acid-lock' ? <ChevronUp className="w-4 h-4 text-[#8C827A]" /> : <ChevronDown className="w-4 h-4 text-[#8C827A]" />}
              </button>

              {openSection === 'acid-lock' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B8ADA0] space-y-3 border-t border-[#2C2723]">
                  <p className="leading-relaxed">
                    Physical infrastructure cannot be hot-swapped without resetting physical baseline states. IdleX enforces an atomic lock across two distinct intervals: the requested operational duration <code className="text-[#D69A49] font-mono">[t_start, t_end]</code> and an automated recalibration buffer <code className="text-[#D69A49] font-mono">[t_end, t_end + \Delta t_buffer]</code>.
                  </p>
                  <div className="p-3 bg-[#151312] rounded-lg border border-[#24201D] font-mono text-[11px] text-[#8C827A]">
                    <div className="text-[#F3EADF] font-semibold mb-1">Buffer Calculation Function:</div>
                    <code>Δt_buffer = base_maintenance_window + factor(risk_profile) * consumable_turnaround</code>
                  </div>
                  <p className="leading-relaxed">
                    Database writes operate under strict serializable isolation: if two concurrent match requests attempt to claim intersecting time horizons, the second transaction is safely rolled back before payment escrow lock.
                  </p>
                </div>
              )}
            </div>

            {/* Spec 2: Promise Protection State Machine */}
            <div className="rounded-xl bg-[#191715] border border-[#2C2723] overflow-hidden">
              <button
                onClick={() => toggleSection('promise-protection')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#211E1B] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#B65E42]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F3EADF]">2. Promise Protection Cascade State Machine</h4>
                    <span className="text-xs text-[#8C827A] font-mono">Real-time overrun prediction & autonomous rerouting</span>
                  </div>
                </div>
                {openSection === 'promise-protection' ? <ChevronUp className="w-4 h-4 text-[#8C827A]" /> : <ChevronDown className="w-4 h-4 text-[#8C827A]" />}
              </button>

              {openSection === 'promise-protection' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B8ADA0] space-y-3 border-t border-[#2C2723]">
                  <p className="leading-relaxed">
                    When active jobs overrun scheduled durations, standard reservation software causes domino failure across upcoming teams. IdleX Promise Protection continuously calculates cascade risk:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-[#151312] border border-[#24201D]">
                      <span className="text-[#4E7A5D] font-semibold">Risk: Low</span>
                      <p className="text-[#8C827A] text-[10px] mt-0.5 font-sans">Overrun absorbed entirely by existing buffer slot. Zero downstream impact.</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#151312] border border-[#24201D]">
                      <span className="text-[#D69A49] font-semibold">Risk: Moderate</span>
                      <p className="text-[#8C827A] text-[10px] mt-0.5 font-sans">Buffer depleted. Downstream team alerted; candidate alternative resources pre-staged.</p>
                    </div>
                    <div className="p-2.5 rounded bg-[#151312] border border-[#24201D]">
                      <span className="text-[#B84A39] font-semibold">Risk: Critical</span>
                      <p className="text-[#8C827A] text-[10px] mt-0.5 font-sans">Autonomous reroute executed to identical-class secondary facility with compensation credit.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Spec 3: FairShare Queuing */}
            <div className="rounded-xl bg-[#191715] border border-[#2C2723] overflow-hidden">
              <button
                onClick={() => toggleSection('fairshare')}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-[#211E1B] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-[#4E7A5D]" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#F3EADF]">3. FairShare Allocation & Anti-Hoarding Decay</h4>
                    <span className="text-xs text-[#8C827A] font-mono">Balanced queueing for high-demand specialized hardware</span>
                  </div>
                </div>
                {openSection === 'fairshare' ? <ChevronUp className="w-4 h-4 text-[#8C827A]" /> : <ChevronDown className="w-4 h-4 text-[#8C827A]" />}
              </button>

              {openSection === 'fairshare' && (
                <div className="px-5 pb-5 pt-2 text-xs text-[#B8ADA0] space-y-3 border-t border-[#2C2723]">
                  <p className="leading-relaxed">
                    To prevent single research groups or commercial organizations from monopolizing high-demand nodes (e.g., 5-axis CNCs or 8x H100 GPU clusters), priority scoring integrates historical usage decay:
                  </p>
                  <div className="p-3 bg-[#151312] rounded-lg border border-[#24201D] font-mono text-[11px] text-[#8C827A]">
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
        <div className="p-8 rounded-xl bg-[#191715] border border-[#2C2723] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-[#F3EADF] tracking-tight">Ready to verify and allocate capacity?</h3>
            <p className="text-xs text-[#8C827A] mt-1 font-mono">
              Explore available precision instruments or evaluate matching constraints for your workload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <Link
              href="/explore"
              className="px-4 py-2.5 rounded-lg bg-[#211E1B] hover:bg-[#2A2622] text-[#F3EADF] border border-[#38312C] transition-colors"
            >
              Browse 11 Resources
            </Link>
            <Link
              href="/match"
              className="px-4 py-2.5 rounded-lg bg-[#B65E42] hover:bg-[#A35238] text-white font-medium transition-colors"
            >
              Launch Match Engine
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
