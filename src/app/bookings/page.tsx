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
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#38312C] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D69A49] uppercase tracking-wider mb-1.5">
            <span>Custody Lifecycle • Active Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3EADF] tracking-tight">
            Bookings & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#B8ADA0] mt-1 max-w-xl leading-relaxed">
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
                  ? 'bg-[#211E1B] text-[#F3EADF] border-[#B65E42]'
                  : 'bg-[#191715] text-[#B8ADA0] border-[#38312C] hover:text-[#F3EADF]'
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
          <div className="w-6 h-6 border-2 border-[#B65E42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#B8ADA0] uppercase tracking-wider">
            Loading custody records...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#191715] rounded-xl border border-[#38312C] p-8 max-w-md mx-auto space-y-3">
          <CalendarCheck className="w-8 h-8 text-[#B8ADA0] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F3EADF]">No bookings match filter</h3>
          <p className="text-xs text-[#B8ADA0]">Explore the resource directory to schedule a new reservation.</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-[#B65E42] text-white px-4 py-2 rounded-md text-xs font-medium"
          >
            Explore Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-[#191715] border border-[#38312C] hover:border-[#4E443E] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                  alt={b.resource_title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-[#38312C] shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#211E1B] border border-[#38312C] text-[#B8ADA0]">
                      {b.resource_passport_id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                      b.status === 'in_progress' ? 'bg-[#C68A3C]/15 text-[#E0A85C] border-[#C68A3C]/30' :
                      b.status === 'confirmed' ? 'bg-[#4E7A5D]/15 text-[#6BA87E] border-[#4E7A5D]/30' :
                      b.status === 'returned' ? 'bg-[#211E1B] text-[#B8ADA0] border-[#38312C]' :
                      b.status === 'delayed' ? 'bg-[#B84A39]/15 text-[#B84A39] border-[#B84A39]/30' :
                      'bg-[#211E1B] text-[#B8ADA0] border-[#38312C]'
                    }`}>
                      {b.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#F3EADF] truncate">
                    <Link href={`/bookings/${b.id}`} className="hover:underline">
                      {b.resource_title}
                    </Link>
                  </h3>

                  <p className="text-xs text-[#B8ADA0] max-w-xl truncate">
                    {b.purpose}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#B8ADA0] pt-0.5">
                    <span>From: {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Until: {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Fee: <strong className="text-[#F3EADF]">${b.total_cost}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center self-end md:self-auto">
                <Link
                  href={`/bookings/${b.id}`}
                  className="inline-flex items-center gap-1.5 bg-[#211E1B] hover:bg-[#B65E42] text-[#F3EADF] hover:text-white border border-[#38312C] px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
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
