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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#344438] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#82996D] uppercase tracking-wider mb-1.5">
            <span>Custody Lifecycle • Active Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F0E5] tracking-tight">
            Bookings & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#B7C2B1] mt-1 max-w-xl leading-relaxed">
            Manage your research reservations, complete digital checkouts, inspect passport logs, and review return condition reports.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'in_progress', 'confirmed', 'returned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase transition-colors cursor-pointer border ${
                filter === st
                  ? 'bg-[#203025] text-[#F1F0E5] border-[#82996D]'
                  : 'bg-[#17251B] text-[#B7C2B1] border-[#344438] hover:text-[#F1F0E5] hover:bg-[#203025]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-[#82996D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
            Loading custody records...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#17251B] rounded-xl border border-[#344438] p-8 max-w-md mx-auto space-y-3">
          <CalendarCheck className="w-8 h-8 text-[#7E8D77] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F1F0E5]">No bookings match filter</h3>
          <p className="text-xs text-[#B7C2B1]">Explore the resource directory to schedule a new reservation.</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] px-4 py-2 rounded-md text-xs font-semibold"
          >
            Explore Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-[#17251B] border border-[#344438] hover:border-[#4A5F4F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                  alt={b.resource_title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-[#344438] shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#203025] border border-[#344438] text-[#B7C2B1]">
                      {b.resource_passport_id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                      b.status === 'in_progress' ? 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40' :
                      b.status === 'confirmed' ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40' :
                      b.status === 'returned' ? 'bg-[#203025] text-[#B7C2B1] border-[#344438]' :
                      b.status === 'delayed' ? 'bg-[#B84A39]/20 text-[#B84A39] border-[#B84A39]/40' :
                      'bg-[#203025] text-[#B7C2B1] border-[#344438]'
                    }`}>
                      {b.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#F1F0E5] truncate">
                    <Link href={`/bookings/${b.id}`} className="hover:underline">
                      {b.resource_title}
                    </Link>
                  </h3>

                  <p className="text-xs text-[#B7C2B1] max-w-xl truncate">
                    {b.purpose}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#7E8D77] pt-0.5">
                    <span>From: {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Until: {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Fee: <strong className="text-[#C7BC91]">${b.total_cost}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center self-end md:self-auto">
                <Link
                  href={`/bookings/${b.id}`}
                  className="inline-flex items-center gap-1.5 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] border border-[#344438] hover:border-[#82996D] px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  <span>Manage Lifecycle</span>
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
