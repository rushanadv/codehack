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
    <header className="sticky top-0 z-40 bg-[#11100F]/95 backdrop-blur-md border-b border-[#38312C] text-[#F3EADF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <NextLink href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 bg-[#D69A49] rounded-xs group-hover:bg-[#B65E42] transition-colors" />
            <span className="font-sans font-bold text-sm tracking-tight text-[#F3EADF] uppercase">
              IDLEX<span className="text-[#B65E42]">.</span>
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
                      ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                      : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
                  }`}
                >
                  {item.label}
                </NextLink>
              );
            })}

            {isOwner && (
              <div className="flex items-center pl-2 ml-2 border-l border-[#38312C] gap-1">
                <NextLink
                  href="/owner/resources"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    pathname.startsWith('/owner/resources')
                      ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                      : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
                  }`}
                >
                  Inventory
                </NextLink>
                <NextLink
                  href="/owner/requests"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    pathname.startsWith('/owner/requests')
                      ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                      : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
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
                    ? 'bg-[#211E1B] text-[#D69A49] border border-[#38312C]'
                    : 'text-[#B8ADA0] hover:text-[#D69A49] hover:bg-[#191715]'
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
              className="flex items-center gap-2 bg-[#191715] hover:bg-[#211E1B] text-[#F3EADF] px-2.5 py-1.5 rounded-md border border-[#38312C] transition-colors cursor-pointer text-xs"
              title="Switch Demo Persona"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A5D]" />
              <span className="hidden sm:inline font-mono text-[10px] tracking-wider text-[#B8ADA0] uppercase">
                SAMPLE DATA •
              </span>
              <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                {currentUser?.name || 'Dev Patel'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#B8ADA0]" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#191715] border border-[#38312C] rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[#B8ADA0] border-b border-[#38312C] flex items-center justify-between">
                  <span>Switch Demo Persona</span>
                  <span className="text-[#D69A49]">Active Session</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#38312C]/40">
                  {allUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchPersona(u.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-[#211E1B] transition-colors cursor-pointer ${
                          isCurrent ? 'bg-[#211E1B] text-[#F3EADF]' : 'text-[#B8ADA0]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-xs text-[#F3EADF] flex items-center gap-1.5">
                            <span className="truncate">{u.name}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#211E1B] border border-[#38312C] text-[#B8ADA0]">
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#B8ADA0] truncate mt-0.5">
                            {u.department}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B65E42] shrink-0" />
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
            className="flex items-center gap-1.5 bg-[#191715] hover:bg-[#211E1B] text-[#B8ADA0] hover:text-[#F3EADF] px-2.5 py-1.5 rounded-md border border-[#38312C] transition-colors text-xs font-mono cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-[#B65E42]' : ''}`} />
            <span className="hidden md:inline">{resetFeedback || 'Reset'}</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadAuthAndNotifications();
              }}
              className="relative p-1.5 rounded-md bg-[#191715] hover:bg-[#211E1B] text-[#B8ADA0] hover:text-[#F3EADF] border border-[#38312C] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B65E42] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#191715] border border-[#38312C] rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#38312C] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F3EADF]">Activity Feed</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#B65E42] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#38312C]/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#B8ADA0]">
                      No active alerts logged
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-[#211E1B] ${
                          n.read_status === 0 ? 'bg-[#211E1B]/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-[11px] ${
                            n.type === 'alert' ? 'text-[#B84A39]' : n.type === 'warning' ? 'text-[#C68A3C]' : 'text-[#F3EADF]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#B8ADA0] font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#B8ADA0] text-[11px] leading-relaxed mb-1">{n.message}</p>
                        {n.link && (
                          <NextLink
                            href={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="text-[11px] text-[#B65E42] hover:underline inline-block mt-0.5"
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
            className="lg:hidden p-1.5 rounded-md bg-[#191715] text-[#B8ADA0] hover:text-[#F3EADF] border border-[#38312C]"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#38312C] bg-[#191715] px-4 py-3 space-y-1">
          {navLinks.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                item.match(pathname)
                  ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                  : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#211E1B]'
              }`}
            >
              {item.label}
            </NextLink>
          ))}
          {isOwner && (
            <div className="pt-2 border-t border-[#38312C] mt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono text-[#B8ADA0] uppercase tracking-wider">Owner Controls</div>
              <NextLink
                href="/owner/resources"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#211E1B]"
              >
                Inventory
              </NextLink>
              <NextLink
                href="/owner/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#211E1B]"
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
