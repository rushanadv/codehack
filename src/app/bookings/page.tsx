'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode,
  RotateCcw
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'confirmed' | 'returned'>('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-white/8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <span>Custody & Lifecycle</span>
            <span>•</span>
            <span>Active Reservations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bookings & Reservations
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Track your reservation lifecycle, complete verified checkouts, submit return condition checklists, and inspect Resource Passport logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {(['all', 'in_progress', 'confirmed', 'returned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-colors cursor-pointer ${
                filter === st
                  ? 'bg-[#D4FF00] text-black font-bold'
                  : 'bg-[#12151B] text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Loading custody records...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#0D0F14] rounded-xl border border-white/8 p-8 max-w-md mx-auto">
          <CalendarCheck className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No bookings match filter</h3>
          <p className="text-xs text-neutral-400 mb-6">Explore the marketplace to initiate a reservation.</p>
          <Link
            href="/explore"
            className="bg-[#D4FF00] text-black px-4 py-2 rounded font-mono text-xs font-bold uppercase"
          >
            Explore Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
            >
              <div className="flex items-start gap-5">
                <img
                  src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                  alt={b.resource_title}
                  className="w-20 h-20 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="badge-tech bg-white/10 text-neutral-300">
                      {b.resource_passport_id}
                    </span>
                    <span className={`badge-tech ${
                      b.status === 'in_progress' ? 'bg-[#D4FF00]/20 text-[#D4FF00]' :
                      b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                      b.status === 'returned' ? 'bg-emerald-500/20 text-emerald-400' :
                      b.status === 'delayed' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {b.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    <Link href={`/bookings/${b.id}`} className="hover:text-[#D4FF00] transition-colors">
                      {b.resource_title}
                    </Link>
                  </h3>

                  <p className="text-xs text-neutral-400 max-w-xl line-clamp-1">
                    {b.purpose}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-400 pt-1">
                    <span>From: {new Date(b.start_time).toLocaleString()}</span>
                    <span>Until: {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Fee: <strong className="text-white">₹{b.total_cost}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 self-end md:self-auto">
                <Link
                  href={`/bookings/${b.id}`}
                  className="flex items-center gap-2 bg-[#151921] hover:bg-[#D4FF00] text-neutral-200 hover:text-black px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Manage Lifecycle
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

