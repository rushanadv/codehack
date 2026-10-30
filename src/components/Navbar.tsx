'use client';

import { useState, useEffect, useRef } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  LayoutDashboard, 
  CalendarCheck, 
  Layers, 
  Inbox, 
  Bell, 
  CheckCheck,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Info
} from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  department?: string;
  institution?: string;
  avatar?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  read_status: number;
  created_at: string;
  type?: string;
  booking_id?: string;
  link?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [allUsers, setAllUsers] = useState<CurrentUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState('');

  const personaRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAuthAndNotifications = async () => {
    try {
      const [authRes, notifRes] = await Promise.all([
        fetch('/api/auth/current'),
        fetch('/api/notifications')
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentUser(authData.user);
        setAllUsers(authData.allDemoUsers || []);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const list: NotificationItem[] = notifData.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => n.read_status === 0).length);
      }
    } catch (e) {
      console.error('Navbar data fetch error:', e);
    }
  };

  useEffect(() => {
    if (pathname === '/') return;
    loadAuthAndNotifications();
  }, [pathname]);

  const switchPersona = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await loadAuthAndNotifications();
        setShowPersonaMenu(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset demonstration database to initial verified state?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setResetFeedback('Reset Complete');
        setTimeout(() => setResetFeedback(''), 2500);
        await loadAuthAndNotifications();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      loadAuthAndNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Strictly protected: do not render on landing page
  if (pathname === '/') return null;

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const navLinks = [
    { href: '/overview', label: 'Overview', icon: Info, match: (p: string) => p === '/overview' },
    { href: '/explore', label: 'Explore', icon: Compass, match: (p: string) => p.startsWith('/explore') || p.startsWith('/resources') },
    { href: '/match', label: 'Match', icon: Sparkles, match: (p: string) => p.startsWith('/match') },
    { href: '/incidents', label: 'Promise Protection', icon: ShieldAlert, match: (p: string) => p.startsWith('/incidents') },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
    { href: '/bookings', label: 'Bookings', icon: CalendarCheck, match: (p: string) => p.startsWith('/bookings') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1510]/95 backdrop-blur-md border-b border-[#344438] text-[#F1F0E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <NextLink href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 bg-[#82996D] rounded-xs group-hover:bg-[#A9BE89] transition-colors" />
            <span className="font-sans font-bold text-sm tracking-tight text-[#F1F0E5] uppercase">
              SLOTLY<span className="text-[#82996D]">.</span>
            </span>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            {navLinks.map((item) => {
              const active = item.match(pathname);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    active
                      ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                      : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
                  }`}
                >
                  {item.label}
                </NextLink>
              );
            })}

            {isOwner && (
              <div className="flex items-center pl-2 ml-2 border-l border-[#344438] gap-1">
                <NextLink
                  href="/owner/resources"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    pathname.startsWith('/owner/resources')
                      ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                      : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
                  }`}
                >
                  Inventory
                </NextLink>
                <NextLink
                  href="/owner/requests"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    pathname.startsWith('/owner/requests')
                      ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                      : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
                  }`}
                >
                  Requests
                </NextLink>
              </div>
            )}

            {isAdmin && (
              <NextLink
                href="/admin"
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#203025] text-[#C7BC91] border border-[#344438]'
                    : 'text-[#B7C2B1] hover:text-[#C7BC91] hover:bg-[#17251B]'
                }`}
              >
                Admin
              </NextLink>
            )}
          </nav>
        </div>

        {/* Right: Operational Controls & Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Persona Switcher & Demo Environment Indicator */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 bg-[#17251B] hover:bg-[#203025] text-[#F1F0E5] px-2.5 py-1.5 rounded-md border border-[#344438] transition-colors cursor-pointer text-xs"
              title="Switch Demo Persona"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
              <span className="hidden sm:inline font-mono text-[10px] tracking-wider text-[#B7C2B1] uppercase">
                SAMPLE DATA •
              </span>
              <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                {currentUser?.name || 'Dev Patel'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#B7C2B1]" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#17251B] border border-[#344438] rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[#B7C2B1] border-b border-[#344438] flex items-center justify-between">
                  <span>Switch Demo Persona</span>
                  <span className="text-[#C7BC91]">Active Session</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#344438]/40">
                  {allUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchPersona(u.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-[#203025] transition-colors cursor-pointer ${
                          isCurrent ? 'bg-[#203025] text-[#F1F0E5]' : 'text-[#B7C2B1]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-xs text-[#F1F0E5] flex items-center gap-1.5">
                            <span className="truncate">{u.name}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#203025] border border-[#344438] text-[#B7C2B1]">
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#7E8D77] truncate mt-0.5">
                            {u.department}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#82996D] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset demonstration database to initial verified state"
            className="flex items-center gap-1.5 bg-[#17251B] hover:bg-[#203025] text-[#B7C2B1] hover:text-[#F1F0E5] px-2.5 py-1.5 rounded-md border border-[#344438] transition-colors text-xs font-mono cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-[#82996D]' : ''}`} />
            <span className="hidden md:inline">{resetFeedback || 'Reset'}</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadAuthAndNotifications();
              }}
              className="relative p-1.5 rounded-md bg-[#17251B] hover:bg-[#203025] text-[#B7C2B1] hover:text-[#F1F0E5] border border-[#344438] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#82996D] text-[#0B1510] font-mono font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#17251B] border border-[#344438] rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#344438] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F1F0E5]">Activity Feed</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#A9BE89] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#344438]/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#7E8D77]">
                      No active alerts logged
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-[#203025] ${
                          n.read_status === 0 ? 'bg-[#203025]/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-[11px] ${
                            n.type === 'alert' ? 'text-[#B84A39]' : n.type === 'warning' ? 'text-[#C79A49]' : 'text-[#F1F0E5]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#7E8D77] font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#B7C2B1] text-[11px] leading-relaxed mb-1">{n.message}</p>
                        {n.link && (
                          <NextLink
                            href={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="text-[11px] text-[#A9BE89] hover:underline inline-block mt-0.5"
                          >
                            View details →
                          </NextLink>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md bg-[#17251B] text-[#B7C2B1] hover:text-[#F1F0E5] border border-[#344438]"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#344438] bg-[#17251B] px-4 py-3 space-y-1">
          {navLinks.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                item.match(pathname)
                  ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                  : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#203025]'
              }`}
            >
              {item.label}
            </NextLink>
          ))}
          {isOwner && (
            <div className="pt-2 border-t border-[#344438] mt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono text-[#7E8D77] uppercase tracking-wider">Owner Controls</div>
              <NextLink
                href="/owner/resources"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#203025]"
              >
                Inventory
              </NextLink>
              <NextLink
                href="/owner/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#203025]"
              >
                Requests
              </NextLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
