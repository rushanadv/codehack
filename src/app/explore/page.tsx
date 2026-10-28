'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Box, 
  Building2, 
  Cpu, 
  Sparkles,
  MapPin,
  Clock,
  RotateCcw
} from 'lucide-react';
import { ResourceCard } from '@/components/ResourceCard';
import { Resource } from '@/lib/types';
import Link from 'next/link';

export default function ExplorePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

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
    { id: 'all', label: 'All Resources', icon: Layers },
    { id: 'equipment', label: 'Physical Equipment', icon: Box },
    { id: 'space', label: 'Spaces & Facilities', icon: Building2 },
    { id: 'digital', label: 'Digital & Compute', icon: Cpu },
  ];

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-white/8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>Exchange Directory</span>
            <span>•</span>
            <span>Verified Institutional Assets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Resources
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Discover precision research instruments, experimental facilities, and dedicated compute nodes with guaranteed turnaround buffers.
          </p>
        </div>

        {/* Quick Link to IdleX Match */}
        <Link
          href="/match"
          className="flex items-center gap-2 bg-[#12151B] hover:bg-[#181D26] text-[#D4FF00] border border-[#D4FF00]/30 hover:border-[#D4FF00] px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Natural Language Matcher →
        </Link>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 py-6 overflow-x-auto border-b border-white/8 no-scrollbar">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#D4FF00] text-black font-bold shadow-md shadow-[#D4FF00]/20'
                  : 'bg-[#12151B] text-neutral-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, spec (e.g. ULTEM, 8K, SEM), or lab..."
            className="w-full bg-[#12151B] text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#D4FF00] transition-colors font-sans"
          />
        </form>

        {/* Location Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-[#12151B] text-neutral-300 px-3 py-2 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
          >
            <option value="all">All Campuses</option>
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
            className="w-full bg-[#12151B] text-neutral-300 px-3 py-2 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Now</option>
            <option value="in_use">Active / In Use</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#12151B] text-neutral-300 px-3 py-2 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#D4FF00] font-mono cursor-pointer"
          >
            <option value="recommended">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="md:col-span-1 flex justify-end">
          <button
            onClick={handleResetFilters}
            title="Reset Filters"
            className="p-2 bg-[#12151B] hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Results */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Querying Relational Asset Directory...
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="py-20 text-center bg-[#0F1217] rounded-xl border border-white/8 p-8 max-w-xl mx-auto my-8">
          <Box className="w-10 h-10 text-neutral-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">No matching resources found</h3>
          <p className="text-xs text-neutral-400 mb-6">
            We couldn't find any resources matching your search and filter parameters. Try clearing your filters or try our natural language matching engine.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="bg-[#151921] hover:bg-[#1D232F] text-white px-4 py-2 rounded font-mono text-xs uppercase cursor-pointer border border-white/10"
            >
              Reset Filters
            </button>
            <Link
              href="/match"
              className="bg-[#D4FF00] text-black px-4 py-2 rounded font-mono text-xs font-bold uppercase cursor-pointer"
            >
              Try IdleX Match
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
