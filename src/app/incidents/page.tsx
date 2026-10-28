'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  GitPullRequestDraft, 
  RefreshCw, 
  Sparkles,
  Zap
} from 'lucide-react';
import { InteractiveDelaySimulator } from '@/components/InteractiveDelaySimulator';
import { DisruptionEvent } from '@/lib/types';

export default function IncidentsPage() {
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDisruptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/promise-protection');
      const data = await res.json();
      setDisruptions(data.disruptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisruptions();
  }, []);

  const handleResolve = async (disruptionId: string, action: string) => {
    setResolvingId(disruptionId);
    try {
      const res = await fetch('/api/promise-protection/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disruptionId,
          resolutionAction: action,
          notes: 'Resolved via Promise Protection Operations Console'
        })
      });

      if (res.ok) {
        fetchDisruptions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="pb-8 border-b border-white/8">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Promise Protection™ Disruption Intelligence Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Incident Response & Disruption Management
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Autonomous buffer calculations, cascading collision alarms, and real-time alternative resource rerouting to eliminate downstream reservation failure.
        </p>
      </div>

      {/* Simulator Section */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4FF00]" />
          <span>Interactive Disruption Simulator (Live ACID State Machine)</span>
        </div>
        <InteractiveDelaySimulator />
      </div>

      {/* Logged Disruption Incidents from Database */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-white/10">
          <span className="text-white font-bold uppercase tracking-wider">
            Active & Resolved Disruption Records ({disruptions.length})
          </span>
          <button
            onClick={fetchDisruptions}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Log
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Loading Incident Audit Registry...
          </div>
        ) : disruptions.length === 0 ? (
          <div className="p-8 text-center bg-[#0D0F14] rounded-xl border border-white/8 text-neutral-400 text-xs">
            No disruption events logged. Trigger a delay above to generate a live incident.
          </div>
        ) : (
          <div className="space-y-4">
            {disruptions.map((d) => (
              <div
                key={d.id}
                className={`p-6 rounded-xl border transition-all ${
                  d.resolved_at
                    ? 'bg-[#0A0C10] border-white/5 opacity-80'
                    : d.risk_level === 'critical'
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-amber-500/5 border-amber-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="badge-tech bg-white/10 text-neutral-300 font-mono">
                        {d.id}
                      </span>
                      <span className={`badge-tech ${
                        d.risk_level === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        d.risk_level === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {d.risk_level.toUpperCase()}
                      </span>
                      {d.resolved_at && (
                        <span className="badge-tech bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">
                      Delay on {d.delayed_resource_title || 'Target Asset'} (+{d.delay_duration_minutes}m overrun)
                    </h3>

                    <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl font-sans">
                      Turnaround Buffer: {d.buffer_minutes}m. 
                      {d.affected_user_name ? ` Downstream reservation for ${d.affected_user_name} flagged at risk.` : ' No downstream collision.'}
                    </p>

                    {d.notes && (
                      <div className="text-[11px] font-mono text-neutral-400 bg-black/40 p-2.5 rounded border border-white/5">
                        Log Notes: {d.notes}
                      </div>
                    )}

                    {d.suggested_alternative_title && (
                      <div className="text-xs font-mono text-[#D4FF00] flex items-center gap-1.5 pt-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Autonomous Reroute Recommendation: {d.suggested_alternative_title}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col md:items-end justify-between self-stretch">
                    <div className="text-[11px] font-mono text-neutral-500">
                      Logged: {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {!d.resolved_at && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        {d.suggested_alternative_resource_id && (
                          <button
                            onClick={() => handleResolve(d.id, 'reroute_alternative')}
                            disabled={resolvingId === d.id}
                            className="px-3.5 py-1.5 bg-[#D4FF00] hover:bg-[#C2EA00] text-black rounded font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
                          >
                            {resolvingId === d.id ? 'Executing...' : 'Re-Route Alternative'}
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(d.id, 'override_buffer')}
                          disabled={resolvingId === d.id}
                          className="px-3.5 py-1.5 bg-[#151921] hover:bg-white/10 text-neutral-200 rounded font-mono text-xs uppercase border border-white/10 transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

