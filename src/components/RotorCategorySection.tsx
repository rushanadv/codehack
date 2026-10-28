'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  Cpu,
  Cog,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import ThreeResourceRotor from './ThreeResourceRotor';

interface CategoryData {
  id: string;
  code: string;
  faceName: string;
  faceDegree: string;
  title: string;
  motifTitle: string;
  motifSubtitle: string;
  description: string;
  color: string;
  icon: React.ElementType;
  specs: { label: string; value: string; highlight?: boolean }[];
  featuredAssets: { name: string; specs: string; slug: string }[];
  exploreLink: string;
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'space',
    code: 'FACE_01',
    faceName: 'Property & Spaces',
    faceDegree: '0° [Blender -90° Normal]',
    title: 'Specialized Spaces & Facilities',
    motifTitle: 'Architectural Stepped Skyline',
    motifSubtitle: 'Central portal arch with vertical spire and stepped modernist wings',
    description:
      'High-containment cleanrooms, autonomous robotics arenas, and RF-shielded chambers sitting dark outside academic hours. IdleX coordinates multi-institution access protocols, safety inductions, and physical keycard handoffs without multi-crore capital building costs.',
    color: '#D4FF00',
    icon: Building2,
    specs: [
      { label: 'Access Protocol', value: 'Dynamic Cryptographic NFC / QR Gate' },
      { label: 'Prerequisite Safety', value: 'SkillGate Level 2/3 Cleanroom Certified', highlight: true },
      { label: 'Protection SLA', value: 'Automated Facility Backup Match' },
    ],
    featuredAssets: [
      { name: 'ISO Class 5 Cleanroom Bay', specs: 'Class 100 • 12 Air Changes/Min', slug: 'res-iso-cleanroom' },
      { name: 'Autonomous UAV Flight Arena', specs: '16-Cam Vicon MoCap • 12m Ceiling', slug: 'res-uav-arena' },
      { name: 'RF Anechoic Chamber', specs: '30 MHz – 18 GHz • EMC Compliant', slug: 'res-anechoic-chamber' },
    ],
    exploreLink: '/explore?category=space',
  },
  {
    id: 'equipment',
    code: 'FACE_02',
    faceName: 'Physical Assets',
    faceDegree: '120° [Blender +30° Normal]',
    title: 'Precision Equipment & Instruments',
    motifTitle: 'Mechanical Gear & Caliper Bridge',
    motifSubtitle: '8-tooth precision gear with central bearing hub, radial torque struts, and crank boss',
    description:
      'Industrial additive manufacturing systems, field emission electron microscopes, and high-speed optics locked in departmental silos. Reserve apparatus with verified operational track records, real-time maintenance logging, and automated failure rerouting.',
    color: '#A4A8B0',
    icon: Cog,
    specs: [
      { label: 'Inspection Audit', value: 'Resource Passport Condition Log' },
      { label: 'Protection Escrow', value: 'Promise Protection Instant Replacement', highlight: true },
      { label: 'Fairness Queue', value: 'FairShare Proportional Scheduling' },
    ],
    featuredAssets: [
      { name: 'Stratasys Fortus 450mc', specs: 'High-Temp ULTEM / Carbon PEEK', slug: 'res-stratasys-450' },
      { name: 'JEOL JSM-IT800 FE-SEM', specs: '0.7nm Resolution • EDX Spectroscopy', slug: 'res-jeol-sem' },
      { name: 'RED V-Raptor 8K VV Cinema', specs: '120fps @ 8K • Full Frame Sensor', slug: 'res-red-vraptor' },
    ],
    exploreLink: '/explore?category=equipment',
  },
  {
    id: 'digital',
    code: 'FACE_03',
    faceName: 'Digital & Tech',
    faceDegree: '240° [Blender +150° Normal]',
    title: 'Digital & Computational Resources',
    motifTitle: 'Processor & Circuit Traces',
    motifSubtitle: 'Chamfered IC package, silicon die, lateral lead pads, and 45° diagonal data buses',
    description:
      'High-performance compute partitions, specialized EDA simulation toolchains, and proprietary physics solver seats. IdleX coordinates compliant workload dispatch during off-peak windows without exposing raw credentials or violating vendor software licenses.',
    color: '#D4FF00',
    icon: Cpu,
    specs: [
      { label: 'License Compliance', value: 'EULA-Compliant Tokenized Schedulers' },
      { label: 'Compute Interconnect', value: 'Sub-5ms InfiniBand fabric', highlight: true },
      { label: 'Isolation Sandbox', value: 'Confidential VM Ephemeral Partition' },
    ],
    featuredAssets: [
      { name: 'NVIDIA H100 80GB SXM5 Cluster', specs: '8x H100 Node • Slurm Partition', slug: 'res-h100-cluster' },
      { name: 'Ansys HFSS / Mechanical Enterprise', specs: 'Concurrent Multi-Core Solver Seat', slug: 'res-ansys-hfss' },
      { name: 'Keysight PathWave ADS 2025', specs: 'RF & Microwave Circuit Simulation', slug: 'res-keysight-ads' },
    ],
    exploreLink: '/explore?category=digital',
  },
];

