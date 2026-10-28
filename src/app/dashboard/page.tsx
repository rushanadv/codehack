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
  BarChart3, 
  Activity,
  PlusCircle,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { Booking, Resource } from '@/lib/types';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [authRes, bookingsRes, disruptionsRes, analyticsRes] = await Promise.all([
        fetch('/api/auth/current'),
        fetch('/api/bookings'),
        fetch('/api/promise-protection'),
        fetch('/api/owner/analytics')
      ]);

      const authData = await authRes.json();
      const bookingsData = await bookingsRes.json();
      const disruptionsData = await disruptionsRes.json();
      const analyticsData = await analyticsRes.json();

      setCurrentUser(authData.user);
      setBookings(bookingsData.bookings || []);
      setDisruptions(disruptionsData.disruptions || []);
      setAnalytics(analyticsData.insights);
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
        <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Synchronizing Role-Aware Mission Control...
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const activeBookings = bookings.filter(b => b.status === 'in_progress');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Profile Banner */}
      <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4FF00]"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-tech bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                {currentUser?.role.toUpperCase()} CONSOLE
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                ID: {currentUser?.id}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentUser?.name}
            </h1>
            <p className="text-xs text-neutral-400">
              {currentUser?.department} • {currentUser?.institution}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
          >
            <PlusCircle className="w-4 h-4" />
            Book Resource
          </Link>
          {isOwner && (
            <Link
              href="/owner/analytics"
              className="flex items-center gap-2 bg-[#151921] hover:bg-white/10 text-white px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider border border-white/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Idle Insights
            </Link>
          )}
        </div>
      </div>

      {/* High-Level Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="flex items-center justify-between text-neutral-400 mb-2 font-mono text-xs">
            <span>ACTIVE SESSIONS</span>
            <Activity className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {activeBookings.length}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">Under custody</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="flex items-center justify-between text-neutral-400 mb-2 font-mono text-xs">
            <span>UPCOMING / QUEUED</span>
            <CalendarCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {confirmedBookings.length}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">Confirmed reservations</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="flex items-center justify-between text-neutral-400 mb-2 font-mono text-xs">
            <span>APPROVAL QUEUE</span>
            <Inbox className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {pendingBookings.length}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">Pending review</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="flex items-center justify-between text-neutral-400 mb-2 font-mono text-xs">
            <span>DISRUPTION ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {disruptions.length}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">Promise Protection active</div>
        </div>
      </div>

      {/* Active Disruption Warnings Banner if any */}
      {disruptions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white font-mono uppercase">
                Active Promise Protection Disruption Logged:
              </span>{' '}
              <span className="text-neutral-300">
                {disruptions[0].delayed_resource_title} (+{disruptions[0].delay_duration_minutes}m delay). Potential cascade under mitigation.
              </span>
            </div>
          </div>
          <Link
            href="/incidents"
            className="text-xs font-mono font-bold uppercase text-amber-400 hover:underline shrink-0"
          >
            Review Incidents Console →
          </Link>
        </div>
      )}

      {/* Main Sections: Recent Bookings & Status Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active & Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-white/10">
            <span className="text-white font-bold uppercase">Active & Recent Bookings</span>
            <Link href="/bookings" className="text-[#D4FF00] hover:underline">
              View All History →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-[#0D0F14] rounded-xl border border-white/8 text-neutral-400 text-xs">
              No active reservations found. Explore the marketplace to reserve lab instruments.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={b.resource_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'}
                      alt={b.resource_title}
                      className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-tech bg-white/10 text-neutral-300">
                          {b.resource_passport_id}
                        </span>
                        <span className={`badge-tech ${
                          b.status === 'in_progress' ? 'bg-[#D4FF00]/20 text-[#D4FF00]' :
                          b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                          b.status === 'returned' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">
                        <Link href={`/bookings/${b.id}`} className="hover:text-[#D4FF00] transition-colors">
                          {b.resource_title}
                        </Link>
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                        {b.purpose}
                      </p>
                      <div className="text-[11px] font-mono text-neutral-400 mt-2 flex items-center gap-3">
                        <span>Start: {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>End: {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Fee: ₹{b.total_cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                    <Link
                      href={`/bookings/${b.id}`}
                      className="px-3.5 py-1.5 bg-[#151921] hover:bg-white/10 text-neutral-200 rounded text-xs font-mono uppercase"
                    >
                      Lifecycle →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Operational Insights / Quick Nav (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Institutional Navigation
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <Link
                href="/incidents"
                className="p-3 rounded bg-[#12151B] hover:bg-white/5 border border-white/5 flex items-center justify-between text-neutral-300 hover:text-white transition-colors block"
              >
                <span>Promise Protection Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
              </Link>

              <Link
                href="/waitlist"
                className="p-3 rounded bg-[#12151B] hover:bg-white/5 border border-white/5 flex items-center justify-between text-neutral-300 hover:text-white transition-colors block"
              >
                <span>FairShare Waitlist Queues</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
              </Link>

              {isOwner && (
                <>
                  <Link
                    href="/owner/resources"
                    className="p-3 rounded bg-[#12151B] hover:bg-white/5 border border-white/5 flex items-center justify-between text-neutral-300 hover:text-white transition-colors block"
                  >
                    <span>Owner Inventory Management</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
                  </Link>

                  <Link
                    href="/owner/requests"
                    className="p-3 rounded bg-[#12151B] hover:bg-white/5 border border-white/5 flex items-center justify-between text-neutral-300 hover:text-white transition-colors block"
                  >
                    <span>Booking Approval Queue</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
                  </Link>

                  <Link
                    href="/owner/analytics"
                    className="p-3 rounded bg-[#12151B] hover:bg-white/5 border border-white/5 flex items-center justify-between text-cyan-400 hover:text-cyan-300 transition-colors block"
                  >
                    <span>Idle Insights Telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </Link>
                </>
              )}

              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="p-3 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-between text-purple-300 transition-colors block"
                >
                  <span>Admin Verification & Audit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
