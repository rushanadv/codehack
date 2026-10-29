'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';
import { InteractiveDelaySimulator } from './InteractiveDelaySimulator';

export default function PromiseProtectionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="promise-protection"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0F0A08] relative z-10"
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
              <span>05 / Real-Time Failure Mitigation</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-3">
              Promise Protection™ Live Disruption Simulator
            </h2>
            
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
              IdleX executes real backend state transitions and atomic conflict management. Trigger an unexpected equipment delay below to observe dynamic turnaround buffers, cascading notification dispatches, and automated equivalent alternative matching.
            </p>
          </motion.div>

          {/* Real-time telemetry status pill */}
          <div className="flex items-center gap-3 font-mono text-xs text-[#A99A90] bg-[#17110E] p-3 rounded-md border border-[#AD7257]/30">
            <span className="w-2 h-2 bg-emerald-400" />
            <span className="text-[#F1E7DE] font-bold">STATE ENGINE: ACID VERIFIED</span>
          </div>
        </div>

        {/* Live Simulator Interactive Deck */}
        <InteractiveDelaySimulator />

      </div>
    </section>
  );
}
