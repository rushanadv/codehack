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
  UserCheck
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
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-8 border-b border-white/8">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
          <TrendingUp className="w-4 h-4" />
          <span>FairShare™ Allocation Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transparent Waiting-List Queues
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          When high-demand instruments experience slot contention, FairShare deterministically schedules queue positions based on safety verification, departmental quotas, thesis priority, and submission timing.
        </p>
      </div>

      {/* Explanatory Policy Card */}
      <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-3 font-mono text-xs text-neutral-300">
        <div className="text-white font-bold text-sm uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
          Deterministic FairShare Scheduling Policy
        </div>
        <p className="font-sans text-neutral-400 text-xs leading-relaxed">
          1. Hard Safety Gate: Unverified applicants are permanently rejected before queuing occurs.<br />
          2. Academic Priority Weighting: Master & PhD Thesis projects receive a +25 priority score boost.<br />
          3. Anti-Hoarding Throttle: Accounts with 2+ concurrent active bookings receive an incremental penalty of -10 per session.<br />
          4. Automatic Promotion: Upon cancellation or Promise Protection alternative rerouting, position #1 is instantly offered the slot.
        </p>
      </div>

      {/* Waitlist Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-white/10">
          <span className="text-white font-bold uppercase">Active Queue Entries ({waitlist.length})</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Querying FairShare Allocations...
          </div>
        ) : waitlist.length === 0 ? (
          <div className="p-8 text-center bg-[#0D0F14] rounded-xl border border-white/8 text-neutral-400 text-xs">
            No active waitlist entries. All instrument slots currently have nominal queue clearance.
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-tech bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-bold">
                      QUEUE POSITION: #{entry.queue_position}
                    </span>
                    <span className="badge-tech bg-white/10 text-neutral-300 font-mono">
                      Priority Score: {entry.priority_score} / 100
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">
                    {entry.resource_title || 'Target Asset'}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    {entry.notes || 'Contested slot under FairShare allocation schedule.'}
                  </p>

                  <div className="text-[11px] font-mono text-neutral-500 pt-1">
                    Requested Slot: {new Date(entry.requested_start).toLocaleString()} – {new Date(entry.requested_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/resources/${entry.resource_id}`}
                    className="px-3.5 py-1.5 bg-[#151921] hover:bg-white/10 text-neutral-200 rounded text-xs font-mono uppercase border border-white/10"
                  >
                    Inspect Asset →
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
