'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  SlidersHorizontal,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { MatchResultItem } from '@/lib/match';

export default function MatchPage() {
  const [prompt, setPrompt] = useState(
    'I need an industrial 3D printer for a carbon fiber aerospace prototype run tomorrow afternoon. Budget is $150/hr and I have completed operator training.'
  );
  const [maxBudget, setMaxBudget] = useState('');
  const [category, setCategory] = useState<'equipment' | 'space' | 'digital' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [hasQueried, setHasQueried] = useState(false);

  const samplePrompts = [
    {
      title: 'Aerospace Prototype 3D Printing',
      text: 'I need an industrial 3D printer for a carbon fiber aerospace prototype run tomorrow afternoon. Budget is $150/hr and I have completed operator training.'
    },
    {
      title: 'Class 5 Microfabrication Bay',
      text: 'Require an ISO Class 5 cleanroom bay for photolithography and SU-8 photoresist spin coating on silicon wafers.'
    },
    {
      title: 'High-Performance GPU Cluster',
      text: 'Need a dedicated multi-GPU Slurm cluster instance for training transformer models under $100/hr.'
    },
    {
      title: 'Surface Metrology & Profiling',
      text: 'Looking for a non-contact optical surface profilometer for sub-nanometer roughness measurement of microfluidic channels.'
    }
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
          maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#344438]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#82996D] uppercase tracking-wider mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#A9BE89]" />
          <span>Intent Match Engine • Deterministic Compatibility Scoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F0E5] tracking-tight">
          Resource Intent Matching
        </h1>
        <p className="text-xs sm:text-sm text-[#B7C2B1] mt-1 max-w-2xl leading-relaxed">
          Describe your experimental or prototyping requirements in natural language. The deterministic engine evaluates semantic requirements, verifies SkillGate credentials, and confirms buffer availability.
        </p>
      </div>

      {/* Input Console */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-5">
        <form onSubmit={handleMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#7E8D77] mb-2">
              Experimental Requirement Description
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Need high-throughput thermal chamber for -40°C stress testing under $120/hr..."
              className="w-full bg-[#0D1812] text-[#F1F0E5] p-3.5 rounded-lg border border-[#344438] text-xs focus:outline-none focus:border-[#82996D] leading-relaxed resize-none"
            />
          </div>

          {/* Quick Preset Scenarios */}
          <div>
            <div className="text-[11px] font-mono text-[#7E8D77] uppercase mb-2">
              Sample Request Scenarios:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPrompt(p.text)}
                  className="text-left p-2.5 rounded-lg bg-[#203025] hover:bg-[#293B2F] border border-[#344438] hover:border-[#82996D] text-xs transition-colors cursor-pointer group"
                >
                  <div className="font-medium text-[#F1F0E5] group-hover:text-white truncate">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-[#7E8D77] line-clamp-1 mt-0.5">
                    {p.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters Bar & Submit */}
          <div className="pt-3 border-t border-[#344438]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#7E8D77] font-mono text-[11px]">Budget Cap:</span>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Auto ($/hr)"
                  className="w-28 bg-[#0D1812] text-[#F1F0E5] px-2.5 py-1.5 rounded-md border border-[#344438] text-xs font-mono focus:outline-none focus:border-[#82996D]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#7E8D77] font-mono text-[11px]">Domain:</span>
                <select
                  value={category || ''}
                  onChange={(e) => setCategory((e.target.value as any) || undefined)}
                  className="bg-[#0D1812] text-[#F1F0E5] px-2.5 py-1.5 rounded-md border border-[#344438] text-xs font-mono focus:outline-none focus:border-[#82996D] cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="equipment">Physical Assets</option>
                  <option value="space">Property & Spaces</option>
                  <option value="digital">Digital & Tech</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] px-5 py-2 rounded-md font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0B1510] border-t-transparent rounded-full animate-spin" />
                  <span>Computing Scores...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasQueried && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#344438]">
            <span className="font-mono text-[#F1F0E5] font-medium uppercase tracking-wider">
              Ranked Compatibility Matches ({results.length})
            </span>
            <span className="text-[#7E8D77] text-[11px] font-mono">
              Deterministic Scoring • SkillGate Verified
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-xs text-[#7E8D77]">
              No resources matched the provided specifications and constraints. Try broadening your budget or prompt keywords.
            </div>
          ) : (
            <div className="space-y-3.5">
              {results.map((item, index) => {
                const res = item.resource;
                const isRecommended = item.isRecommended || index === 0;

                return (
                  <div
                    key={res.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      isRecommended
                        ? 'bg-[#17251B] border-[#82996D] shadow-md shadow-[#82996D]/5'
                        : 'bg-[#17251B] border-[#344438] hover:border-[#4A5F4F]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Thumbnail & Core Details */}
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={res.image_url}
                          alt={res.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-[#344438]"
                        />

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {isRecommended && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#82996D]/20 text-[#A9BE89] border border-[#82996D]/40 uppercase font-mono">
                                Top Recommendation
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-[#7E8D77] uppercase">
                              {res.subcategory}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-semibold text-[#F1F0E5] truncate">
                            {res.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-[#B7C2B1]">
                            <MapPin className="w-3.5 h-3.5 text-[#82996D] shrink-0" />
                            <span className="truncate">{res.building} • {res.location}</span>
                          </div>

                          {/* Fit Reason Explanation */}
                          <p className="text-xs text-[#B7C2B1] leading-relaxed pt-1">
                            <span className="text-[#C7BC91] font-medium">Why it fits: </span>
                            {item.explanation}
                          </p>
                        </div>
                      </div>

                      {/* Right: Score, SkillGate Status & Action */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#344438]/60 shrink-0">
                        
                        {/* Compatibility Score */}
                        <div className="text-left lg:text-right">
                          <div className="text-[10px] font-mono text-[#7E8D77] uppercase">Match Score</div>
                          <div className="text-xl font-bold font-mono text-[#C7BC91]">
                            {item.score}%
                          </div>
                        </div>

                        {/* SkillGate Clearance Pill */}
                        <div className="text-left lg:text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            item.isEligible
                              ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40'
                              : 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40'
                          }`}>
                            {item.isEligible ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>SkillGate: Cleared</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                <span>Skill Required</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Hourly Rate & CTA */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#B7C2B1]">
                            ${res.hourly_rate}/hr
                          </span>

                          <Link
                            href={`/resources/${res.slug || res.id}`}
                            className="inline-flex items-center gap-1 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] px-3 py-1.5 rounded-md text-xs font-medium border border-[#344438] hover:border-[#82996D] transition-colors"
                          >
                            <span>Reserve</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