export default function RotorCategorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll listener that scrubs the rotor rotation smoothly through 0°, 120°, 240°
  useEffect(() => {
    const handleScroll = () => {
      if (isManualOverride || !sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollableDistance = rect.height - windowHeight;

      if (totalScrollableDistance <= 0) return;

      // Distance from top of section to top of viewport
      const scrolledIntoSection = -rect.top;
      const rawProgress = scrolledIntoSection / totalScrollableDistance;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      // Continuous stage: 0.0 -> 2.0
      const currentContinuous = clampedProgress * 2;
      setScrollProgress(currentContinuous);

      // Discrete stage: 0, 1, 2
      const newStage = Math.min(2, Math.floor(clampedProgress * 3));
      setActiveStage(newStage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManualOverride]);

  const selectStage = (stageIdx: number, smoothScroll = true) => {
    setActiveStage(stageIdx);
    setScrollProgress(stageIdx);
    setIsManualOverride(true);

    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }

    // Scroll to the corresponding position in the section if smoothScroll is enabled
    if (smoothScroll && sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const sectionTop = currentScrollY + rect.top;
      const totalScrollable = rect.height - window.innerHeight;

      // Fraction: stage 0 -> 0.05, stage 1 -> 0.50, stage 2 -> 0.95
      const targetFraction = stageIdx === 0 ? 0.05 : stageIdx === 1 ? 0.5 : 0.95;
      const targetScrollY = sectionTop + targetFraction * totalScrollable;

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    }

    // Release override after scroll finishes
    manualTimeoutRef.current = setTimeout(() => {
      setIsManualOverride(false);
    }, 900);
  };

  const nextStage = () => selectStage((activeStage + 1) % 3);
  const prevStage = () => selectStage((activeStage - 1 + 3) % 3);

  const currentCategory = CATEGORIES[activeStage];
  const IconComponent = currentCategory.icon;

  return (
    <div
      ref={sectionRef}
      id="rotor-categories"
      className="relative bg-[#08090C] border-b border-white/8 min-h-[190vh] lg:min-h-[220vh]"
    >
      {/* Sticky presentation viewport container */}
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header Bar with Taxonomy Code & Stage Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
                <Layers className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>03 / Procedural 3D Resource Rotor</span>
                <span className="text-white/30">•</span>
                <span className="text-neutral-400 font-mono text-[10px]">120° TRI-FACE INDEX</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Three Distinct Core Dimensions
              </h2>
            </div>

            {/* Stepper Tabs with Active Highlight */}
            <div className="flex items-center gap-1.5 p-1 bg-[#12151B] rounded-lg border border-white/10 shrink-0">
              {CATEGORIES.map((cat, idx) => {
                const isActive = activeStage === idx;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectStage(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#1C222C] text-[#D4FF00] font-bold shadow-md border border-[#D4FF00]/30'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-[10px] opacity-60">0{idx + 1}</span>
                    <span className="hidden sm:inline">{cat.faceName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid: Left = Three.js Procedural Rotor, Right = Active Category Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: 3D Procedural Three.js Rotor Stage (5 cols on lg) */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              <div className="relative w-full aspect-square max-w-[440px] lg:max-w-none rounded-2xl bg-[#0D0F14] border border-white/10 shadow-2xl overflow-hidden group">
                
                {/* Tech Blueprint Grid & Corner Crosshairs */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e2430_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                <div className="absolute top-3 left-3 text-[10px] font-mono text-neutral-500 pointer-events-none">
                  + ROTOR.AXIS[0, 1, 0]
                </div>
                <div className="absolute top-3 right-3 text-[10px] font-mono text-neutral-400 border border-white/10 px-1.5 py-0.5 rounded bg-black/40 pointer-events-none">
                  {currentCategory.code}
                </div>
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#D4FF00] pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
                  {currentCategory.faceDegree}
                </div>

                {/* 3D Three.js Rotor Component */}
                <ThreeResourceRotor
                  stage={activeStage}
                  scrollProgress={scrollProgress}
                  onStageChange={(newStage) => selectStage(newStage, false)}
                  className="w-full h-full"
                />
              </div>

              {/* Prev / Next Chevrons for Manual Control */}
              <div className="flex items-center justify-between w-full max-w-[440px] lg:max-w-none mt-3 px-1 text-xs font-mono text-neutral-400">
                <button
                  onClick={prevStage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#12151B] hover:bg-[#1C222C] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Rotate to previous face (-120°)"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>PREV [120°]</span>
                </button>

                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeStage === i ? 'w-6 bg-[#D4FF00]' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#12151B] hover:bg-[#1C222C] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Rotate to next face (+120°)"
                >
                  <span>NEXT [120°]</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4FF00]" />
                </button>
              </div>
            </div>

            {/* Right: Synchronized Category Specifications & Assets (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Face Relief Specification Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151921] border border-white/10 text-xs font-mono text-neutral-300 mb-4">
                  <IconComponent className="w-4 h-4 text-[#D4FF00]" />
                  <span className="text-[#D4FF00] font-bold">{currentCategory.faceName}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-neutral-400">{currentCategory.motifTitle}</span>
                </div>

                {/* Main Heading & Motif Description */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                  {currentCategory.title}
                </h3>
                <p className="text-xs font-mono text-neutral-400 mb-4">
                  {currentCategory.motifSubtitle}
                </p>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  {currentCategory.description}
                </p>

                {/* 3 Key Operational Verification Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {currentCategory.specs.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0E1117] border border-white/8 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                        {sp.label}
                      </span>
                      <span
                        className={`text-xs font-mono font-medium ${
                          sp.highlight ? 'text-[#D4FF00]' : 'text-neutral-200'
                        }`}
                      >
                        {sp.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Featured Catalog Items on this Face */}
                <div className="mb-6">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#D4FF00]" />
                    <span>Real-Time Catalog Verification on this Dimension:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentCategory.featuredAssets.map((asset, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#12151B] border border-white/5 hover:border-[#D4FF00]/40 transition-all group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1 group-hover:text-[#D4FF00] transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
                          <span className="truncate">{asset.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">
                          {asset.specs}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link to Full Catalog with Filter */}
              <div className="pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href={currentCategory.exploreLink}
                  className="inline-flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-5 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-[#D4FF00]/20 cursor-pointer"
                >
                  <span>Explore {currentCategory.faceName} Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-2">
                  <span>Scroll down to advance rotor</span>
                  <span className="text-[#D4FF00]">↓</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
