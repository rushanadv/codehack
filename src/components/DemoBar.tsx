'use client';

import { useState, useEffect } from 'react';
import { Shield, UserCheck, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DemoBar() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/current');
      const data = await res.json();
      setCurrentUser(data.user);
      setAllUsers(data.allDemoUsers || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await fetchUsers();
        setIsOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset entire demonstration database to initial pristine state?')) {
      setIsResetting(true);
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        const data = await res.json();
        setResetMessage('Database Reset Complete');
        setTimeout(() => setResetMessage(''), 3000);
        await fetchUsers();
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="bg-[#090B0E] border-b border-white/10 text-xs py-1.5 px-4 sticky top-0 z-50 flex items-center justify-between text-neutral-300">
      {/* Left: Hackathon Judge Banner */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 bg-[#D4FF00]/10 text-[#D4FF00] font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border border-[#D4FF00]/25">
          <Sparkles className="w-3 h-3 text-[#D4FF00]" />
          Judge Evaluation Sandbox
        </span>
        <span className="hidden sm:inline text-neutral-400 font-mono text-[11px]">
          Simulating real institutional asset exchange
        </span>
      </div>

      {/* Right: Quick Persona Switcher + Reset */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[#151921] hover:bg-[#1D232F] text-white px-2.5 py-1 rounded border border-white/10 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="font-medium text-xs">
              {currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Loading persona...'}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-[#0F1217] border border-white/15 rounded-lg shadow-2xl py-1 z-50 backdrop-blur-md">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10">
                Switch Evaluator Persona
              </div>
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                    currentUser?.id === u.id ? 'bg-[#D4FF00]/10 text-[#D4FF00]' : 'text-neutral-200'
                  }`}
                >
                  <div>
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      {u.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-white/10 text-neutral-300">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate max-w-[190px]">
                      {u.department}
                    </div>
                  </div>
                  {currentUser?.id === u.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset database to seed demonstration state"
          className="flex items-center gap-1.5 bg-[#151921] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-neutral-400 px-2 py-1 rounded border border-white/10 transition-colors font-mono text-[11px] cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-[#D4FF00]' : ''}`} />
          <span className="hidden md:inline">{resetMessage || 'Reset Demo'}</span>
        </button>
      </div>
    </div>
  );
}
