'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
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
          notes: 'Resolved via Promise Protection Console'
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#344438]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#82996D] uppercase tracking-wider mb-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#A9BE89]" />
          <span>Promise Protection Network • Operational Fault Tolerance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F0E5] tracking-tight">
          Incident Response & Disruption Management
        </h1>
        <p className="text-xs sm:text-sm text-[#B7C2B1] mt-1 max-w-2xl leading-relaxed">
          Autonomous turnaround buffer calculations, collision alarms, and zero-conflict alternative rerouting to guarantee downstream reservation reliability.
        </p>
      </div>

      {/* Simulator Section */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#7E8D77] flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#C7BC91]" />
          <span>Interactive Disruption Simulator</span>
        </div>
        <InteractiveDelaySimulator />
      </div>

      {/* Logged Disruption Incidents */}
      <div className="space-y-4 pt-4 border-t border-[#344438]">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#344438]">
          <span className="text-[#F1F0E5] font-mono font-medium uppercase tracking-wider">
            Incident Audit History ({disruptions.length})
          </span>
          <button
            onClick={fetchDisruptions}
            className="flex items-center gap-1.5 text-[#7E8D77] hover:text-[#F1F0E5] transition-colors cursor-pointer text-xs font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Log</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
            Loading Incident Audit Registry...
          </div>
        ) : disruptions.length === 0 ? (
          <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-[#7E8D77] text-xs">
            No disruption events logged. Trigger a delay above to generate a live incident.
          </div>
        ) : (
          <div className="space-y-3">
            {disruptions.map((d) => {
              const isResolved = !!d.resolved_at;
              const isCrit = d.risk_level === 'critical';

              return (
                <div
                  key={d.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-[#17251B] border-[#344438] opacity-80'
                      : isCrit
                      ? 'bg-[#17251B] border-[#B84A39]/60'
                      : 'bg-[#17251B] border-[#C79A49]/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#203025] border border-[#344438] text-[#B7C2B1]">
                          {d.id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                          isCrit ? 'bg-[#B84A39]/20 text-[#B84A39] border-[#B84A39]/40' :
                          d.risk_level === 'moderate' ? 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40' :
                          'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40'
                        }`}>
                          {d.risk_level.toUpperCase()}
                        </span>
                        {isResolved && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4E7A5D]/20 text-[#A9BE89] border border-[#4E7A5D]/40">
                            RESOLVED
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-[#F1F0E5]">
                        Delay on {d.delayed_resource_title || 'Target Asset'} (+{d.delay_duration_minutes}m overrun)
                      </h3>

                      <p className="text-xs text-[#B7C2B1] leading-relaxed max-w-2xl">
                        Turnaround Buffer: {d.buffer_minutes}m. 
                        {d.affected_user_name ? ` Downstream reservation for ${d.affected_user_name} flagged at risk.` : ' No downstream collision.'}
                      </p>

                      {d.notes && (
                        <div className="text-[11px] font-mono text-[#B7C2B1] bg-[#203025] p-2 rounded border border-[#344438]/60">
                          Log Notes: {d.notes}
                        </div>
                      )}

                      {d.suggested_alternative_title && (
                        <div className="text-xs font-mono text-[#C7BC91] flex items-center gap-1.5 pt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Reroute Recommendation: {d.suggested_alternative_title}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col md:items-end justify-between self-stretch">
                      <div className="text-[10px] font-mono text-[#7E8D77]">
                        Logged: {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {!isResolved && (
                        <div className="flex items-center gap-2 mt-3 md:mt-0">
                          {d.suggested_alternative_resource_id && (
                            <button
                              onClick={() => handleResolve(d.id, 'reroute_alternative')}
                              disabled={resolvingId === d.id}
                              className="px-3 py-1.5 bg-[#4E7A5D] hover:bg-[#5E9470] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                            >
                              {resolvingId === d.id ? 'Executing...' : 'Reroute Alternative'}
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(d.id, 'override_buffer')}
                            disabled={resolvingId === d.id}
                            className="px-3 py-1.5 bg-[#203025] hover:bg-[#293B2F] text-[#B7C2B1] hover:text-[#F1F0E5] rounded-md text-xs border border-[#344438] transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
