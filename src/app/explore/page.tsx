'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Layers, 
  Box, 
  Building2, 
  Cpu, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { ResourceCard } from '@/components/ResourceCard';
import { Resource } from '@/lib/types';
import Link from 'next/link';

function ExploreContent() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get('category');

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromQuery || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    if (categoryFromQuery) {
      setSelectedCategory(categoryFromQuery);
    }
  }, [categoryFromQuery]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedLocation !== 'all') params.set('location', selectedLocation);
      if (maxBudget) params.set('maxPrice', maxBudget);
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedStatus, selectedLocation, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedLocation('all');
    setMaxBudget('');
    setSortBy('recommended');
  };

  const categories = [
    { 
      id: 'all', 
      label: 'All Registers', 
      icon: Layers,
      activeClass: 'bg-[#F1E7DE] text-black border-white',
    },
    { 
      id: 'space', 
      label: '01 // Spaces & Cleanrooms', 
      icon: Building2,
      activeClass: 'bg-[#1C3E48] text-white border-[#3E8094]',
    },
    { 
      id: 'equipment', 
      label: '02 // Physical Instruments', 
      icon: Box,
      activeClass: 'bg-[#B53F1E] text-white border-[#E25822]',
    },
    { 
      id: 'digital', 
      label: '03 // Digital & Compute', 
      icon: Cpu,
      activeClass: 'bg-[#D4FF00] text-black border-[#D4FF00]',
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
      
      {/* 1. ARCHITECTURAL EXPLORE HEADER */}
      <div className="pb-8 border-b-2 border-[#AD7257]/30 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A120E] border border-[#AD7257]/40 rounded-sm font-mono text-xs uppercase tracking-[0.2em] text-[#D4FF00] mb-3">
            <span className="w-2 h-2 bg-[#D4FF00]" />
            <span>EXCHANGE DIRECTORY // REF. 884-X</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#F1E7DE] tracking-tight leading-[0.95] mb-3">
            VERIFIED CAPACITY <br />
            <span className="text-[#D4FF00] bg-[#16100E] px-3 py-0.5 inline-block mt-1 border border-[#D4FF00]/40">
              INVENTORY ARCHIVE
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#D9C5B4] max-w-2xl leading-relaxed">
            Discover precision research instruments, experimental facilities, and dedicated compute nodes with guaranteed turnaround buffers and zero race-condition bookings.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            href="/match"
            className="inline-flex items-center gap-2 bg-[#B53F1E] hover:bg-[#C84725] text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md border border-[#E25822] transition-all active:translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Natural Language Matcher ↗</span>
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-lg bg-[#140F0D] border border-[#AD7257]/30">
          <div className="text-[10px] text-[#A99A90] uppercase tracking-wider">Total Assets</div>
          <div className="text-xl font-bold text-[#F1E7DE] mt-0.5">184 Verified</div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#140F0D] border border-[#AD7257]/30">
          <div className="text-[10px] text-[#A99A90] uppercase tracking-wider">Monitored Capital</div>
          <div className="text-xl font-bold text-[#D4FF00] mt-0.5">₹14.2B+ Active</div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#140F0D] border border-[#AD7257]/30">
          <div className="text-[10px] text-[#A99A90] uppercase tracking-wider">Turnaround SLA</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">+30m Guaranteed</div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#140F0D] border border-[#AD7257]/30">
          <div className="text-[10px] text-[#A99A90] uppercase tracking-wider">Booking Concurrency</div>
          <div className="text-xl font-bold text-[#D95927] mt-0.5">100% ACID Lock</div>
        </div>
      </div>

      {/* 3. SOLID CATEGORY SELECTION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar font-mono text-xs">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-2 ${
                isActive
                  ? c.activeClass
                  : 'bg-[#150F0D] text-[#A99A90] border-[#AD7257]/30 hover:text-white hover:border-[#AD7257]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. SOLID INDUSTRIAL SEARCH & FILTER TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#140F0D] border-2 border-[#AD7257]/35 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center font-mono text-xs">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#A99A90] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ASSET, SPEC (e.g. Cryo, 5-Axis, H100), OR BAY..."
              className="w-full bg-[#1C1411] text-[#F1E7DE] pl-10 pr-4 py-2.5 rounded-md border border-[#AD7257]/35 text-xs focus:outline-none focus:border-[#D4FF00] font-mono uppercase tracking-wider placeholder:text-[#A99A90]/60 placeholder:normal-case"
            />
          </form>

          {/* Location Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#1C1411] text-[#D9C5B4] px-3 py-2.5 rounded-md border border-[#AD7257]/35 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
            >
              <option value="all">All Hubs & Campuses</option>
              <option value="Central Campus">Central Campus</option>
              <option value="North Research Park">North Research Park</option>
              <option value="Robotics Valley">Robotics Valley</option>
              <option value="South Media Center">South Media Center</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#1C1411] text-[#D9C5B4] px-3 py-2.5 rounded-md border border-[#AD7257]/35 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
            >
              <option value="all">All Status Modes</option>
              <option value="available">Available Now</option>
              <option value="in_use">Active In Use</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#1C1411] text-[#D9C5B4] px-3 py-2.5 rounded-md border border-[#AD7257]/35 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
            >
              <option value="recommended">Sort: Relevance</option>
              <option value="price_asc">Rate: Low to High</option>
              <option value="price_desc">Rate: High to Low</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2.5 bg-[#1C1411] hover:bg-[#2B1B15] text-[#A99A90] hover:text-[#D4FF00] rounded-md border border-[#AD7257]/35 transition-colors cursor-pointer w-full flex items-center justify-center gap-1 font-mono text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="md:hidden">Reset</span>
            </button>
          </div>

        </div>

        {/* Directory Query Status Readout */}
        <div className="pt-3 border-t border-[#AD7257]/20 flex items-center justify-between font-mono text-[11px] text-[#A99A90] uppercase tracking-wider">
          <span>DIRECTORY PROTOCOL: ACTIVE</span>
          <span className="text-[#D4FF00] font-bold">
            SHOWING {resources.length} VERIFIED SPECIMENS
          </span>
        </div>
      </div>

      {/* 5. SPECIMEN GRID RESULTS */}
      {isLoading ? (
        <div className="py-24 text-center rounded-xl border border-[#AD7257]/30 bg-[#140F0D]">
          <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xs font-mono text-[#D4FF00] uppercase tracking-widest font-bold">
            QUERYING RELATIONAL ASSET DIRECTORY...
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="py-20 text-center bg-[#140F0D] rounded-xl border-2 border-[#AD7257]/30 p-8 max-w-xl mx-auto my-8">
          <Box className="w-10 h-10 text-[#D95927] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#F1E7DE] mb-2 font-mono uppercase tracking-wide">
            Zero Matching Specimens Found
          </h3>
          <p className="text-xs text-[#D9C5B4] mb-6 leading-relaxed">
            No assets match the current filter query parameters. Clear criteria or engage the natural language match engine.
          </p>
          <div className="flex justify-center gap-3 font-mono text-xs uppercase">
            <button
              onClick={handleResetFilters}
              className="bg-[#241510] hover:bg-[#331D16] text-[#F1E7DE] px-4 py-2.5 rounded-md font-bold cursor-pointer border border-[#AD7257]/40"
            >
              Reset Filters
            </button>
            <Link
              href="/match"
              className="bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-4 py-2.5 rounded-md font-bold cursor-pointer border border-[#D4FF00]"
            >
              Launch Match Engine
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-mono text-xs text-[#A99A90]">Loading marketplace directory...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
