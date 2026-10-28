'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserCheck, Shield, Sparkles, Lock, Mail, User, Building } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Department of Aerospace & Robotics');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // For demo instant login as new session or dev
    try {
      const res = await fetch('/api/auth/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: role === 'owner' ? 'user-owner-aris' : 'user-dev' })
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

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0D0F14] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#151921] border border-white/15 flex items-center justify-center mx-auto">
            <div className="w-4 h-4 bg-[#D4FF00] rounded-sm transform rotate-45"></div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create Idle<span className="text-[#D4FF00]">X</span> Account
          </h2>
          <p className="text-xs text-neutral-400">
            Join the Verified Institutional Research Exchange
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Full Name & Title</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Maya Rao"
                className="w-full bg-[#12151B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya.rao@iitb.ac.in"
                className="w-full bg-[#12151B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Department / Lab</label>
            <div className="relative">
              <Building className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#12151B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase text-[10px] mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  role === 'user' ? 'bg-[#D4FF00]/15 border-[#D4FF00] text-white' : 'bg-[#12151B] border-white/10 text-neutral-400'
                }`}
              >
                <div className="font-bold text-xs">Researcher</div>
                <div className="text-[10px] opacity-75">Book resources</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  role === 'owner' ? 'bg-[#D4FF00]/15 border-[#D4FF00] text-white' : 'bg-[#12151B] border-white/10 text-neutral-400'
                }`}
              >
                <div className="font-bold text-xs">Lab Owner</div>
                <div className="text-[10px] opacity-75">List assets & manage</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4FF00]/15"
          >
            {isLoading ? 'Creating Node...' : 'Register & Launch Sandbox'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 font-mono">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[#D4FF00] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

