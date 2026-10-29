'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarCheck, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Inbox, 
  Activity,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [authRes, bookingsRes, disruptionsRes] = await Promise.all([
        fetch('/api/auth/current'),
        fetch('/api/bookings'),
        fetch('/api/promise-protection')
      ]);

      const authData = await authRes.json();
      const bookingsData = await bookingsRes.json();
      const disruptionsData = await disruptionsRes.json();

      setCurrentUser(authData.user);
      setBookings(bookingsData.bookings || []);
      setDisruptions(disruptionsData.disruptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 text-center">
        <div className="w-6 h-6 border-2 border-[#82996D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
          Loading Dashboard Console...
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const activeBookings = bookings.filter(b => b.status === 'in_progress');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.name}
            className="w-14 h-14 rounded-lg object-cover border border-[#344438]"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#203025] text-[#C7BC91] border border-[#344438]">
                {currentUser?.role?.toUpperCase()} CONSOLE
              </span>
              <span className="text-[11px] font-mono text-[#7E8D77]">
                ID: {currentUser?.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F0E5] tracking-tight">
              {currentUser?.name}
            </h1>
            <p className="text-xs text-[#B7C2B1] mt-0.5">
              {currentUser?.department} • {currentUser?.institution || 'AeroGrid Research Institute (Demo)'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] px-4 py-2 rounded-md text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Reserve Resource</span>
          </Link>
          {isOwner && (
            <Link
              href="/owner/resources"
              className="inline-flex items-center gap-1.5 bg-[#203025] hover:bg-[#293B2F] text-[#F1F0E5] px-3.5 py-2 rounded-md text-xs font-medium border border-[#344438] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#C7BC91]" />
              <span>Inventory</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
          <div className="text-[11px] text-[#7E8D77] flex items-center justify-between">
            <span>Active Sessions</span>
            <Activity className="w-3.5 h-3.5 text-[#C7BC91]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F0E5] mt-1">
            {activeBookings.length}
          </div>
          <div className="text-[10px] text-[#7E8D77] mt-0.5">Under verified custody</div>
        </div>

        <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
          <div className="text-[11px] text-[#7E8D77] flex items-center justify-between">
            <span>Upcoming Bookings</span>
            <CalendarCheck className="w-3.5 h-3.5 text-[#82996D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F0E5] mt-1">
            {confirmedBookings.length}
          </div>
          <div className="text-[10px] text-[#7E8D77] mt-0.5">Confirmed reservations</div>
        </div>

        <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
          <div className="text-[11px] text-[#7E8D77] flex items-center justify-between">
            <span>Pending Review</span>
            <Inbox className="w-3.5 h-3.5 text-[#7E8D77]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F0E5] mt-1">
            {pendingBookings.length}
          </div>
          <div className="text-[10px] text-[#7E8D77] mt-0.5">Awaiting owner approval</div>
        </div>

        <div className="p-4 rounded-xl bg-[#17251B] border border-[#344438]">
          <div className="text-[11px] text-[#7E8D77] flex items-center justify-between">
            <span>Disruption Alarms</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#C79A49]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F0E5] mt-1">
            {disruptions.length}
          </div>
          <div className="text-[10px] text-[#7E8D77] mt-0.5">Promise Protection alerts</div>
        </div>
      </div>

      {/* Disruption Alert Notice (if active) */}
      {disruptions.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[#203025] border border-[#C79A49]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C79A49] shrink-0" />
            <div>
              <span className="font-semibold text-[#F1F0E5]">Active Disruption Notice: </span>
              <span className="text-[#B7C2B1]">
                {disruptions[0].delayed_resource_title} (+{disruptions[0].delay_duration_minutes}m overrun). Buffer mitigation running.
              </span>
            </div>
          </div>
          <Link
            href="/incidents"
            className="text-xs text-[#C7BC91] hover:underline font-medium shrink-0"
          >
            Review Disruption Console →
          </Link>
        </div>
      )}

      {/* Main Grid: Reservations & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active & Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#344438]">
            <span className="text-[#F1F0E5] font-mono font-medium uppercase tracking-wider">
              Active & Upcoming Reservations
            </span>
            <Link href="/bookings" className="text-[#A9BE89] hover:underline font-medium">
              View All ({bookings.length}) →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-[#7E8D77] text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 text-[#7E8D77] mx-auto" />
              <p>No active reservations found for this user.</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 bg-[#82996D] text-[#0B1510] px-3.5 py-1.5 rounded-md text-xs font-semibold"
              >
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[#17251B] border border-[#344438] hover:border-[#4A5F4F] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'}
                      alt={b.resource_title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#344438] shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#203025] border border-[#344438] text-[#B7C2B1]">
                          {b.resource_passport_id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                          b.status === 'in_progress' ? 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40' :
                          b.status === 'confirmed' ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40' :
                          b.status === 'returned' ? 'bg-[#203025] text-[#B7C2B1] border-[#344438]' :
                          'bg-[#B84A39]/20 text-[#B84A39] border-[#B84A39]/40'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#F1F0E5] text-xs sm:text-sm truncate">
                        <Link href={`/bookings/${b.id}`} className="hover:underline">
                          {b.resource_title}
                        </Link>
                      </h4>
                      <p className="text-xs text-[#B7C2B1] truncate">
                        {b.purpose}
                      </p>
                      <div className="text-[11px] font-mono text-[#7E8D77] flex items-center gap-3 pt-0.5">
                        <span>{new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span>{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#C7BC91] font-bold">${b.total_cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center self-end sm:self-auto">
                    <Link
                      href={`/bookings/${b.id}`}
                      className="px-3.5 py-1.5 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] border border-[#344438] hover:border-[#82996D] rounded-md text-xs font-medium transition-colors"
                    >
                      Lifecycle →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Operational Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-[#17251B] border border-[#344438] space-y-3 text-xs">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#7E8D77]">
              Operational Routing
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/incidents"
                className="p-3 rounded-lg bg-[#203025] hover:bg-[#293B2F] border border-[#344438] flex items-center justify-between text-[#F1F0E5] transition-colors block"
              >
                <span>Promise Protection Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#82996D]" />
              </Link>

              <Link
                href="/waitlist"
                className="p-3 rounded-lg bg-[#203025] hover:bg-[#293B2F] border border-[#344438] flex items-center justify-between text-[#F1F0E5] transition-colors block"
              >
                <span>FairShare Waitlist Queues</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#82996D]" />
              </Link>

              {isOwner && (
                <>
                  <Link
                    href="/owner/resources"
                    className="p-3 rounded-lg bg-[#203025] hover:bg-[#293B2F] border border-[#344438] flex items-center justify-between text-[#F1F0E5] transition-colors block"
                  >
                    <span>Owner Asset Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C7BC91]" />
                  </Link>

                  <Link
                    href="/owner/requests"
                    className="p-3 rounded-lg bg-[#203025] hover:bg-[#293B2F] border border-[#344438] flex items-center justify-between text-[#F1F0E5] transition-colors block"
                  >
                    <span>Reservation Requests</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C7BC91]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
