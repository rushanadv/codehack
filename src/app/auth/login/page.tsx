'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserCheck, Shield, Sparkles, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Default to dev patel for demo form submit if not matched
    await handleDemoLogin('user-dev');
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0D0F14] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#151921] border border-white/15 flex items-center justify-center mx-auto">
            <div className="w-4 h-4 bg-[#D4FF00] rounded-sm transform rotate-45"></div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign in to Idle<span className="text-[#D4FF00]">X</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Intelligent Research Resource Exchange Fabric
          </p>
        </div>

        {/* 1-Click Evaluation Personas for Hackathon Judges */}
        <div className="p-4 rounded-xl bg-[#12151B] border border-[#D4FF00]/30 space-y-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#D4FF00]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge 1-Click Evaluation Sign-In</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('user-dev')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded bg-[#171C26] hover:bg-[#1E2533] border border-white/5 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">Dev Patel (Student Researcher)</div>
                <div className="text-[10px] text-neutral-400 font-mono">Robotics • FDM & Laser Verified</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-owner-aris')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded bg-[#171C26] hover:bg-[#1E2533] border border-white/5 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">Dr. Aris Vance (Resource Owner)</div>
                <div className="text-[10px] text-neutral-400 font-mono">Head of Additive & Prototyping Bay</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-admin-raman')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded bg-[#171C26] hover:bg-[#1E2533] border border-white/5 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">Dean S. Raman (Administrator)</div>
                <div className="text-[10px] text-neutral-400 font-mono">Safety Oversight & Audit Authority</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@iitb.ac.in"
                className="w-full bg-[#12151B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Passcode</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#12151B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4FF00]/15"
          >
            {isLoading ? 'Verifying Session...' : 'Authenticate Access'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 font-mono">
          Need a departmental node?{' '}
          <Link href="/auth/signup" className="text-[#D4FF00] hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}

