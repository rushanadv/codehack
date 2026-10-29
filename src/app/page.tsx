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
  ArrowUpRight,
  Sliders,
  Check,
  Search,
  FileCheck2,
  Lock,
  GitBranch
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
      pill: 'Real-time telemetry',
      mechanism: 'Federated sync across academic & lab inventories with live status telemetry.'
    },
    {
      num: '02',
      title: 'Match',
      tagline: 'IdleX Intent Engine',
      desc: 'Express natural language research requirements. Semantic vectors weigh budget, proximity, and hard SkillGate safety clearances.',
      pill: 'Deterministic Gating',
      mechanism: 'Vector embeddings paired with strict server-side prerequisite validation.'
    },
    {
      num: '03',
      title: 'Reserve',
      tagline: 'Transactional Integrity',
      desc: 'Atomic database locking prevents double bookings. FairShare transparently schedules queues with explainable institutional priorities.',
      pill: 'ACID Atomic Lock',
      mechanism: 'SQLite WAL mode concurrency control ensuring zero double-allocation.'
    },
    {
      num: '04',
      title: 'Access',
      tagline: 'Resource Passport Handover',
      desc: 'Scan persistent QR identity. Submit side-by-side photographic condition inspections before physical unlocking occurs.',
      pill: 'QR Audited Handover',
      mechanism: 'Cryptographic custody chain with mandatory pre/post condition sign-offs.'
    },
    {
      num: '05',
      title: 'Protect & Return',
      tagline: 'Promise Protection Network',
      desc: 'Dynamic 30–60m turnaround buffers absorb overruns. If delays occur, automated cascades identify equivalent alternatives with zero downtime.',
      pill: 'Zero-Collision Cascade',
      mechanism: 'Autonomous disruption mitigation with automated fallback re-routing.'
    }
  ];

  const categories = [
    {
      num: '01',
      id: 'space',
      title: 'Property & Spaces',
      tagline: 'Precision Environments & Specialized Testing Chambers',
      description: 'ISO Class 4–7 cleanrooms, acoustic anechoic chambers, high-bay robotics testing arenas, and high-voltage transmission bays.',
      specs: [
        { label: 'Filtration', value: 'ISO 14644-1 Cleanroom standard' },
        { label: 'Thermal Stability', value: '±0.1°C environmental control' },
        { label: 'Access Protocols', value: 'Air shower & gowning interlock' }
      ],
      link: '/explore?category=space',
      count: '14 Active Facilities'
    },
    {
      num: '02',
      id: 'equipment',
      title: 'Physical Assets',
      tagline: 'Precision Instruments & Heavy Industrial Metrology',
      description: 'Field-emission SEMs, 5-axis CNC machining centers, confocal laser scanning microscopes, and supersonic wind tunnel testbenches.',
      specs: [
        { label: 'Resolution', value: 'Sub-nanometer metrology limit' },
        { label: 'Turnaround Buffer', value: '30–60m mandatory clearance' },
        { label: 'Operator Gating', value: 'SkillGate certification required' }
      ],
      link: '/explore?category=equipment',
      count: '42 Verified Instruments'
    },
    {
      num: '03',
      id: 'digital',
      title: 'Digital & Tech',
      tagline: 'High-Performance Compute & Specialized Test Racks',
      description: 'Dedicated NVIDIA H100/A100 Slurm cluster partitions, PCIe FPGA emulation testbenches, and specialized CAD/CAE simulation seats.',
      specs: [
        { label: 'Interconnect', value: '800 Gb/s InfiniBand NDR' },
        { label: 'Allocation Mode', value: 'Slurm batch queue + FairShare' },
        { label: 'Security Enclave', value: 'Confidential compute isolated' }
      ],
      link: '/explore?category=digital',
      count: '1,280 TFLOPs Capacity'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#090706] text-[#F1E7DE] selection:bg-[#D4FF00] selection:text-black">
      
      {/* 1. CINEMATIC FULL-VIEWPORT 3D ROTOR EXPERIENCE (LOCKED & PRESERVED) */}
      <CinematicHeroExperience />

      {/* 2. SECTION A: THE CORE PARADOX (Asymmetric Magazine Editorial Spread) */}
      <section id="narrative-section" className="py-32 px-6 sm:px-12 lg:px-20 border-t border-[#AD7257]/20 bg-[#120A08] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
            <span>01 / The Core Paradox</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
            <div className="lg:col-span-7">
              <h2 className="text-4xl sm:text-6xl font-black text-[#F1E7DE] tracking-tight leading-[1.0] mb-6">
                THE PROBLEM ISN'T ALWAYS SCARCITY.
              </h2>
              <p className="text-xl sm:text-2xl text-[#D9C5B4] font-light leading-snug">
                Sometimes, the resources already exist. <br className="hidden sm:inline" />
                <span className="text-[#A99A90]">
                  Access is what stands between them and the people who need them.
                </span>
              </p>
            </div>

            <div className="lg:col-span-5 pt-2 border-l border-[#AD7257]/25 pl-6 lg:pl-10">
              <p className="text-sm text-[#D9C5B4] leading-relaxed mb-6">
                Across premier universities, national laboratories, and engineering clusters, millions in specialized capital equipment sits dark after hours. IdleX builds the real-time discovery, verification, and transactional fabric to unlock this dormant capacity.
              </p>
              <div className="flex items-center gap-6 font-mono text-xs text-[#A99A90]">
                <div>
                  <div className="text-xl font-bold text-[#D4FF00]">₹14.2B+</div>
                  <div>Estimated Idling Capital</div>
                </div>
                <div className="w-px h-8 bg-[#AD7257]/30"></div>
                <div>
                  <div className="text-xl font-bold text-[#F1E7DE]">83%</div>
                  <div>Inter-Lab Opaque Barrier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Dual Stream Spread */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Stream 1: Institutional Siloes */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#A94427]/15 to-transparent pointer-events-none"></div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#D96335] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D96335] animate-pulse"></span>
                  Stream 01: Institutional Capital Siloed
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F1E7DE] mb-4 tracking-tight">
                  High-Value Equipment Locked in Departmental Siloes
                </h3>
                <p className="text-sm text-[#D9C5B4] leading-relaxed mb-8">
                  Confocal microscopes, cleanroom lithography bays, and 5-axis CNCs operate at less than a third of their capacity. Departmental budgeting encourages hoarding, while lack of standardized custody handovers creates fear of equipment damage.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-xs space-y-3">
                <div className="flex justify-between items-center text-[#D9C5B4]">
                  <span>Average Departmental Asset Idle Rate:</span>
                  <span className="text-[#D96335] font-bold text-sm">68.4%</span>
                </div>
                <div className="w-full bg-[#170D0A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#D96335] h-full w-[68.4%]"></div>
                </div>
                <div className="flex justify-between items-center text-[#A99A90] pt-1">
                  <span>Cross-Institution Visibility:</span>
                  <span className="text-red-400 font-semibold">Near Zero</span>
                </div>
                <div className="flex justify-between items-center text-[#A99A90]">
                  <span>Capital Amortization Loss:</span>
                  <span className="text-[#F1E7DE] font-semibold">Severe</span>
                </div>
              </div>
            </div>

            {/* Stream 2: Researcher Bottleneck */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#D4FF00]/10 to-transparent pointer-events-none"></div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#D4FF00] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
                  Stream 02: The Innovator's Bottleneck
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F1E7DE] mb-4 tracking-tight">
                  Breakthrough Research Delayed by Administrative Opaque Walls
                </h3>
                <p className="text-sm text-[#D9C5B4] leading-relaxed mb-8">
                  Graduate researchers, innovators, and hardware startups lose critical momentum. Without verified operator credentials or automated reservation guarantees, they wait months for external commercial vendors or abandon bold prototypes.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-xs space-y-3">
                <div className="flex justify-between items-center text-[#D9C5B4]">
                  <span>Average Prototype Fabrication Delay:</span>
                  <span className="text-[#D4FF00] font-bold text-sm">42 Days</span>
                </div>
                <div className="w-full bg-[#170D0A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#D4FF00] h-full w-[75%]"></div>
                </div>
                <div className="flex justify-between items-center text-[#A99A90] pt-1">
                  <span>Commercial Vendor Markup:</span>
                  <span className="text-[#F1E7DE] font-semibold">350–500%</span>
                </div>
                <div className="flex justify-between items-center text-[#A99A90]">
                  <span>Safety Prerequisite Verification:</span>
                  <span className="text-[#D96335] font-semibold">Manual Paperwork</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTION B: IDLEX RESOURCE UNIVERSE (3-Category Editorial Showcase) */}
      <section className="py-32 px-6 sm:px-12 lg:px-20 border-b border-[#AD7257]/20 bg-[#090706] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
                <span>02 / Resource Taxonomy</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight">
                The IdleX Resource Universe
              </h2>
            </div>
            <p className="text-sm text-[#D9C5B4] max-w-md">
              Every asset catalogued on IdleX carries a persistent cryptographic Resource Passport, verified turnaround buffers, and deterministic access gating.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between hover:border-[#D4FF00]/40 transition-all duration-300 group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#AD7257]/20 font-mono">
                    <span className="text-3xl sm:text-4xl font-black text-[#D96335] group-hover:text-[#D4FF00] transition-colors">
                      {cat.num}
                    </span>
                    <span className="text-xs text-[#A99A90] uppercase tracking-wider">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#F1E7DE] mb-2 tracking-tight group-hover:text-[#D4FF00] transition-colors">
                    {cat.title}
                  </h3>
                  <div className="text-xs font-mono text-[#D96335] uppercase tracking-wider mb-4">
                    {cat.tagline}
                  </div>
                  <p className="text-sm text-[#D9C5B4] leading-relaxed mb-8">
                    {cat.description}
                  </p>

                  {/* Technical Specs List */}
                  <div className="space-y-3 pt-4 border-t border-[#AD7257]/20 font-mono text-xs mb-8">
                    {cat.specs.map((sp, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#A99A90]">
                        <span className="text-[11px]">{sp.label}:</span>
                        <span className="text-[#F1E7DE] font-medium text-[11px]">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={cat.link}
                  className="flex items-center justify-between bg-[#24110C] hover:bg-[#D4FF00] text-[#D9C5B4] hover:text-black border border-[#AD7257]/30 hover:border-[#D4FF00] px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Explore {cat.title.split('&')[0].trim()}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. SECTION C: HOW IDLEX WORKS (Unfolding Horizontal 5-Phase Timeline) */}
      <section className="py-32 px-6 sm:px-12 lg:px-20 border-b border-[#AD7257]/20 bg-[#120A08] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
            <span>03 / End-to-End Orchestration</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-4">
            How IdleX Works: The 5-Phase Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl mb-14">
            A frictionless, verifiable exchange mechanism backed by atomic ACID transactions and cryptographic QR passports.
          </p>

          {/* Unfolding Horizontal Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {steps.map((st, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-4 text-left rounded-xl border transition-all cursor-pointer font-mono relative overflow-hidden ${
                  activeStep === i
                    ? 'bg-[#24110C] border-[#D4FF00] text-[#F1E7DE] shadow-xl'
                    : 'bg-[#170D0A] border-[#AD7257]/20 text-[#A99A90] hover:text-[#F1E7DE] hover:border-[#AD7257]/40'
                }`}
              >
                {activeStep === i && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4FF00]"></div>
                )}
                <div className="text-[11px] font-bold text-[#D96335] mb-1">{st.num}</div>
                <div className="font-bold text-xs uppercase tracking-wider">{st.title}</div>
              </button>
            ))}
          </div>

          {/* Stepper Display Card */}
          <div className="p-8 sm:p-12 rounded-2xl bg-[#170D0A] border border-[#AD7257]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl relative">
            <div className="max-w-2xl">
              <div className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-3 py-1 rounded border border-[#D4FF00]/25 mb-4">
                {steps[activeStep].pill}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#F1E7DE] mb-3">
                Phase {steps[activeStep].num}: {steps[activeStep].title} — {steps[activeStep].tagline}
              </h3>
              <p className="text-sm text-[#D9C5B4] leading-relaxed mb-4">
                {steps[activeStep].desc}
              </p>
              <div className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-xs text-[#A99A90]">
                <span className="text-[#D4FF00] font-semibold">Underlying Architecture: </span>
                {steps[activeStep].mechanism}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/explore"
                className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-6 py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#D4FF00]/15 cursor-pointer"
              >
                <span>Test Live Flow</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. SECTION D: IDLEX MATCH ENGINE EXCERPT (Natural Language Intelligence Preview) */}
      <section className="py-32 px-6 sm:px-12 lg:px-20 border-b border-[#AD7257]/20 bg-[#090706] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
            <span>04 / Intent Intelligence</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight">
                IdleX Match™ Engine Excerpt
              </h2>
              <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl mt-2">
                Replace rigid multi-field dropdown filters with plain conversational intent. Multi-factor semantic scoring evaluates distance, schedule compatibility, and hard SkillGate qualifications.
              </p>
            </div>
            <Link
              href="/match"
              className="flex items-center gap-2 bg-[#170D0A] hover:bg-[#24110C] text-[#D4FF00] border border-[#AD7257]/30 hover:border-[#D4FF00] px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#D4FF00]" />
              Launch Match Engine →
            </Link>
          </div>

          {/* Interactive Match Excerpt Panel */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/30 shadow-2xl">
            {/* Realistic Query Bar */}
            <div className="mb-8">
              <div className="text-[11px] font-mono text-[#A99A90] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Natural Language Research Query Preview:</span>
                <span className="text-[#D4FF00]">SEMANTIC VECTOR ACTIVE</span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#24110C] border border-[#AD7257]/25 flex items-center gap-3 text-sm font-sans text-[#F1E7DE]">
                <Search className="w-5 h-5 text-[#D4FF00] shrink-0" />
                <span className="leading-relaxed">
                  "Need 40 hours of 5-axis CNC time near Whitefield with ISO-9001 operator verification before Friday afternoon under ₹600/hr."
                </span>
              </div>
            </div>

            {/* Score Breakdown & Match Candidate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 border-t border-[#AD7257]/20">
              
              {/* Scoring Telemetry (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A99A90] mb-2">
                  Transparent Multi-Factor Scoring Weight:
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between items-center text-[#D9C5B4] mb-1">
                      <span>Proximity & Campus Distance (4.2 km)</span>
                      <span className="text-[#D4FF00] font-bold">94 / 100</span>
                    </div>
                    <div className="w-full bg-[#24110C] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D4FF00] h-full w-[94%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[#D9C5B4] mb-1">
                      <span>Schedule & Turnaround Buffer (+30m Clearance)</span>
                      <span className="text-[#D4FF00] font-bold">98 / 100</span>
                    </div>
                    <div className="w-full bg-[#24110C] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D4FF00] h-full w-[98%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[#D9C5B4] mb-1">
                      <span>SkillGate Safety Qualification (Operator Certified)</span>
                      <span className="text-emerald-400 font-bold">100 / 100 (VERIFIED)</span>
                    </div>
                    <div className="w-full bg-[#24110C] h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[100%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[#D9C5B4] mb-1">
                      <span>FairShare Non-Monopolizing Priority Balance</span>
                      <span className="text-[#D96335] font-bold">88 / 100</span>
                    </div>
                    <div className="w-full bg-[#24110C] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D96335] h-full w-[88%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Result Preview Card (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-xl bg-[#24110C] border border-[#AD7257]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-tech bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-mono">
                      TOP MATCH: 95.0 SCORE
                    </span>
                    <span className="text-xs font-mono text-[#A99A90]">₹450/hr</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#F1E7DE] mb-1">
                    DMG MORI 5-Axis Precision Machining Center
                  </h4>
                  <p className="text-xs text-[#D9C5B4] line-clamp-2 mb-4">
                    High-speed spindle (20,000 RPM) with laser tool measurement and certified ISO-9001 operator handover protocol.
                  </p>
                  <div className="text-[11px] font-mono text-[#A99A90] space-y-1">
                    <div>Location: Advanced Manufacturing Hub, Bay 04</div>
                    <div className="text-[#D4FF00]">Earliest Slot: Tomorrow 14:00</div>
                  </div>
                </div>

                <Link
                  href="/match"
                  className="mt-6 flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Inspect Match Breakdown
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. SECTION E: PROMISE PROTECTION LIVE SIMULATOR */}
      <section className="py-32 px-6 sm:px-12 lg:px-20 border-b border-[#AD7257]/20 bg-[#120A08] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
              <span>05 / Real-Time Failure Mitigation</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-3">
              Promise Protection™ Live Disruption Simulator
            </h2>
            <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
              IdleX executes real backend state transitions and atomic conflict management. Trigger an unexpected equipment delay below to observe dynamic turnaround buffers, cascading notification dispatches, and automated equivalent alternative matching.
            </p>
          </div>

          {/* Interactive Component Embedded Directly */}
          <InteractiveDelaySimulator />

        </div>
      </section>

      {/* 7. SECTION F: DISTINCT ARCHITECTURAL PILLARS (Passport, SkillGate, FairShare) */}
      <section className="py-32 px-6 sm:px-12 lg:px-20 border-b border-[#AD7257]/20 bg-[#090706] relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4FF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
            <span>06 / Architectural Pillars</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight mb-16">
            Engineered for Zero Operational Fragility
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Pillar 1: Resource Passport (Custom Ledger Layout) */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#24110C] border border-[#AD7257]/30 flex items-center justify-center text-[#D4FF00] mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-2 tracking-tight">
                  Resource Passport
                </h3>
                <div className="text-xs font-mono text-[#D96335] uppercase tracking-wider mb-4">
                  Immutable Physical Custody Chain
                </div>
                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Persistent cryptographic identity with scannable QR code resolving to asset maintenance logs, checkout condition checklists, and verified custody history.
                </p>

                {/* Simulated Ledger Entry */}
                <div className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-[11px] space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[#A99A90] pb-1 border-b border-[#AD7257]/15">
                    <span>LEDGER ID: #PAS-9481</span>
                    <span className="text-[#D4FF00]">VERIFIED</span>
                  </div>
                  <div className="text-[#D9C5B4]">2026-10-24: Laser Diode Recalibration [OK]</div>
                  <div className="text-[#D9C5B4]">2026-10-27: Return Sign-off by Prof. Sen [OK]</div>
                  <div className="text-[#A99A90] text-[10px]">SHA-256: 7f8a...3b9e (Unchanged)</div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>AUDIT TRAIL</span>
                <span className="text-[#D4FF00]">IMMUTABLE QR RECORD</span>
              </div>
            </div>

            {/* Pillar 2: SkillGate Safety (Prerequisite Gatekeeper Layout) */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#24110C] border border-[#AD7257]/30 flex items-center justify-center text-[#D4FF00] mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-2 tracking-tight">
                  SkillGate Safety
                </h3>
                <div className="text-xs font-mono text-[#D96335] uppercase tracking-wider mb-4">
                  Server-Enforced Access Gating
                </div>
                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Mandatory qualification gatekeeper. Restricted laser, chemical, or cleanroom assets reject reservations on the server unless verified training records exist.
                </p>

                {/* Simulated Verification Pipeline */}
                <div className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-[11px] space-y-2 mb-6">
                  <div className="flex items-center justify-between text-emerald-400 pb-1 border-b border-[#AD7257]/15">
                    <span>ISO Class 5 Cleanroom Gowning</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 pb-1 border-b border-[#AD7257]/15">
                    <span>Class IV High-Power Laser Safety</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center justify-between text-amber-400">
                    <span>Cryogenic Nitrogen Handling</span>
                    <span className="text-[10px] uppercase">Required</span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>AUTHORIZATION</span>
                <span className="text-[#D4FF00]">SERVER-SIDE ENFORCED</span>
              </div>
            </div>

            {/* Pillar 3: FairShare Queuing (Proportional Allocation Layout) */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#24110C] border border-[#AD7257]/30 flex items-center justify-center text-[#D4FF00] mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#F1E7DE] mb-2 tracking-tight">
                  FairShare Queuing
                </h3>
                <div className="text-xs font-mono text-[#D96335] uppercase tracking-wider mb-4">
                  Non-Monopolizing Scheduler
                </div>
                <p className="text-xs sm:text-sm text-[#D9C5B4] leading-relaxed mb-6">
                  Deterministic allocation scoring when resources are congested. Prevents hoarding, accounts for thesis deadlines, and provides clear waitlist visibility.
                </p>

                {/* Simulated Priority Allocation Bar */}
                <div className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-[11px] space-y-2.5 mb-6">
                  <div className="flex justify-between items-center text-[#A99A90]">
                    <span>Quota Consumption Meter:</span>
                    <span className="text-[#D4FF00] font-bold">18 / 40 hrs</span>
                  </div>
                  <div className="w-full bg-[#170D0A] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D4FF00] h-full w-[45%]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#A99A90] pt-1">
                    <span>Thesis Priority Multiplier:</span>
                    <span className="text-emerald-400 font-bold">1.4x Active</span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#A99A90] pt-4 border-t border-[#AD7257]/20 flex items-center justify-between">
                <span>SCHEDULER</span>
                <span className="text-[#D4FF00]">EXPLAINABLE QUEUE</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. SECTION G: FINAL CINEMATIC CALL TO ACTION */}
      <section className="py-36 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-[#120A08] to-[#090706] text-center relative overflow-hidden z-10 border-t border-[#AD7257]/20">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          
          <div className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4FF00] bg-[#D4FF00]/10 px-4 py-1.5 rounded-full border border-[#D4FF00]/25">
            IDLEX ARCHITECTURE • PRODUCTION READY
          </div>
          
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#F1E7DE] tracking-tight leading-[0.95]">
            NOTHING VALUABLE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F1E7DE] via-[#D96335] to-[#D4FF00]">
              SHOULD SIT IDLE.
            </span>
          </h2>
          
          <p className="text-base sm:text-xl text-[#D9C5B4] max-w-2xl mx-auto leading-relaxed font-light">
            Make existing resources work harder. Discover what is available around you across precision equipment, specialized spaces, and dedicated compute.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-8 py-4 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-2xl shadow-[#D4FF00]/25 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/match"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#170D0A] hover:bg-[#24110C] text-[#F1E7DE] px-8 py-4 rounded-full font-mono text-xs uppercase tracking-wider border border-[#AD7257]/30 hover:border-[#AD7257]/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4FF00]" />
              <span>Launch Match Engine</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-[#24110C]/40 text-[#D9C5B4] hover:text-[#F1E7DE] px-6 py-4 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
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
