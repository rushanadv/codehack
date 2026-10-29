'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Strictly protected: do not render on landing page
  if (pathname === '/') return null;

  return (
    <footer className="bg-[#11100F] border-t border-[#38312C] text-[#B8ADA0] py-14 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Purpose Column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#D69A49] rounded-xs" />
              <span className="font-sans font-bold text-base text-[#F3EADF] uppercase tracking-tight">
                IdleX<span className="text-[#B65E42]">.</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#B8ADA0]">
              Decentralized reservation protocol for high-value research assets, precision instrumentation, and compute allocations.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-[#B8ADA0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
              <span>SAMPLE DATA • DETERMINISTIC DEMO</span>
            </div>
          </div>

          {/* Column 2: Platform Architecture */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#F3EADF] mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-[#F3EADF] transition-colors">
                  Resource Directory
                </Link>
              </li>
              <li>
                <Link href="/match" className="hover:text-[#F3EADF] transition-colors">
                  Intent Matching Engine
                </Link>
              </li>
              <li>
                <Link href="/incidents" className="hover:text-[#F3EADF] transition-colors">
                  Promise Protection Network
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="hover:text-[#F3EADF] transition-colors">
                  FairShare Queue Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resource Taxonomy */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#F3EADF] mb-3">Taxonomy</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore?category=space" className="hover:text-[#F3EADF] transition-colors">
                  Controlled Spaces & Cleanrooms
                </Link>
              </li>
              <li>
                <Link href="/explore?category=equipment" className="hover:text-[#F3EADF] transition-colors">
                  Physical Instruments & Metrology
                </Link>
              </li>
              <li>
                <Link href="/explore?category=digital" className="hover:text-[#F3EADF] transition-colors">
                  Digital & High-Performance Compute
                </Link>
              </li>
              <li>
                <Link href="/overview" className="hover:text-[#F3EADF] transition-colors">
                  Exchange Narrative
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Mission */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#F3EADF] mb-3">Documentation</h4>
            <p className="text-xs leading-relaxed text-[#B8ADA0] mb-3">
              Explore the mathematical architecture behind ACID buffer locking, SkillGate credential verification, and autonomous collision rerouting.
            </p>
            <Link
              href="/overview"
              className="inline-flex items-center gap-1 text-xs text-[#B65E42] hover:text-[#C86C4E] font-medium transition-colors"
            >
              <span>Read Architecture Overview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#38312C]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#B8ADA0] font-mono">
          <div>
            IdleX Protocol v2.6 • High-Integrity Resource Exchange
          </div>
          <div>
            Synthetic Demo Environment • No real facilities or affiliations implied
          </div>
        </div>
      </div>
    </footer>
  );
}
