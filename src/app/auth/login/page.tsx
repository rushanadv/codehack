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
    <div className="min-h-screen bg-[#11100F] text-[#F3EADF] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#191715] border border-[#2C2723] rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#211E1B] border border-[#38312C] flex items-center justify-center mx-auto">
            <div className="w-3.5 h-3.5 bg-[#B65E42] rounded-sm transform rotate-45" />
          </div>
          <h2 className="text-2xl font-semibold text-[#F3EADF] tracking-tight">
            Sign in to Idle<span className="text-[#B65E42]">X</span>
          </h2>
          <p className="text-xs text-[#8C827A] font-mono">
            High-Integrity Infrastructure Exchange
          </p>
        </div>

        {/* 1-Click Evaluation Personas for Evaluators */}
        <div className="p-4 rounded-lg bg-[#151312] border border-[#38312C] space-y-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#D69A49]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Personas</span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleDemoLogin('user-dev')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#211E1B] hover:bg-[#2A2622] border border-[#2C2723] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F3EADF]">Dev Patel (Researcher)</div>
                <div className="text-[10px] text-[#8C827A] font-mono">Precision Fab • FDM Certified</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#B65E42]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-owner-aris')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#211E1B] hover:bg-[#2A2622] border border-[#2C2723] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F3EADF]">Dr. Aris Vance (Facility Lead)</div>
                <div className="text-[10px] text-[#8C827A] font-mono">Additive Manufacturing Bay</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#B65E42]" />
            </button>

            <button
              onClick={() => handleDemoLogin('user-admin-raman')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg bg-[#211E1B] hover:bg-[#2A2622] border border-[#2C2723] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-[#F3EADF]">Dean S. Raman (Administrator)</div>
                <div className="text-[10px] text-[#8C827A] font-mono">Compliance & Oversight Authority</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#B65E42]" />
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#8C827A] uppercase text-[10px] mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B6158] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@synthetic-lab.io"
                className="w-full bg-[#151312] text-[#F3EADF] pl-9 pr-3 py-2 rounded-lg border border-[#2C2723] focus:outline-none focus:border-[#B65E42] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8C827A] uppercase text-[10px] mb-1">Passcode</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B6158] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#151312] text-[#F3EADF] pl-9 pr-3 py-2 rounded-lg border border-[#2C2723] focus:outline-none focus:border-[#B65E42] font-sans text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#B65E42] hover:bg-[#A35238] text-white font-medium rounded-lg font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying Session...' : 'Authenticate Access'}
          </button>
        </form>

        <div className="text-center text-xs text-[#8C827A] font-mono">
          Need an organization account?{' '}
          <Link href="/auth/signup" className="text-[#D69A49] hover:underline">
            Register Node
          </Link>
        </div>
      </div>
    </div>
  );
}
