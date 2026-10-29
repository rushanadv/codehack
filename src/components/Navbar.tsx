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
    <nav className="bg-[#170D0A]/95 backdrop-blur-md border-b border-[#AD7257]/20 sticky top-[33px] z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[#24110C] border border-[#AD7257]/30 flex items-center justify-center group-hover:border-[#D4FF00]/60 transition-all shadow-inner">
            <div className="w-3.5 h-3.5 bg-[#D4FF00] rounded-sm transform rotate-45 transition-transform group-hover:scale-110"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-lg tracking-tight text-[#F1E7DE] flex items-center gap-1">
              Idle<span className="text-[#D4FF00]">X</span>
              <span className="text-[9px] font-mono tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.2 rounded ml-1 border border-[#D4FF00]/25">
                v2.6
              </span>
            </span>
            <span className="text-[9px] tracking-wider uppercase text-[#A99A90] font-mono -mt-1 hidden sm:block">
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
                ? 'bg-[#24110C] text-[#D4FF00] font-medium border border-[#AD7257]/30'
                : 'text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explore
          </NextLink>

          <NextLink
            href="/match"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/match')
                ? 'bg-[#24110C] text-[#D4FF00] font-medium border border-[#AD7257]/30'
                : 'text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
            IdleX Match
          </NextLink>

          <NextLink
            href="/incidents"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/incidents')
                ? 'bg-[#24110C] text-[#D4FF00] font-medium border border-[#AD7257]/30'
                : 'text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Promise Protection
          </NextLink>

          <NextLink
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname === '/dashboard'
                ? 'bg-[#24110C] text-[#D4FF00] font-medium border border-[#AD7257]/30'
                : 'text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </NextLink>

          <NextLink
            href="/bookings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              pathname.startsWith('/bookings')
                ? 'bg-[#24110C] text-[#D4FF00] font-medium border border-[#AD7257]/30'
                : 'text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Bookings
          </NextLink>

          {/* Owner Dropdown/Links */}
          {isOwner && (
            <div className="flex items-center pl-2 ml-2 border-l border-[#AD7257]/20 gap-1">
              <NextLink
                href="/owner/resources"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/resources') ? 'bg-[#24110C] text-[#D4FF00] border border-[#AD7257]/30' : ''
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Inventory
              </NextLink>

              <NextLink
                href="/owner/requests"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/requests') ? 'bg-[#24110C] text-[#D4FF00] border border-[#AD7257]/30' : ''
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Requests
              </NextLink>

              <NextLink
                href="/owner/analytics"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[#D9C5B4] hover:text-[#F1E7DE] hover:bg-[#24110C]/60 transition-colors cursor-pointer ${
                  pathname.startsWith('/owner/analytics') ? 'bg-[#24110C] text-[#D4FF00] border border-[#AD7257]/30' : ''
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#D4FF00]" />
                Insights
              </NextLink>
            </div>
          )}

          {isAdmin && (
            <NextLink
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-amber-300 hover:bg-[#24110C] transition-colors cursor-pointer ml-1 ${
                pathname.startsWith('/admin') ? 'bg-[#24110C] text-[#D4FF00] border border-[#AD7257]/30' : ''
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
              className="relative p-2 rounded-lg bg-[#1F100B] hover:bg-[#2A150F] text-[#D9C5B4] hover:text-[#F1E7DE] border border-[#AD7257]/25 transition-colors cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-80 bg-[#170D0A] border border-[#AD7257]/30 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#AD7257]/20 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F1E7DE]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#D4FF00] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#AD7257]/15">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#A99A90]">
                      No notifications logged
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-[#24110C] ${
                          n.read_status === 0 ? 'bg-[#D4FF00]/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-[11px] ${
                            n.type === 'alert' ? 'text-red-400' : n.type === 'warning' ? 'text-amber-400' : 'text-[#D4FF00]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#A99A90] font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#D9C5B4] text-[11px] leading-relaxed mb-1.5">{n.message}</p>
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
            <div className="flex items-center gap-2 bg-[#1F100B] border border-[#AD7257]/25 pl-1.5 pr-3 py-1 rounded-full">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-[#D4FF00]/50"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-[#F1E7DE] truncate max-w-[100px] sm:max-w-[120px]">
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
            className="lg:hidden p-2 text-[#A99A90] hover:text-[#F1E7DE]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#AD7257]/20 flex flex-col gap-2 text-sm bg-[#170D0A]/95 p-4 rounded-xl">
          <NextLink href="/explore" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4] hover:text-[#D4FF00]">
            Explore Resources
          </NextLink>
          <NextLink href="/match" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4] hover:text-[#D4FF00]">
            IdleX Match (AI Engine)
          </NextLink>
          <NextLink href="/incidents" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-amber-400">
            Promise Protection
          </NextLink>
          <NextLink href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4] hover:text-[#D4FF00]">
            Dashboard
          </NextLink>
          <NextLink href="/bookings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4] hover:text-[#D4FF00]">
            My Bookings
          </NextLink>
          <NextLink href="/waitlist" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4] hover:text-[#D4FF00]">
            FairShare Waitlists
          </NextLink>
          {isOwner && (
            <>
              <NextLink href="/owner/resources" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4]">
                Owner Inventory
              </NextLink>
              <NextLink href="/owner/requests" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D9C5B4]">
                Booking Requests
              </NextLink>
              <NextLink href="/owner/analytics" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#D4FF00]">
                Idle Insights Analytics
              </NextLink>
            </>
          )}
          {isAdmin && (
            <NextLink href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-amber-300">
              Admin Verification & Audit
            </NextLink>
          )}
        </div>
      )}
    </nav>
  );
}

