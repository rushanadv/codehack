'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, ShieldCheck, Activity, Terminal } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <footer className="bg-[#0D0706] border-t border-[#AD7257]/20 text-[#A99A90] py-16 px-4 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-[#24110C] border border-[#AD7257]/30 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#D4FF00] rounded-sm transform rotate-45"></div>
              </div>
              <span className="font-mono font-bold text-lg text-[#F1E7DE]">
                Idle<span className="text-[#D4FF00]">X</span>
              </span>
            </div>
            <p className="text-xs text-[#D9C5B4] leading-relaxed">
              Every idle resource has a purpose. Transforming underutilised equipment, spaces, and digital compute into verified collaborative research capital.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-[#D4FF00]">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping"></span>
              ALL SYSTEM NODES OPERATIONAL
            </div>
          </div>

          {/* Col 2: Core Platform */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#F1E7DE] mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-xs text-[#D9C5B4]">
              <li>
                <Link href="/explore" className="hover:text-[#D4FF00] transition-colors">
                  Resource Marketplace
                </Link>
              </li>
              <li>
                <Link href="/match" className="hover:text-[#D4FF00] transition-colors">
                  IdleX Match (Intent Engine)
                </Link>
              </li>
              <li>
                <Link href="/incidents" className="hover:text-[#D4FF00] transition-colors">
                  Promise Protection Network
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="hover:text-[#D4FF00] transition-colors">
                  FairShare Explainable Allocation
                </Link>
              </li>
              <li>
                <Link href="/owner/analytics" className="hover:text-[#D4FF00] transition-colors">
                  Idle Insights Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resource Categories */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#F1E7DE] mb-4">Taxonomy</h4>
            <ul className="space-y-2.5 text-xs text-[#D9C5B4]">
              <li>
                <Link href="/explore?category=equipment" className="hover:text-[#D4FF00] transition-colors">
                  Physical Equipment & Metrology
                </Link>
              </li>
              <li>
                <Link href="/explore?category=space" className="hover:text-[#D4FF00] transition-colors">
                  Cleanrooms & Robotics Arenas
                </Link>
              </li>
              <li>
                <Link href="/explore?category=digital" className="hover:text-[#D4FF00] transition-colors">
                  HPC Slurm Nodes & CAD Licenses
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#D4FF00] transition-colors">
                  SkillGate Safety Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Telemetry Box */}
          <div className="bg-[#170D0A] p-4 rounded-lg border border-[#AD7257]/25 font-mono text-[11px] space-y-2 text-[#A99A90]">
            <div className="text-[#F1E7DE] font-semibold flex items-center justify-between pb-1 border-b border-[#AD7257]/20">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#D4FF00]" />
                TELEMETRY
              </span>
              <span className="text-[#D4FF00]">WAL ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>DB Integrity:</span>
              <span className="text-[#F1E7DE]">ACID Atomic Locks</span>
            </div>
            <div className="flex justify-between">
              <span>Buffer Margin:</span>
              <span className="text-[#F1E7DE]">30–60 min auto</span>
            </div>
            <div className="flex justify-between">
              <span>Safety Verification:</span>
              <span className="text-[#F1E7DE]">SkillGate Protocol</span>
            </div>
            <div className="flex justify-between">
              <span>National Node:</span>
              <span className="text-[#F1E7DE]">IIT Bombay Fabric</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#AD7257]/15 flex flex-col md:flex-row items-center justify-between text-xs text-[#A99A90] gap-4">
          <div>
            © 2026 IdleX Technologies. Engineered for National Research & Innovation Competitions.
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>LATENCY: 0.8ms</span>
            <span>PROMISE: 100% AUDITABLE</span>
            <span className="text-[#D4FF00]">STATUS: PRODUCTION-READY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

