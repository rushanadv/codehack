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
    <div className="bg-[#17251B] border border-[#344438] rounded-xl overflow-hidden shadow-sm">
      
      {/* Status Beacon Header */}
      <div className={`px-5 py-2.5 text-xs font-mono font-medium flex items-center justify-between border-b ${
        isCritical
          ? 'bg-[#B84A39]/15 text-[#F1F0E5] border-[#B84A39]/40'
          : isModerate
          ? 'bg-[#C79A49]/15 text-[#F1F0E5] border-[#C79A49]/40'
          : 'bg-[#4E7A5D]/15 text-[#F1F0E5] border-[#4E7A5D]/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isCritical ? 'bg-[#B84A39]' : isModerate ? 'bg-[#C79A49]' : 'bg-[#4E7A5D]'
          }`} />
          <span>
            {isCritical
              ? 'CRITICAL DEFICIT DETECTED • BUFFER BREACHED'
              : isModerate
              ? 'WARNING • BUFFER CONSUMPTION ACTIVE'
              : 'SYSTEM HEALTH: NOMINAL • +30M BUFFER ACTIVE'}
          </span>
        </div>
        <span className="text-[11px] text-[#B7C2B1] hidden sm:inline">
          Live Operational Sandbox
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Intro */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#F1F0E5]">
            Simulate Upstream Session Delay
          </h3>
          <p className="text-xs text-[#B7C2B1] leading-relaxed">
            Test Slotly autonomous promise protection. Inject an overstay delay on an active reservation to observe buffer absorption and immediate alternative rerouting.
          </p>
        </div>

        {/* Delay Parameter Selector */}
        <div className="p-4 rounded-lg bg-[#203025] border border-[#344438] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#B7C2B1] uppercase text-[11px]">
              Simulated Delay Magnitude:
            </span>
            <span className="font-mono font-bold text-base text-[#C7BC91]">
              +{delayMinutes} Minutes
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
            className="w-full accent-[#82996D] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#7E8D77]">
            <span>10m (Buffer Absorbs)</span>
            <span>45m (Buffer Breach)</span>
            <span>120m (Severe Collision)</span>
          </div>
        </div>

        {/* 3 Step Process Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-[#203025] border border-[#344438] space-y-1">
            <div className="text-[10px] text-[#7E8D77] uppercase">1. Buffer Capacity</div>
            <div className="font-bold text-sm text-[#F1F0E5]">30 Minutes Enforced</div>
            <div className="text-[11px] text-[#B7C2B1]">Built into every session</div>
          </div>

          <div className={`p-3.5 rounded-lg border space-y-1 ${
            delayMinutes > 30 
              ? 'bg-[#B84A39]/15 border-[#B84A39]/40' 
              : 'bg-[#203025] border-[#344438]'
          }`}>
            <div className="text-[10px] text-[#7E8D77] uppercase">2. Net Deficit</div>
            <div className={`font-bold text-sm ${delayMinutes > 30 ? 'text-[#B84A39]' : 'text-[#A9BE89]'}`}>
              {delayMinutes > 30 ? `-${delayMinutes - 30}m Deficit` : 'Absorbed (0m)'}
            </div>
            <div className="text-[11px] text-[#B7C2B1]">
              {delayMinutes > 30 ? 'Overruns buffer threshold' : 'Within safety margins'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#203025] border border-[#344438] space-y-1">
            <div className="text-[10px] text-[#7E8D77] uppercase">3. Protection Action</div>
            <div className={`font-bold text-sm ${delayMinutes > 30 ? 'text-[#A9BE89]' : 'text-[#B7C2B1]'}`}>
              {delayMinutes > 30 ? 'Zero-Friction Reroute' : 'No Action Required'}
            </div>
            <div className="text-[11px] text-[#B7C2B1]">
              {delayMinutes > 30 ? 'Automatic matching bay' : 'Schedule intact'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] text-xs font-semibold px-4 py-2.5 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Collision Dynamics...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Disruption Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="mt-4 p-5 rounded-xl bg-[#203025] border border-[#344438] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#344438]">
              <span className="font-mono font-medium text-[#F1F0E5] uppercase flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-[#B84A39]' : 'text-[#C79A49]'}`} />
                <span>Collision Analysis: {simulationResult.riskLevel.toUpperCase()} RISK</span>
              </span>
              <span className="font-mono text-[11px] text-[#7E8D77]">
                ID: {simulationResult.disruption?.id || 'sim-test-01'}
              </span>
            </div>

            <p className="text-xs text-[#B7C2B1] leading-relaxed">
              {simulationResult.disruption?.description}
            </p>

            {/* Alternative Reroute Recommendation */}
            {simulationResult.recommendedAlternative && (
              <div className="p-4 rounded-lg bg-[#17251B] border border-[#82996D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#A9BE89] uppercase tracking-wider font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#82996D]" />
                    <span>Autonomous Fallback Solution</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#C7BC91] bg-[#203025] px-2 py-0.5 rounded border border-[#344438]">
                    100% Spec Compatible
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F0E5]">
                      {simulationResult.recommendedAlternative.title}
                    </h4>
                    <p className="text-xs text-[#B7C2B1] mt-0.5">
                      {simulationResult.recommendedAlternative.location} • Rate: ${simulationResult.recommendedAlternative.hourly_rate}/hr
                    </p>
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={isResolving || !!resolvedStatus}
                    className="shrink-0 bg-[#4E7A5D] hover:bg-[#5E9470] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResolving ? 'Executing...' : resolvedStatus ? 'Rerouted' : 'Accept & Execute Reroute'}
                  </button>
                </div>

                {resolvedStatus && (
                  <div className="p-2.5 rounded bg-[#4E7A5D]/20 border border-[#4E7A5D]/40 text-xs text-[#A9BE89] font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
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
