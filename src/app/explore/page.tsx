'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Layers, 
  Box, 
  Building2, 
  Cpu, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  AlertCircle
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
    setSortBy('recommended');
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: Layers },
    { id: 'space', label: 'Property & Spaces', icon: Building2 },
    { id: 'equipment', label: 'Physical Assets', icon: Box },
    { id: 'digital', label: 'Digital & Tech', icon: Cpu },
  ];

  // Derive honest metrics from current real dataset
  const metrics = useMemo(() => {
    const total = resources.length;
    const available = resources.filter(r => r.status === 'available').length;
    const inUse = resources.filter(r => r.status === 'in_use').length;
    return { total, available, inUse };
  }, [resources]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Page Header */}
      <div className="pb-6 border-b border-[#38312C] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D69A49] uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
            <span>Exchange Directory • Verified Inventory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3EADF] tracking-tight">
            Resource Directory
          </h1>

          <p className="text-xs sm:text-sm text-[#B8ADA0] max-w-2xl mt-1 leading-relaxed">
            Reserve verified microfabrication cleanrooms, precision instruments, and high-performance compute allocations with deterministic buffer scheduling.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/match"
            className="inline-flex items-center gap-2 bg-[#B65E42] hover:bg-[#C86C4E] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intent Match Engine</span>
          </Link>
        </div>
      </div>

      {/* 2. Honest Summary Metrics (Derived from Live Database) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0]">Active Catalog</div>
          <div className="text-lg font-bold text-[#F3EADF] mt-0.5 font-mono">
            {metrics.total} Listings
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0]">Available Now</div>
          <div className="text-lg font-bold text-[#6BA87E] mt-0.5 font-mono">
            {metrics.available} Ready
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0]">Currently Reserved</div>
          <div className="text-lg font-bold text-[#E0A85C] mt-0.5 font-mono">
            {metrics.inUse} In Session
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0]">Turnaround Buffer</div>
          <div className="text-lg font-bold text-[#F3EADF] mt-0.5 font-mono">
            15m – 60m Enforced
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#211E1B] text-[#F3EADF] border-[#B65E42]'
                  : 'bg-[#191715] text-[#B8ADA0] border-[#38312C] hover:text-[#F3EADF] hover:bg-[#211E1B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Filter Toolbar */}
      <div className="p-4 rounded-lg bg-[#191715] border border-[#38312C] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#B8ADA0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, spec (H100, 5-Axis, Cleanroom), or bay..."
              className="w-full bg-[#11100F] text-[#F3EADF] pl-9 pr-3 py-2 rounded-md border border-[#38312C] text-xs focus:outline-none focus:border-[#B65E42] placeholder:text-[#B8ADA0]/60"
            />
          </form>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by availability status"
              className="w-full bg-[#11100F] text-[#F3EADF] px-3 py-2 rounded-md border border-[#38312C] text-xs focus:outline-none focus:border-[#B65E42] cursor-pointer"
            >
              <option value="all">All Availability Statuses</option>
              <option value="available">Available Now</option>
              <option value="in_use">In Use / Scheduled</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort resources by criteria"
              className="w-full bg-[#11100F] text-[#F3EADF] px-3 py-2 rounded-md border border-[#38312C] text-xs focus:outline-none focus:border-[#B65E42] cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="buffer">Shortest Buffer Time</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 rounded-md bg-[#11100F] hover:bg-[#211E1B] text-[#B8ADA0] hover:text-[#F3EADF] border border-[#38312C] transition-colors cursor-pointer w-full flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Resource Listings Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-6 h-6 border-2 border-[#B65E42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#B8ADA0] uppercase tracking-wider">
            Loading verified catalog...
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="py-16 text-center bg-[#191715] rounded-xl border border-[#38312C] p-8 max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-[#D69A49] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F3EADF]">No matching resources found</h3>
          <p className="text-xs text-[#B8ADA0] leading-relaxed">
            No equipment or facilities matched your current filter criteria. Try adjusting your query or resetting all filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 bg-[#211E1B] hover:bg-[#B65E42] text-[#F3EADF] hover:text-white px-4 py-2 rounded-md text-xs font-medium border border-[#38312C] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <Suspense fallback={
      <div className="min-h-screen py-24 text-center text-xs font-mono text-[#B8ADA0]">
        Loading Explore Directory...
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
