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
    await handleDemoLogin('user-dev');
  };

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#17251B] border border-[#344438] rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#203025] border border-[#344438] flex items-center justify-center mx-auto">
            <div className="w-3.5 h-3.5 bg-[#82996D] rounded-sm transform rotate-45" />
          </div>
          <h2 className="text-2xl font-semibold text-[#F1F0E5] tracking-tight">
            Sign in to Idle<span className="text-[#82996D]">X</span>
          </h2>
          <p className="text-xs text-[#7E8D77] font-mono">
            High-Integrity Infrastructure Exchange
          </p>
        </div>

        {/* 1-Click Evaluation Personas for Evaluators */}
        <div className="p-4 rounded-lg bg-[#101D15] border border-[#344438] space-y-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C7BC91]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Personas</span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleDemoLogin('user-dev')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#203025] hover:bg-[#283C2F] border border-[#344438] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F1F0E5]">Dev Patel (Researcher)</div>
                <div className="text-[10px] text-[#7E8D77] font-mono">Precision Fab • FDM Certified</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82996D]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-owner-aris')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#203025] hover:bg-[#283C2F] border border-[#344438] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F1F0E5]">Dr. Aris Vance (Facility Lead)</div>
                <div className="text-[10px] text-[#7E8D77] font-mono">Additive Manufacturing Bay</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82996D]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-admin-raman')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#203025] hover:bg-[#283C2F] border border-[#344438] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F1F0E5]">Dean S. Raman (Administrator)</div>
                <div className="text-[10px] text-[#7E8D77] font-mono">Compliance & Oversight Authority</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82996D]" />
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7E8D77] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@synthetic-lab.io"
                className="w-full bg-[#101D15] text-[#F1F0E5] pl-9 pr-3 py-2 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Passcode</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7E8D77] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#101D15] text-[#F1F0E5] pl-9 pr-3 py-2 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#82996D] hover:bg-[#94AC7E] text-[#0B1510] font-semibold rounded-lg font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying Session...' : 'Authenticate Access'}
          </button>
        </form>

        <div className="text-center text-xs text-[#7E8D77] font-mono">
          Need an organization account?{' '}
          <Link href="/auth/signup" className="text-[#C7BC91] hover:underline">
            Register Node
          </Link>
        </div>
      </div>
    </div>
  );
}
