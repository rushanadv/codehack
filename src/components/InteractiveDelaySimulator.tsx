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

  const isCritical = simulationResult?.riskLevel === 'critical';
  const isModerate = simulationResult?.riskLevel === 'moderate';

  return (
    <div className="bg-[#191715] border border-[#38312C] rounded-xl overflow-hidden">
      
      {/* Status Beacon Header */}
      <div className={`px-5 py-2.5 text-xs font-mono font-medium flex items-center justify-between border-b ${
        isCritical
          ? 'bg-[#B84A39]/15 text-[#F3EADF] border-[#B84A39]/40'
          : isModerate
          ? 'bg-[#C68A3C]/15 text-[#F3EADF] border-[#C68A3C]/40'
          : 'bg-[#4E7A5D]/15 text-[#F3EADF] border-[#4E7A5D]/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isCritical ? 'bg-[#B84A39]' : isModerate ? 'bg-[#C68A3C]' : 'bg-[#4E7A5D]'
          }`} />
          <span>
            {isCritical
              ? 'CRITICAL DEFICIT DETECTED • BUFFER BREACHED'
              : isModerate
              ? 'WARNING • BUFFER CONSUMPTION ACTIVE'
              : 'SYSTEM HEALTH: NOMINAL • +30M BUFFER ACTIVE'}
          </span>
        </div>
        <span className="text-[10px] text-[#B8ADA0] font-mono">
          ACID STATE MACHINE
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Sub-Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#38312C] gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#F3EADF]">
              Disruption Simulation Console
            </h3>
            <p className="text-xs text-[#B8ADA0] max-w-2xl mt-0.5 leading-relaxed">
              Test an operational overrun on an active reservation. Observe buffer consumption and automatic zero-conflict rerouting.
            </p>
          </div>

          <div className="text-xs font-mono text-[#B8ADA0] bg-[#211E1B] px-3 py-1.5 rounded-md border border-[#38312C] self-start md:self-auto">
            Target: <span className="text-[#F3EADF] font-medium">Stratasys Fortus 450mc</span>
          </div>
        </div>

        {/* Visual Timeline Track */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono uppercase text-[#B8ADA0] flex items-center justify-between">
            <span>Cascading Reservation Timeline</span>
            <span className="text-[#D69A49]">Mandatory Buffer: 30 mins</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            {/* User A Slot */}
            <div className="bg-[#211E1B] p-4 rounded-lg border border-[#38312C] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D69A49] mb-1">
                  <span>ACTIVE SESSION (USER A)</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#C68A3C]/20 text-[#E0A85C] text-[10px]">In Progress</span>
                </div>
                <div className="font-semibold text-[#F3EADF] text-sm">Dev Patel</div>
                <div className="text-[#B8ADA0] text-xs mt-0.5">Titanium Gripper Milling</div>
              </div>
              <div className="pt-2 border-t border-[#38312C]/60 font-mono text-[11px] flex justify-between text-[#B8ADA0]">
                <span>Scheduled End: 14:30</span>
                <span className={simulationResult ? 'text-[#B84A39] font-medium' : 'text-[#B8ADA0]'}>
                  {simulationResult ? `Overrun: +${simulationResult.disruption.delay_duration_minutes}m` : 'On Schedule'}
                </span>
              </div>
            </div>

            {/* Turnaround Buffer */}
            <div className={`p-4 rounded-lg border flex flex-col justify-between space-y-3 transition-colors ${
              isCritical
                ? 'bg-[#B84A39]/10 border-[#B84A39]/50 text-[#F3EADF]'
                : isModerate
                ? 'bg-[#C68A3C]/10 border-[#C68A3C]/50 text-[#F3EADF]'
                : 'bg-[#211E1B] border-[#38312C] text-[#B8ADA0]'
            }`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-[#B8ADA0]">
                  <span>BUFFER WINDOW</span>
                  <Clock className="w-3.5 h-3.5 text-[#D69A49]" />
                </div>
                <div className="font-semibold text-[#F3EADF] text-sm">30 Min Sanitization Buffer</div>
                <div className="text-xs text-[#B8ADA0] mt-0.5">Nozzle purge, cooling & inspection</div>
              </div>
              <div className="pt-2 border-t border-[#38312C]/60 font-mono text-[11px] flex justify-between">
                <span className="text-[#B8ADA0]">Window: 14:30 – 15:00</span>
                <span className="font-medium text-[#F3EADF]">
                  {simulationResult ? `Slack: ${simulationResult.slackMinutes}m` : 'Nominal'}
                </span>
              </div>
            </div>

            {/* User B Slot */}
            <div className="bg-[#211E1B] p-4 rounded-lg border border-[#38312C] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#B8ADA0] mb-1">
                  <span>NEXT SESSION (USER B)</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#4E7A5D]/20 text-[#6BA87E] text-[10px]">Confirmed</span>
                </div>
                <div className="font-semibold text-[#F3EADF] text-sm">Anya Sharma</div>
                <div className="text-[#B8ADA0] text-xs mt-0.5">Biocompatible Scaffold Print</div>
              </div>
              <div className="pt-2 border-t border-[#38312C]/60 font-mono text-[11px] flex justify-between">
                <span className="text-[#B8ADA0]">Start: 15:00</span>
                <span className={resolvedStatus ? 'text-[#6BA87E] font-medium' : isCritical ? 'text-[#B84A39] font-medium' : 'text-[#B8ADA0]'}>
                  {resolvedStatus ? 'REROUTED' : isCritical ? 'COLLISION DEFICIT' : 'Queued'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#211E1B] rounded-lg border border-[#38312C] text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-[#B8ADA0] font-mono text-[11px]">Select Overrun:</span>
            <div className="flex items-center gap-1.5">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                    delayMinutes === mins
                      ? 'bg-[#B65E42] text-white border-[#B65E42]'
                      : 'bg-[#191715] text-[#B8ADA0] border-[#38312C] hover:text-[#F3EADF]'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-[#B65E42] hover:bg-[#C86C4E] text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Delay</span>
              </>
            )}
          </button>
        </div>

        {/* Simulation Result Output */}
        {simulationResult && (
          <div className="space-y-3 pt-2">
            <div className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
              isCritical
                ? 'bg-[#B84A39]/10 border-[#B84A39]/40'
                : isModerate
                ? 'bg-[#C68A3C]/10 border-[#C68A3C]/40'
                : 'bg-[#4E7A5D]/10 border-[#4E7A5D]/40'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isCritical ? 'text-[#B84A39]' : 'text-[#C68A3C]'
                }`} />
                <div>
                  <div className="font-semibold text-[#F3EADF]">
                    {simulationResult.riskLevel.toUpperCase()} RISK DETECTED
                  </div>
                  <div className="text-[#B8ADA0] mt-0.5 leading-relaxed text-xs">
                    {simulationResult.explanation}
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] shrink-0 text-[#B8ADA0] bg-[#191715] px-2.5 py-1 rounded border border-[#38312C]">
                ID: {simulationResult.disruption.id}
              </div>
            </div>

            {/* Alternative Suggestion Box */}
            {simulationResult.suggestedAlternative && (
              <div className="bg-[#211E1B] p-4 sm:p-5 rounded-lg border border-[#B65E42] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#B65E42]/20 text-[#D69A49] flex items-center justify-center shrink-0 border border-[#B65E42]/40">
                    <Sparkles className="w-4 h-4 text-[#B65E42]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#D69A49] font-medium">
                      Zero-Conflict Alternative Recommended
                    </div>
                    <div className="text-sm font-semibold text-[#F3EADF]">
                      {simulationResult.suggestedAlternative.title}
                    </div>
                    <div className="text-xs text-[#B8ADA0] mt-0.5">
                      Location: {simulationResult.suggestedAlternative.location} • Status: Available • Rate: ${simulationResult.suggestedAlternative.hourly_rate}/hr
                    </div>
                  </div>
                </div>

                {!resolvedStatus ? (
                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    className="inline-flex items-center gap-1.5 bg-[#4E7A5D] hover:bg-[#5E9470] text-white px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isResolving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <GitPullRequestDraft className="w-3.5 h-3.5" />
                    )}
                    <span>Execute Autonomous Reroute</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#6BA87E] font-medium bg-[#4E7A5D]/15 px-3 py-1.5 rounded-md border border-[#4E7A5D]/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{resolvedStatus}</span>
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
