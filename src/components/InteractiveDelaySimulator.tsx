'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  RefreshCw,
  GitPullRequestDraft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export function InteractiveDelaySimulator() {
  const [delayMinutes, setDelayMinutes] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setResolvedStatus(null);
    try {
      const res = await fetch('/api/promise-protection/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'bkg-live-dev',
          delayMinutes,
          reason: 'Extended thermal stabilization during titanium-reinforced gripper prototype run'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.result);
      } else {
        alert(data.error || 'Simulation failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!simulationResult?.disruption?.id) return;
    setIsResolving(true);
    try {
      const res = await fetch('/api/promise-protection/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disruptionId: simulationResult.disruption.id,
          resolutionAction: 'reroute_alternative',
          notes: 'Executed automated zero-friction re-route to Markforged X7 Carbon Fiber in Bay 106'
        })
      });
      const data = await res.json();
      if (data.success) {
        setResolvedStatus('Re-route executed in database. Downstream collision eliminated.');
      } else {
        alert(data.error || 'Resolution failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-[#0B0D12] border border-white/15 rounded-xl p-6 lg:p-8 relative overflow-hidden shadow-2xl">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-grid-tech opacity-40 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-tech bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3" />
              Signature Feature Demonstration
            </span>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              Live ACID State Machine
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Promise Protection™ Disruption Engine
          </h3>
          <p className="text-xs text-neutral-400 max-w-2xl mt-1 leading-relaxed">
            Simulate a real overrun on an active reservation. Watch the engine compute turnaround buffer clearance, detect downstream collision risks, dispatch automated notifications, and synthesize alternative asset routes.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 bg-[#12151B] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse"></span>
          <span className="text-white font-medium">TARGET: Stratasys Fortus 450mc</span>
        </div>
      </div>

      {/* Visual Timeline Schema */}
      <div className="relative z-10 my-6 bg-[#12151B]/80 p-5 rounded-lg border border-white/8">
        <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
          <span>Cascading Reservation Timeline</span>
          <span className="text-[#D4FF00]">Mandatory Turnaround Buffer: 30 mins</span>
        </div>

        {/* Timeline track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* User A Slot */}
          <div className="bg-[#171C26] p-3.5 rounded border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 mb-1">
                <span>ACTIVE SESSION (USER A)</span>
                <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-[10px]">In Progress</span>
              </div>
              <div className="font-semibold text-white">Dev Patel</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Robotic Gripper Prototyping</div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 font-mono text-[10px] text-neutral-400 flex justify-between">
              <span>Scheduled End: 14:30</span>
              <span className={simulationResult ? 'text-red-400 font-bold' : ''}>
                {simulationResult ? `Overrun: +${simulationResult.disruption.delay_duration_minutes}m` : 'On Time'}
              </span>
            </div>
          </div>

          {/* Turnaround Buffer */}
          <div className={`p-3.5 rounded border flex flex-col justify-between transition-colors ${
            simulationResult?.riskLevel === 'critical'
              ? 'bg-red-500/10 border-red-500/40 text-red-300'
              : simulationResult?.riskLevel === 'moderate'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-[#171C26] border-white/10 text-neutral-400'
          }`}>
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span>BUFFER CLEARANCE</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="font-semibold text-white">30 Min Quarantine Window</div>
              <div className="text-[11px] mt-0.5 opacity-80">Nozzle purge, cooling & sanitize</div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 font-mono text-[10px] flex justify-between">
              <span>Window: 14:30 – 15:00</span>
              <span className="font-bold">
                {simulationResult ? `Slack: ${simulationResult.slackMinutes}m` : 'Nominal'}
              </span>
            </div>
          </div>

          {/* User B Slot */}
          <div className="bg-[#171C26] p-3.5 rounded border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 mb-1">
                <span>NEXT RESERVATION (USER B)</span>
                <span className="bg-purple-500/20 px-1.5 py-0.5 rounded text-[10px]">Confirmed</span>
              </div>
              <div className="font-semibold text-white">Anya Sharma</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Biocompatible Scaffold Print</div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 font-mono text-[10px] text-neutral-400 flex justify-between">
              <span>Start: 15:00</span>
              <span className={resolvedStatus ? 'text-[#D4FF00]' : simulationResult?.riskLevel === 'critical' ? 'text-red-400 font-bold' : ''}>
                {resolvedStatus ? 'Rerouted' : simulationResult?.riskLevel === 'critical' ? 'COLLISION' : 'Queued'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 bg-[#151921] rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-300">Select Delay Overrun:</span>
          <div className="flex items-center gap-1.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setDelayMinutes(mins)}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  delayMinutes === mins
                    ? 'bg-[#D4FF00] text-black font-bold shadow-md shadow-[#D4FF00]/20'
                    : 'bg-[#0E1117] text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                +{mins} mins
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4FF00]/15"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Calculating Impact...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Simulate Disruption in Real DB
            </>
          )}
        </button>
      </div>

      {/* Real-time Calculation Result Output */}
      {simulationResult && (
        <div className="relative z-10 mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            simulationResult.riskLevel === 'critical'
              ? 'bg-red-500/10 border-red-500/40 text-red-200'
              : simulationResult.riskLevel === 'moderate'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                simulationResult.riskLevel === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div>
                <div className="font-mono text-xs uppercase tracking-wider font-bold">
                  {simulationResult.riskLevel.toUpperCase()} RISK DETECTED
                </div>
                <div className="text-xs mt-1 leading-relaxed">
                  {simulationResult.explanation}
                </div>
              </div>
            </div>

            <div className="font-mono text-[11px] shrink-0 bg-black/40 px-3 py-1.5 rounded border border-white/10">
              DISRUPTION ID: {simulationResult.disruption.id}
            </div>
          </div>

          {/* Alternative Suggestion Box */}
          {simulationResult.suggestedAlternative && (
            <div className="bg-[#12151B] p-4 rounded-lg border border-[#D4FF00]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#D4FF00]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4FF00]">
                    Promise Protection Autonomous Re-Route Suggestion
                  </div>
                  <div className="text-sm font-bold text-white">
                    {simulationResult.suggestedAlternative.title}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Location: {simulationResult.suggestedAlternative.location} • Status: Available • Rate: ₹{simulationResult.suggestedAlternative.hourly_rate}/hr
                  </div>
                </div>
              </div>

              {!resolvedStatus ? (
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md shadow-[#D4FF00]/20"
                >
                  {isResolving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <GitPullRequestDraft className="w-3.5 h-3.5" />
                  )}
                  Execute Automated Re-Route
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#D4FF00] font-mono bg-[#D4FF00]/10 px-3 py-1.5 rounded border border-[#D4FF00]/30">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                  {resolvedStatus}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

