'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Building2, Cog, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface CategoryItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  count: string;
  description: string;
  link: string;
  icon: React.ElementType;
  specs: { label: string; value: string }[];
  accentColor: string;
  headerGradient: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'space',
    num: '01',
    title: 'Property & Spaces',
    tagline: 'Controlled Environments & Cleanrooms',
    count: '42 Facilities Active',
    description:
      'High-containment cleanrooms, autonomous robotics arenas, and RF-shielded chambers sitting dark outside academic hours. Slotly coordinates multi-institution access protocols, safety inductions, and physical keycard handoffs.',
    link: '/explore?category=space',
    icon: Building2,
    accentColor: '#D4FF00',
    headerGradient: 'from-[#0D2127] to-[#1C3E48]',
    badgeBg: 'bg-[#D4FF00]',
    badgeText: 'text-black',
    borderClass: 'border-[#1C3E48]',
    specs: [
      { label: 'Access Protocol', value: 'Dynamic Cryptographic NFC / QR Gate' },
      { label: 'Prerequisite Safety', value: 'SkillGate Level 2/3 Cleanroom Certified' },
      { label: 'Protection SLA', value: 'Automated Facility Backup Match' },
    ],
  },
  {
    id: 'equipment',
    num: '02',
    title: 'Physical Assets & Tools',
    tagline: 'High-Precision Fabrication & Analysis',
    count: '184 Verified Instruments',
    description:
      'Confocal laser scanning microscopes, 5-axis CNC machining centers, and cryogenic transmission electron microscopes (Cryo-TEM). Slotly establishes verified operator credentialing, custody handovers, and atomic damage escrow protection.',
    link: '/explore?category=equipment',
    icon: Cog,
    accentColor: '#D95927',
    headerGradient: 'from-[#7A210A] to-[#B53F1E]',
    badgeBg: 'bg-[#D95927]',
    badgeText: 'text-white',
    borderClass: 'border-[#B53F1E]',
    specs: [
      { label: 'Custody Handover', value: 'Immutable Photographic Condition Report' },
      { label: 'Escrow Guarantee', value: 'Institutional Security Deposit Locking' },
      { label: 'Calibration Record', value: 'Cryptographic Maintenance Ledger' },
    ],
  },
  {
    id: 'compute',
    num: '03',
    title: 'Digital & Tech Resources',
    tagline: 'On-Demand GPU Workstations & Emulators',
    count: '1,280 TFLOPs Capacity',
    description:
      'Specialized 8x H100 GPU clusters, FPGA hardware-in-the-loop emulation rigs, and dedicated quantum circuit simulators idling between grant runs. Slotly deploys sandboxed SSH ingress, telemetry logging, and fair-share queue allocation.',
    link: '/explore?category=compute',
    icon: Cpu,
    accentColor: '#D4FF00',
    headerGradient: 'from-[#1B1E13] to-[#2D331A]',
    badgeBg: 'bg-[#D4FF00]',
    badgeText: 'text-black',
    borderClass: 'border-[#3B4323]',
    specs: [
      { label: 'Ingress Architecture', value: 'Ephemeral WireGuard / SSH Bastion' },
      { label: 'FairShare Algorithm', value: 'Thesis-Weighted Proportional Allocation' },
      { label: 'Zero Data Residue', value: 'Automated Ephemeral Volume Scrubbing' },
    ],
  },
];

export default function ResourceTaxonomySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredCategories = selectedFilter === 'all' 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.id === selectedFilter);

  return (
    <section
      ref={sectionRef}
      id="resource-universe"
      className="py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-t-2 border-[#AD7257]/30 bg-[#0A0706] relative z-10"
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
              <span>02 / The Slotly Taxonomy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-3">
              The Slotly Resource Universe
            </h2>
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
              Three critical asset classifications. Every instrument, chamber, and GPU rig is mapped with concrete specifications, safety inductives, and verified rate telemetry.
            </p>
          </motion.div>

          {/* Solid Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#F1E7DE] text-black border border-white'
                  : 'bg-[#17110E] text-[#A99A90] border border-[#AD7257]/30 hover:text-white'
              }`}
            >
              All Registers (3)
            </button>
            <button
              onClick={() => setSelectedFilter('space')}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === 'space'
                  ? 'bg-[#1C3E48] text-white border border-[#3E8094]'
                  : 'bg-[#17110E] text-[#A99A90] border border-[#AD7257]/30 hover:text-white'
              }`}
            >
              Spaces [01]
            </button>
            <button
              onClick={() => setSelectedFilter('equipment')}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === 'equipment'
                  ? 'bg-[#B53F1E] text-white border border-[#E25822]'
                  : 'bg-[#17110E] text-[#A99A90] border border-[#AD7257]/30 hover:text-white'
              }`}
            >
              Fabrication [02]
            </button>
            <button
              onClick={() => setSelectedFilter('compute')}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === 'compute'
                  ? 'bg-[#D4FF00] text-black border border-[#D4FF00]'
                  : 'bg-[#17110E] text-[#A99A90] border border-[#AD7257]/30 hover:text-white'
              }`}
            >
              Compute [03]
            </button>
          </div>
        </div>

        {/* 3 Solid Dossier Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`rounded-xl overflow-hidden border-2 ${cat.borderClass} bg-[#140F0D] flex flex-col justify-between`}
              >
                {/* Solid Gradient Hue Top Bar */}
                <div className={`p-6 bg-gradient-to-r ${cat.headerGradient} text-white flex items-center justify-between border-b border-black/30`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-black/40 border border-white/20 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono tracking-widest uppercase opacity-80">
                        SPECIMEN CLASS
                      </span>
                      <div className="text-2xl font-black font-mono leading-none">
                        {cat.num}
                      </div>
                    </div>
                  </div>

                  <span className={`${cat.badgeBg} ${cat.badgeText} text-xs font-mono font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider`}>
                    {cat.count}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F1E7DE] mb-1 tracking-tight">
                      {cat.title}
                    </h3>
                    <div className="text-xs font-mono text-[#D95927] uppercase tracking-wider mb-4 font-semibold">
                      {cat.tagline}
                    </div>

                    <p className="text-sm text-[#D9C5B4] leading-relaxed mb-6">
                      {cat.description}
                    </p>
                  </div>

                  {/* Concrete Specification Matrix Table */}
                  <div className="space-y-2 pt-6 border-t border-[#AD7257]/20 font-mono text-xs">
                    {cat.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded bg-[#1B1310] border border-[#AD7257]/25 flex flex-col gap-1"
                      >
                        <span className="text-[10px] text-[#A99A90] uppercase tracking-wider">
                          {spec.label}
                        </span>
                        <span className="text-xs text-[#F1E7DE] font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="p-6 pt-4 border-t border-[#AD7257]/20 bg-[#100A08] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#A99A90] uppercase">
                    REGISTRY ARCHIVE
                  </span>

                  <Link
                    href={cat.link}
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#D4FF00] hover:text-white transition-colors group"
                  >
                    <span>Browse Assets</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
