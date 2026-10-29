'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Send, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { MatchResultItem } from '@/lib/match';

export default function MatchPage() {
  const [prompt, setPrompt] = useState(
    'I need an industrial 3D printer for a carbon fiber aerospace prototype run tomorrow afternoon. My budget is ₹400/hr and I have completed the required safety training.'
  );
  const [maxBudget, setMaxBudget] = useState('');
  const [category, setCategory] = useState<'equipment' | 'space' | 'digital' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [hasQueried, setHasQueried] = useState(false);

  const samplePrompts = [
    'I need an industrial 3D printer for a carbon fiber aerospace prototype run tomorrow afternoon. My budget is ₹400/hr and I have completed the required safety training.',
    'Need high-speed camera capturing at least 120fps for supersonic vortex tracking. Budget ₹900.',
    'Require ISO Class 5 cleanroom bay for photolithography SU-8 resist spin coating.',
    'High performance multi-GPU Slurm cluster node for training transformer models under ₹300/hr.'
  ];

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setHasQueried(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxBudget: maxBudget || undefined,
          category
        })
      });

      const data = await res.json();
      setResults(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="pb-8 border-b border-[#AD7257]/20">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IdleX Match™ Intent Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F1E7DE] tracking-tight">
          Intelligent Resource Recommendations
        </h1>
        <p className="text-sm text-[#D9C5B4] mt-1 max-w-2xl leading-relaxed">
          Describe your experimental or prototyping requirements in plain language. The engine combines semantic matching with strict SkillGate safety gating and real-time buffer availability.
        </p>
      </div>

      {/* Input Section */}
      <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/30 shadow-2xl">
        <form onSubmit={handleMatch} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I need an industrial 3D printer near my department tomorrow afternoon for an engineering project..."
              className="w-full bg-[#24110C] text-[#F1E7DE] p-4 rounded-xl border border-[#AD7257]/30 text-sm focus:outline-none focus:border-[#D4FF00] font-sans leading-relaxed resize-none shadow-inner"
            />
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-[#A99A90] uppercase">Presets:</span>
            {samplePrompts.map((s, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setPrompt(s)}
                className="text-[11px] font-mono bg-[#24110C] hover:bg-[#2F1711] text-[#D9C5B4] hover:text-[#F1E7DE] px-3 py-1.5 rounded-lg border border-[#AD7257]/25 transition-colors cursor-pointer text-left truncate max-w-[280px]"
              >
                Preset {idx + 1}: {s.slice(0, 35)}...
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#AD7257]/20">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-[#24110C] px-3.5 py-2 rounded-xl border border-[#AD7257]/25 text-xs font-mono">
                <span className="text-[#A99A90]">Max ₹/hr:</span>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Auto"
                  className="w-16 bg-transparent text-[#F1E7DE] focus:outline-none text-xs"
                />
              </div>

              <select
                value={category || ''}
                onChange={(e) => setCategory((e.target.value as any) || undefined)}
                className="bg-[#24110C] text-[#D9C5B4] px-3.5 py-2 rounded-xl border border-[#AD7257]/25 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="equipment">Equipment Only</option>
                <option value="space">Spaces Only</option>
                <option value="digital">Digital Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4FF00]/15"
            >
              {isLoading ? 'Synthesizing Matches...' : 'Execute Match Engine'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-12 space-y-6">
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xs font-mono text-[#A99A90] uppercase tracking-widest">
              Evaluating SkillGate Qualifications & Proximity Scoring...
            </div>
          </div>
        )}

        {!isLoading && hasQueried && results.length === 0 && (
          <div className="p-8 text-center bg-[#170D0A] rounded-2xl border border-[#AD7257]/25 text-[#D9C5B4]">
            No matching resources met the threshold.
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-[#A99A90]">
              <span>RANKED RECOMMENDATIONS ({results.length} CANDIDATES)</span>
              <span className="text-[#D4FF00]">HARD SAFETY GATING APPLIED</span>
            </div>

            {results.map((item, idx) => (
              <div
                key={item.resource.id}
                className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                  item.isRecommended
                    ? 'bg-[#1C0F0B] border-[#D4FF00]/45 shadow-2xl'
                    : 'bg-[#170D0A] border-[#AD7257]/25 opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  {/* Left: Thumbnail & Main info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={item.resource.image_url}
                      alt={item.resource.title}
                      className="w-24 h-24 rounded-xl object-cover border border-[#AD7257]/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge-tech bg-[#24110C] text-[#D9C5B4] border border-[#AD7257]/25 font-mono">
                          {item.resource.subcategory}
                        </span>
                        {item.isRecommended && (
                          <span className="badge-tech bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40 font-mono">
                            TOP MATCH
                          </span>
                        )}
                        {!item.isEligible && (
                          <span className="badge-tech bg-red-500/20 text-red-400 border border-red-500/40 font-mono">
                            SKILLGATE BLOCKED
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#F1E7DE] hover:text-[#D4FF00] transition-colors">
                        <Link href={`/resources/${item.resource.id}`}>
                          {item.resource.title}
                        </Link>
                      </h3>

                      <div className="text-xs text-[#A99A90] mt-1 font-mono">
                        {item.resource.building}, {item.resource.room} ({item.resource.location})
                      </div>

                      {/* Explainable match statement */}
                      <p className="text-xs text-[#D9C5B4] mt-3 p-3.5 rounded-xl bg-[#24110C] border border-[#AD7257]/20 leading-relaxed font-sans">
                        <span className="font-mono text-[#D4FF00] text-[10px] uppercase block mb-1">Match Rationale:</span>
                        {item.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Right: Score Breakdown & CTA */}
                  <div className="shrink-0 flex flex-col md:items-end justify-between self-stretch">
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-[#A99A90]">Compatibility Score</div>
                      <div className="text-3xl font-extrabold font-mono text-[#F1E7DE] flex items-baseline justify-end gap-1">
                        <span className={item.score >= 70 ? 'text-[#D4FF00]' : 'text-[#D9C5B4]'}>
                          {item.score}
                        </span>
                        <span className="text-xs text-[#A99A90] font-normal">/ 100</span>
                      </div>
                      <div className="text-xs font-mono text-[#D9C5B4] mt-1">
                        ₹{item.resource.hourly_rate}/hr
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                      <Link
                        href={`/resources/${item.resource.id}`}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          item.isEligible
                            ? 'bg-[#D4FF00] hover:bg-[#C2EA00] text-black shadow-md shadow-[#D4FF00]/15'
                            : 'bg-[#24110C] hover:bg-[#2F1711] text-[#F1E7DE] border border-[#AD7257]/30'
                        }`}
                      >
                        {item.isEligible ? 'Reserve Slot' : 'View Requirements'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Score telemetry pill breakdown */}
                <div className="mt-4 pt-3 border-t border-[#AD7257]/20 flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#A99A90]">
                  <span>Intent Match: <strong className="text-[#F1E7DE]">{item.breakdown.intentScore}/30</strong></span>
                  <span>Budget Compatibility: <strong className="text-[#F1E7DE]">{item.breakdown.budgetScore}/25</strong></span>
                  <span>SkillGate Clearance: <strong className={item.isEligible ? 'text-emerald-400' : 'text-red-400'}>{item.breakdown.eligibilityScore}/25</strong></span>
                  <span>Readiness: <strong className="text-[#F1E7DE]">{item.breakdown.availabilityScore}/20</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

