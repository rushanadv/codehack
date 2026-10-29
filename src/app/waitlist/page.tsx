'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { WaitlistEntry } from '@/lib/types';

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fairshare/waitlist');
      const data = await res.json();
      setWaitlist(data.waitlist || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#344438]">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#82996D]">
          <TrendingUp className="w-3.5 h-3.5 text-[#A9BE89]" />
          <span>FairShare Allocation Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F0E5] tracking-tight">
          Resource Contention Queue
        </h1>
        <p className="text-xs text-[#7E8D77] mt-1.5 max-w-2xl leading-relaxed">
          When high-demand instruments experience slot contention, FairShare deterministically schedules queue positions based on safety verification, departmental quotas, thesis priority, and submission timing.
        </p>
      </div>

      {/* Explanatory Policy Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-3 font-mono text-xs shadow-sm">
        <div className="text-[#F1F0E5] font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#82996D]" />
          Deterministic FairShare Scheduling Policy
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[#B7C2B1] font-sans text-xs">
          <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438]">
            <span className="text-[#F1F0E5] font-medium font-mono text-[11px]">1. Hard Safety Gate:</span>
            <p className="mt-0.5 text-[#7E8D77]">Unverified applicants are permanently rejected before queuing occurs.</p>
          </div>
          <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438]">
            <span className="text-[#F1F0E5] font-medium font-mono text-[11px]">2. Priority Weighting:</span>
            <p className="mt-0.5 text-[#7E8D77]">Verified research and production deadlines receive priority scoring adjustments.</p>
          </div>
          <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438]">
            <span className="text-[#F1F0E5] font-medium font-mono text-[11px]">3. Anti-Hoarding Throttle:</span>
            <p className="mt-0.5 text-[#7E8D77]">Accounts with 2+ active bookings receive an incremental penalty per concurrent session.</p>
          </div>
          <div className="p-3 bg-[#0D1812] rounded-lg border border-[#344438]">
            <span className="text-[#F1F0E5] font-medium font-mono text-[11px]">4. Automatic Promotion:</span>
            <p className="mt-0.5 text-[#7E8D77]">Upon cancellation or alternative rerouting, position #1 is instantly offered the slot.</p>
          </div>
        </div>
      </div>

      {/* Waitlist Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#344438]">
          <span className="text-[#B7C2B1] font-medium uppercase tracking-wider">Active Queue Entries ({waitlist.length})</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
            Querying FairShare Allocations...
          </div>
        ) : waitlist.length === 0 ? (
          <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-[#7E8D77] text-xs">
            No active waitlist entries. All instrument slots currently have nominal queue clearance.
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-xl bg-[#17251B] border border-[#344438] hover:border-[#4A5F4F] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#82996D]/20 text-[#A9BE89] border border-[#82996D]/40">
                      QUEUE POSITION: #{entry.queue_position}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#203025] text-[#C7BC91] border border-[#344438]">
                      Priority Score: {entry.priority_score} / 100
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F1F0E5]">
                    {entry.resource_title || 'Target Asset'}
                  </h3>

                  <p className="text-xs text-[#B7C2B1] leading-relaxed">
                    {entry.notes || 'Contested slot under FairShare allocation schedule.'}
                  </p>

                  <div className="text-[11px] font-mono text-[#7E8D77]">
                    Requested Slot: {new Date(entry.requested_start).toLocaleString()} – {new Date(entry.requested_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/resources/${entry.resource_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] border border-[#344438] hover:border-[#82996D] rounded-lg text-xs font-mono transition-colors"
                  >
                    <span>Inspect Asset</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#7E8D77]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
