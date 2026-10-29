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
    <div className="bg-[#140F0D] border-2 border-[#AD7257]/40 rounded-xl overflow-hidden">
      
      {/* Dynamic Status Beacon Ribbon */}
      <div className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
        simulationResult?.riskLevel === 'critical'
          ? 'bg-[#B91C1C] text-white'
          : simulationResult?.riskLevel === 'moderate'
          ? 'bg-[#D95927] text-white'
          : 'bg-[#15803D] text-white'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white" />
          <span>
            {simulationResult?.riskLevel === 'critical'
              ? 'CRITICAL DEFICIT DETECTED // TURNAROUND BUFFER BREACHED'
              : simulationResult?.riskLevel === 'moderate'
              ? 'WARNING // TURNAROUND BUFFER CONSUMPTION ACTIVE'
              : 'SYSTEM HEALTH: NOMINAL // +30m RECOVERY BUFFER ACTIVE'}
          </span>
        </div>
        <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">
          REAL DB TRANSACTION
        </span>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#AD7257]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
              <span className="bg-[#B53F1E] text-white font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                SIGNATURE RECOVERY ENGINE
              </span>
              <span className="text-[#A99A90] uppercase tracking-wider">
                LIVE STATE MACHINE
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#F1E7DE] tracking-tight">
              Promise Protection™ Disruption Console
            </h3>
            <p className="text-xs text-[#D9C5B4] max-w-2xl mt-1 leading-relaxed">
              Simulate an active equipment overrun. Observe real-time turnaround buffer consumption, cascading collision mitigation, and deterministic autonomous rerouting.
            </p>
          </div>

          {/* Target telemetry badge */}
          <div className="flex items-center gap-2 bg-[#1C1411] px-3.5 py-2 rounded-md border border-[#AD7257]/30 text-xs font-mono">
            <span className="w-2 h-2 bg-[#D4FF00]"></span>
            <span className="text-[#F1E7DE] font-bold">TARGET: Stratasys Fortus 450mc</span>
          </div>
        </div>

        {/* Visual Timeline Schema */}
        <div className="bg-[#1C1411] p-5 rounded-lg border border-[#AD7257]/30">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#A99A90] mb-3 flex items-center justify-between">
            <span>Cascading Reservation Timeline</span>
            <span className="text-[#D4FF00] font-bold">Mandatory Buffer: 30 mins</span>
          </div>

          {/* Timeline track */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* User A Slot */}
            <div className="bg-[#261A15] p-4 rounded-md border border-[#AD7257]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D95927] mb-1 font-bold">
                  <span>ACTIVE RUN (USER A)</span>
                  <span className="bg-[#B53F1E] text-white px-1.5 py-0.5 rounded text-[10px]">In Progress</span>
                </div>
                <div className="font-bold text-[#F1E7DE] text-sm">Dev Patel</div>
                <div className="text-[#D9C5B4] text-[11px] mt-0.5">Titanium Gripper Milling</div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#AD7257]/20 font-mono text-[10px] flex justify-between">
                <span className="text-[#A99A90]">Scheduled End: 14:30</span>
                <span className={simulationResult ? 'text-rose-400 font-bold' : 'text-[#D9C5B4]'}>
                  {simulationResult ? `Overrun: +${simulationResult.disruption.delay_duration_minutes}m` : 'On Time'}
                </span>
              </div>
            </div>

            {/* Turnaround Buffer */}
            <div className={`p-4 rounded-md border flex flex-col justify-between transition-colors ${
              simulationResult?.riskLevel === 'critical'
                ? 'bg-[#3B1212] border-rose-600 text-white'
                : simulationResult?.riskLevel === 'moderate'
                ? 'bg-[#3D1E10] border-[#D95927] text-white'
                : 'bg-[#1C1411] border-[#AD7257]/40 text-[#A99A90]'
            }`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-[#D9C5B4]">
                  <span className="font-bold">BUFFER CLEARANCE</span>
                  <Clock className="w-3.5 h-3.5 text-[#D4FF00]" />
                </div>
                <div className="font-bold text-[#F1E7DE] text-sm">30 Min Quarantine Window</div>
                <div className="text-[11px] mt-0.5 opacity-80 text-[#D9C5B4]">Nozzle purge, cooling & sanitize</div>
              </div>
              <div className="mt-3 pt-2 border-t border-current/20 font-mono text-[10px] flex justify-between">
                <span>Window: 14:30 – 15:00</span>
                <span className="font-bold text-white">
                  {simulationResult ? `Slack: ${simulationResult.slackMinutes}m` : 'Nominal (Safe)'}
                </span>
              </div>
            </div>

            {/* User B Slot */}
            <div className="bg-[#261A15] p-4 rounded-md border border-[#AD7257]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D9C5B4] mb-1">
                  <span className="font-bold">NEXT RESERVATION (USER B)</span>
                  <span className="bg-[#140F0D] px-1.5 py-0.5 rounded text-[10px] border border-[#AD7257]/40 text-[#D4FF00] font-bold">Confirmed</span>
                </div>
                <div className="font-bold text-[#F1E7DE] text-sm">Anya Sharma</div>
                <div className="text-[#D9C5B4] text-[11px] mt-0.5">Biocompatible Scaffold Print</div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#AD7257]/20 font-mono text-[10px] flex justify-between">
                <span className="text-[#A99A90]">Start: 15:00</span>
                <span className={resolvedStatus ? 'text-[#D4FF00] font-bold' : simulationResult?.riskLevel === 'critical' ? 'text-rose-400 font-bold' : 'text-[#D9C5B4]'}>
                  {resolvedStatus ? 'REROUTED' : simulationResult?.riskLevel === 'critical' ? 'COLLISION RISK' : 'Queued'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1C1411] rounded-lg border border-[#AD7257]/30 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#D9C5B4] uppercase">Select Overrun:</span>
            <div className="flex items-center gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                    delayMinutes === mins
                      ? 'bg-[#D4FF00] text-black border border-[#D4FF00]'
                      : 'bg-[#140F0D] text-[#D9C5B4] hover:text-white border border-[#AD7257]/40'
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
            className="flex items-center gap-2 bg-[#D95927] hover:bg-[#E56A3A] text-white px-5 py-2.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#D95927] active:translate-y-0.5"
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
          <div className="space-y-4 pt-2">
            <div className={`p-4 rounded-lg border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              simulationResult.riskLevel === 'critical'
                ? 'bg-[#2D0F0F] border-rose-600 text-white'
                : simulationResult.riskLevel === 'moderate'
                ? 'bg-[#33180D] border-[#D95927] text-white'
                : 'bg-[#0E2416] border-emerald-600 text-white'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                  simulationResult.riskLevel === 'critical' ? 'text-rose-400' : 'text-[#D95927]'
                }`} />
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider font-bold">
                    {simulationResult.riskLevel.toUpperCase()} RISK DETECTED
                  </div>
                  <div className="text-xs mt-1 leading-relaxed text-[#F1E7DE]">
                    {simulationResult.explanation}
                  </div>
                </div>
              </div>

              <div className="font-mono text-[11px] shrink-0 bg-black/50 px-3 py-1.5 rounded-md border border-white/20 text-white">
                DISRUPTION ID: {simulationResult.disruption.id}
              </div>
            </div>

            {/* Alternative Suggestion Box */}
            {simulationResult.suggestedAlternative && (
              <div className="bg-[#1C1411] p-5 rounded-lg border-2 border-[#D4FF00] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#D4FF00] text-black flex items-center justify-center shrink-0 font-bold">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4FF00] font-bold">
                      Autonomous Re-Route Recommendation
                    </div>
                    <div className="text-base font-bold text-white">
                      {simulationResult.suggestedAlternative.title}
                    </div>
                    <div className="text-xs text-[#D9C5B4] mt-0.5 font-mono">
                      Location: {simulationResult.suggestedAlternative.location} • Status: Available • Rate: ₹{simulationResult.suggestedAlternative.hourly_rate}/hr
                    </div>
                  </div>
                </div>

                {!resolvedStatus ? (
                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5"
                  >
                    {isResolving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <GitPullRequestDraft className="w-3.5 h-3.5" />
                    )}
                    Execute Automated Re-Route
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-black font-mono font-bold bg-[#D4FF00] px-4 py-2 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    {resolvedStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
