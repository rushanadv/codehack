'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Clock, ArrowRightLeft, ShieldAlert, Cpu, Sparkles, AlertOctagon, Check } from 'lucide-react';

// Live telemetry rolling counter helper
function Counter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1800,
  trigger = false,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  trigger?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Quartic ease out
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(ease * value);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, trigger]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default function CoreParadoxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<'both' | 'stream1' | 'stream2'>('both');

  const headlineWords = [
    ["THE", "PROBLEM"],
    ["ISN'T", "ALWAYS"],
    ["SCARCITY."]
  ];

  return (
    <section
      ref={sectionRef}
      id="core-paradox"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0F0A08] relative z-10 overflow-hidden"
    >
      {/* Crisp Solid Hue Accent Rule */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D95927] via-[#AD7257] to-[#D4FF00]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 1. KICKER BADGE & EDITORIAL INDEX */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A120E] border border-[#AD7257]/40 rounded-sm font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00]"
          >
            <span className="w-2 h-2 bg-[#D4FF00]" />
            <span>01 / The Core Paradox</span>
          </motion.div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A99A90] hidden sm:flex items-center gap-3">
            <span>INDEX // SYS.DIAG-01</span>
            <span className="text-[#AD7257]">/</span>
            <span>CAPITAL DISPERSION LEDGER</span>
          </div>
        </div>

        {/* 2. ASYMMETRIC EDITORIAL SPREAD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          
          {/* Left Column: Kinetic Display Headline */}
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#F1E7DE] tracking-tight leading-[0.92] mb-6">
              {headlineWords.map((line, lineIdx) => (
                <div key={lineIdx} className="overflow-hidden block">
                  <motion.span
                    className="inline-block"
                    initial={shouldReduceMotion ? { opacity: 0 } : { y: '110%', opacity: 0 }}
                    animate={isInView ? { y: '0%', opacity: 1 } : {}}
                    transition={{
                      duration: shouldReduceMotion ? 0.3 : 0.8,
                      delay: shouldReduceMotion ? 0 : 0.1 + lineIdx * 0.1,
                      ease: [0.215, 0.61, 0.355, 1],
                    }}
                  >
                    {line.join(' ')}{' '}
                  </motion.span>
                </div>
              ))}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-lg sm:text-2xl text-[#E6D7CB] font-light leading-relaxed max-w-2xl"
            >
              Sometimes, the resources already exist.{' '}
              <span className="text-[#D4FF00] font-normal underline decoration-[#D4FF00]/40 underline-offset-4">
                Access is what stands between them and the people who need them.
              </span>
            </motion.p>
          </div>

          {/* Right Column: Solid Gradient Monolith Metric Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="rounded-xl overflow-hidden border-2 border-[#C84725] bg-gradient-to-br from-[#8C280E] via-[#631B09] to-[#2E0B04] text-[#F7F4EE] p-7 sm:p-8"
            >
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider pb-4 border-b border-[#F7F4EE]/20 mb-6">
                <span className="bg-[#D4FF00] text-black font-bold px-2 py-0.5 rounded-sm">
                  LIVE TELEMETRY
                </span>
                <span className="text-[#F7F4EE]/70">NATIONAL AUDIT REPORT</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-1 font-mono">
                    <Counter
                      value={14.2}
                      prefix="₹"
                      suffix="B+"
                      decimals={1}
                      duration={1600}
                      trigger={isInView}
                    />
                  </div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#F7F4EE]/80 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4FF00]" />
                    Estimated Idling Capital Equipment
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F7F4EE]/20">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#D4FF00] mb-1 font-mono">
                    <Counter
                      value={83}
                      suffix="%"
                      duration={1400}
                      trigger={isInView}
                    />
                  </div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#F7F4EE]/80 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#F7F4EE]" />
                    Inter-Lab Departmental Silo Barrier
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F7F4EE]/20 font-mono text-[11px] text-[#F7F4EE]/70 flex items-center justify-between">
                <span>RECOVERY PROTOCOL</span>
                <span className="font-bold text-white">SLOTLY ACTIVE</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. PARADOX CONNECTOR BRIDGE INDICATOR */}
        <div className="relative mb-6 hidden md:flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#A99A90] bg-[#16100D] border border-[#AD7257]/30 p-3 rounded-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#D95927]" />
            <span className="font-bold text-[#F1E7DE]">Stream 01 // Supply-Side Paralysis</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#241712] border border-[#AD7257]/50 text-xs text-[#D4FF00]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="font-bold tracking-wider">SLOTLY EQUILIBRIUM ENGINE</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[#F1E7DE]">Stream 02 // Demand-Side Bottleneck</span>
            <span className="w-2.5 h-2.5 bg-[#D4FF00]" />
          </div>
        </div>

        {/* 4. ASYMMETRIC DUAL STREAM SPREAD (SOLID HUE CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          
          {/* STREAM 01: Institutional Siloes (Supply Dilemma) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-xl overflow-hidden border-2 border-[#D95927]/60 bg-[#150F0D] flex flex-col justify-between"
          >
            {/* Solid Header Band */}
            <div className="bg-[#B53F1E] text-white px-6 py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white" />
                <span>STREAM 01 // SUPPLY-SIDE DILEMMA</span>
              </div>
              <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">
                DORMANT ASSETS
              </span>
            </div>

            <div className="p-7 sm:p-9 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F1E7DE] mb-4 tracking-tight leading-snug">
                  High-Value Equipment Locked in Departmental Siloes
                </h3>

                <p className="text-sm text-[#D9C5B4] leading-relaxed mb-8">
                  Confocal microscopes, cleanroom lithography bays, and 5-axis CNCs operate at less than a third of their capacity. Departmental budgeting encourages hoarding, while lack of standardized custody handovers creates fear of equipment damage.
                </p>
              </div>

              {/* Segmented Solid Telemetry Gauge */}
              <div className="p-5 rounded-lg bg-[#1E1410] border border-[#AD7257]/30 font-mono text-xs space-y-4">
                <div>
                  <div className="flex justify-between items-center text-[#D9C5B4] mb-2 font-medium">
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#D95927]" />
                      Average Asset Idle Rate:
                    </span>
                    <span className="text-[#D95927] font-bold text-base">
                      <Counter
                        value={68.4}
                        suffix="%"
                        decimals={1}
                        duration={1700}
                        trigger={isInView}
                      />
                    </span>
                  </div>

                  {/* 10 Solid LED Segment Bars */}
                  <div className="grid grid-cols-10 gap-1.5 h-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className={`h-full rounded-xs transition-colors duration-300 ${
                          bar <= 7
                            ? 'bg-[#D95927]'
                            : 'bg-[#2E1D18]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[#A99A90] pt-2 border-t border-[#AD7257]/20">
                  <span>Cross-Institution Visibility:</span>
                  <span className="text-[#F1E7DE] font-semibold px-2 py-0.5 rounded bg-[#38160E] border border-[#D95927]/40 text-[11px]">
                    Near Zero (Opaque)
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A99A90]">
                  <span>Capital Amortization Loss:</span>
                  <span className="text-[#F1E7DE] font-semibold">Severe Deprecation</span>
                </div>
              </div>
            </div>

            <div className="px-7 py-3 border-t border-[#AD7257]/20 bg-[#100B09] font-mono text-[11px] text-[#A99A90] flex items-center justify-between">
              <span>ROOT CAUSE: FEAR OF DAMAGE</span>
              <span className="text-[#D95927] font-bold">UNMANAGED RISK</span>
            </div>
          </motion.div>

          {/* STREAM 02: Researcher Bottleneck (Demand Dilemma) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="rounded-xl overflow-hidden border-2 border-[#D4FF00]/60 bg-[#150F0D] flex flex-col justify-between"
          >
            {/* Solid Header Band */}
            <div className="bg-[#D4FF00] text-black px-6 py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black" />
                <span>STREAM 02 // DEMAND-SIDE BOTTLENECK</span>
              </div>
              <span className="bg-black/20 px-2 py-0.5 rounded text-[10px]">
                THROTTLED RESEARCH
              </span>
            </div>

            <div className="p-7 sm:p-9 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F1E7DE] mb-4 tracking-tight leading-snug">
                  Breakthrough Research Delayed by Administrative Opaque Walls
                </h3>

                <p className="text-sm text-[#D9C5B4] leading-relaxed mb-8">
                  Graduate researchers, innovators, and hardware startups lose critical momentum. Without verified operator credentials or automated reservation guarantees, they wait months for external commercial vendors or abandon bold prototypes.
                </p>
              </div>

              {/* Segmented Solid Telemetry Gauge */}
              <div className="p-5 rounded-lg bg-[#1E1410] border border-[#AD7257]/30 font-mono text-xs space-y-4">
                <div>
                  <div className="flex justify-between items-center text-[#D9C5B4] mb-2 font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4FF00]" />
                      Average Prototype Wait Time:
                    </span>
                    <span className="text-[#D4FF00] font-bold text-base">
                      <Counter
                        value={42}
                        suffix=" Days"
                        duration={1500}
                        trigger={isInView}
                      />
                    </span>
                  </div>

                  {/* 10 Solid LED Segment Bars */}
                  <div className="grid grid-cols-10 gap-1.5 h-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className={`h-full rounded-xs transition-colors duration-300 ${
                          bar <= 8
                            ? 'bg-[#D4FF00]'
                            : 'bg-[#2E1D18]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[#A99A90] pt-2 border-t border-[#AD7257]/20">
                  <span>Commercial Vendor Markup:</span>
                  <span className="text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/40 text-[11px]">
                    350% – 500% Overhead
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A99A90]">
                  <span>Safety Prerequisite Check:</span>
                  <span className="text-[#D95927] font-semibold">Manual Paperwork Inductions</span>
                </div>
              </div>
            </div>

            <div className="px-7 py-3 border-t border-[#AD7257]/20 bg-[#100B09] font-mono text-[11px] text-[#A99A90] flex items-center justify-between">
              <span>ROOT CAUSE: ACCESS FRICTION</span>
              <span className="text-[#D4FF00] font-bold">CAPITAL WASTE</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
