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
        <div className="w-6 h-6 border-2 border-[#B65E42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs font-mono text-[#B8ADA0] uppercase tracking-wider">
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
      <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.name}
            className="w-14 h-14 rounded-lg object-cover border border-[#38312C]"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#211E1B] text-[#D69A49] border border-[#38312C]">
                {currentUser?.role?.toUpperCase()} CONSOLE
              </span>
              <span className="text-[11px] font-mono text-[#B8ADA0]">
                ID: {currentUser?.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F3EADF] tracking-tight">
              {currentUser?.name}
            </h1>
            <p className="text-xs text-[#B8ADA0] mt-0.5">
              {currentUser?.department} • {currentUser?.institution || 'AeroGrid Research Institute (Fictional)'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-[#B65E42] hover:bg-[#C86C4E] text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Reserve Resource</span>
          </Link>
          {isOwner && (
            <Link
              href="/owner/resources"
              className="inline-flex items-center gap-1.5 bg-[#211E1B] hover:bg-[#292420] text-[#F3EADF] px-3.5 py-2 rounded-md text-xs font-medium border border-[#38312C] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#D69A49]" />
              <span>Inventory</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0] flex items-center justify-between">
            <span>Active Sessions</span>
            <Activity className="w-3.5 h-3.5 text-[#D69A49]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F3EADF] mt-1">
            {activeBookings.length}
          </div>
          <div className="text-[10px] text-[#B8ADA0] mt-0.5">Under verified custody</div>
        </div>

        <div className="p-4 rounded-xl bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0] flex items-center justify-between">
            <span>Upcoming Bookings</span>
            <CalendarCheck className="w-3.5 h-3.5 text-[#B65E42]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F3EADF] mt-1">
            {confirmedBookings.length}
          </div>
          <div className="text-[10px] text-[#B8ADA0] mt-0.5">Confirmed reservations</div>
        </div>

        <div className="p-4 rounded-xl bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0] flex items-center justify-between">
            <span>Pending Review</span>
            <Inbox className="w-3.5 h-3.5 text-[#B8ADA0]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F3EADF] mt-1">
            {pendingBookings.length}
          </div>
          <div className="text-[10px] text-[#B8ADA0] mt-0.5">Awaiting owner approval</div>
        </div>

        <div className="p-4 rounded-xl bg-[#191715] border border-[#38312C]">
          <div className="text-[11px] text-[#B8ADA0] flex items-center justify-between">
            <span>Disruption Alarms</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#C68A3C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F3EADF] mt-1">
            {disruptions.length}
          </div>
          <div className="text-[10px] text-[#B8ADA0] mt-0.5">Promise Protection alerts</div>
        </div>
      </div>

      {/* Disruption Alert Notice (if active) */}
      {disruptions.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[#211E1B] border border-[#C68A3C]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C68A3C] shrink-0" />
            <div>
              <span className="font-semibold text-[#F3EADF]">Active Disruption Notice: </span>
              <span className="text-[#B8ADA0]">
                {disruptions[0].delayed_resource_title} (+{disruptions[0].delay_duration_minutes}m overrun). Buffer mitigation running.
              </span>
            </div>
          </div>
          <Link
            href="/incidents"
            className="text-xs text-[#D69A49] hover:underline font-medium shrink-0"
          >
            Review Disruption Console →
          </Link>
        </div>
      )}

      {/* Main Grid: Reservations & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active & Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#38312C]">
            <span className="text-[#F3EADF] font-mono font-medium uppercase tracking-wider">
              Active & Upcoming Reservations
            </span>
            <Link href="/bookings" className="text-[#B65E42] hover:underline font-medium">
              View All ({bookings.length}) →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-[#191715] rounded-xl border border-[#38312C] text-[#B8ADA0] text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 text-[#B8ADA0] mx-auto" />
              <p>No active reservations found for this user.</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 bg-[#B65E42] text-white px-3.5 py-1.5 rounded-md text-xs font-medium"
              >
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[#191715] border border-[#38312C] hover:border-[#4E443E] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'}
                      alt={b.resource_title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#38312C] shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#211E1B] border border-[#38312C] text-[#B8ADA0]">
                          {b.resource_passport_id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                          b.status === 'in_progress' ? 'bg-[#C68A3C]/15 text-[#E0A85C] border-[#C68A3C]/30' :
                          b.status === 'confirmed' ? 'bg-[#4E7A5D]/15 text-[#6BA87E] border-[#4E7A5D]/30' :
                          b.status === 'returned' ? 'bg-[#211E1B] text-[#B8ADA0] border-[#38312C]' :
                          'bg-[#B84A39]/15 text-[#B84A39] border-[#B84A39]/30'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#F3EADF] text-xs sm:text-sm truncate">
                        <Link href={`/bookings/${b.id}`} className="hover:underline">
                          {b.resource_title}
                        </Link>
                      </h4>
                      <p className="text-xs text-[#B8ADA0] truncate">
                        {b.purpose}
                      </p>
                      <div className="text-[11px] font-mono text-[#B8ADA0] flex items-center gap-3 pt-0.5">
                        <span>{new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span>{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#F3EADF]">${b.total_cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center self-end sm:self-auto">
                    <Link
                      href={`/bookings/${b.id}`}
                      className="px-3.5 py-1.5 bg-[#211E1B] hover:bg-[#B65E42] text-[#F3EADF] hover:text-white border border-[#38312C] rounded-md text-xs font-medium transition-colors"
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
          <div className="p-5 rounded-xl bg-[#191715] border border-[#38312C] space-y-3 text-xs">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#B8ADA0]">
              Operational Routing
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/incidents"
                className="p-3 rounded-lg bg-[#211E1B] hover:bg-[#292420] border border-[#38312C] flex items-center justify-between text-[#F3EADF] transition-colors block"
              >
                <span>Promise Protection Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B65E42]" />
              </Link>

              <Link
                href="/waitlist"
                className="p-3 rounded-lg bg-[#211E1B] hover:bg-[#292420] border border-[#38312C] flex items-center justify-between text-[#F3EADF] transition-colors block"
              >
                <span>FairShare Waitlist Queues</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B65E42]" />
              </Link>

              {isOwner && (
                <>
                  <Link
                    href="/owner/resources"
                    className="p-3 rounded-lg bg-[#211E1B] hover:bg-[#292420] border border-[#38312C] flex items-center justify-between text-[#F3EADF] transition-colors block"
                  >
                    <span>Owner Asset Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D69A49]" />
                  </Link>

                  <Link
                    href="/owner/requests"
                    className="p-3 rounded-lg bg-[#211E1B] hover:bg-[#292420] border border-[#38312C] flex items-center justify-between text-[#F3EADF] transition-colors block"
                  >
                    <span>Reservation Requests</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D69A49]" />
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
