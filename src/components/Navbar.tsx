'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  LayoutDashboard, 
  CalendarCheck, 
  Layers, 
  Inbox, 
  BarChart3, 
  Bell, 
  CheckCheck,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/current');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => n.read_status === 0).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  if (pathname === '/') return null;

  return (
    <nav className="bg-[#07090C]/90 backdrop-blur-md border-b border-white/8 sticky top-[33px] z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[#12151B] border border-white/15 flex items-center justify-center group-hover:border-[#D4FF00]/50 transition-all">
            <div className="w-3.5 h-3.5 bg-[#D4FF00] rounded-sm transform rotate-45 transition-transform group-hover:scale-110"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-lg tracking-tight text-white flex items-center gap-1">
              Idle<span className="text-[#D4FF00]">X</span>
              <span className="text-[9px] font-mono tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.2 rounded ml-1 border border-[#D4FF00]/20">
                v2.6
              </span>
            </span>
            <span className="text-[9px] tracking-wider uppercase text-neutral-400 font-mono -mt-1 hidden sm:block">
              Intelligent Resource Exchange
            </span>
          </div>
        </NextLink>

        {/* Desktop Primary Navigation */}
        <div className="hidden lg:flex items-center gap-1 text-xs">
          <NextLink
            href="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/explore') || pathname.startsWith('/resources')
                ? 'bg-white/10 text-[#D4FF00] font-medium'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explore
          </NextLink>

          <NextLink
            href="/match"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/match')
                ? 'bg-white/10 text-[#D4FF00] font-medium'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
            IdleX Match
          </NextLink>

          <NextLink
            href="/incidents"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/incidents')
                ? 'bg-white/10 text-[#D4FF00] font-medium'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Promise Protection
          </NextLink>

          <NextLink
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname === '/dashboard'
                ? 'bg-white/10 text-[#D4FF00] font-medium'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </NextLink>

          <NextLink
            href="/bookings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/bookings')
                ? 'bg-white/10 text-[#D4FF00] font-medium'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Bookings
          </NextLink>

          {/* Owner Dropdown/Links */}
          {isOwner && (
            <div className="flex items-center pl-2 ml-2 border-l border-white/10 gap-1">
              <NextLink
                href="/owner/resources"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/resources') ? 'bg-white/10 text-[#D4FF00]' : ''
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Inventory
              </NextLink>

              <NextLink
                href="/owner/requests"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/requests') ? 'bg-white/10 text-[#D4FF00]' : ''
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Requests
              </NextLink>

              <NextLink
                href="/owner/analytics"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/analytics') ? 'bg-white/10 text-[#D4FF00]' : ''
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                Insights
              </NextLink>
            </div>
          )}

          {isAdmin && (
            <NextLink
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer ml-1 ${
                pathname.startsWith('/admin') ? 'bg-purple-500/20 text-purple-300' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </NextLink>
          )}
        </div>

        {/* Right Section: Notification & User Pill */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#12151B] hover:bg-[#181D26] text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4FF00] text-black font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F1217] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#D4FF00] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No notifications logged
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-white/5 ${
                          n.read_status === 0 ? 'bg-[#D4FF00]/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-[11px] ${
                            n.type === 'alert' ? 'text-red-400' : n.type === 'warning' ? 'text-amber-400' : 'text-[#D4FF00]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-neutral-300 text-[11px] leading-relaxed mb-1.5">{n.message}</p>
                        {n.link && (
                          <NextLink
                            href={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="text-[10px] text-[#D4FF00] hover:underline font-mono uppercase"
                          >
                            Inspect details →
                          </NextLink>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-[#12151B] border border-white/10 pl-1.5 pr-3 py-1 rounded-full">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-[#D4FF00]/40"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-white truncate max-w-[100px] sm:max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[9px] font-mono text-[#D4FF00] uppercase tracking-wider -mt-0.5">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 text-sm">
          <NextLink href="/explore" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300 hover:text-[#D4FF00]">
            Explore Resources
          </NextLink>
          <NextLink href="/match" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300 hover:text-[#D4FF00]">
            IdleX Match (AI Engine)
          </NextLink>
          <NextLink href="/incidents" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-amber-400">
            Promise Protection
          </NextLink>
          <NextLink href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300 hover:text-[#D4FF00]">
            Dashboard
          </NextLink>
          <NextLink href="/bookings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300 hover:text-[#D4FF00]">
            My Bookings
          </NextLink>
          <NextLink href="/waitlist" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300 hover:text-[#D4FF00]">
            FairShare Waitlists
          </NextLink>
          {isOwner && (
            <>
              <NextLink href="/owner/resources" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300">
                Owner Inventory
              </NextLink>
              <NextLink href="/owner/requests" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-300">
                Booking Requests
              </NextLink>
              <NextLink href="/owner/analytics" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-cyan-400">
                Idle Insights Analytics
              </NextLink>
            </>
          )}
          {isAdmin && (
            <NextLink href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-purple-400">
              Admin Verification & Audit
            </NextLink>
          )}
        </div>
      )}
    </nav>
  );
}

