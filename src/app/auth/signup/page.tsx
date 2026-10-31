'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserCheck, Shield, Sparkles, Lock, Mail, User, Building } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Precision Robotics Laboratory');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#17251B] border border-[#344438] rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#203025] border border-[#344438] flex items-center justify-center mx-auto">
            <div className="w-3.5 h-3.5 bg-[#82996D] rounded-sm transform rotate-45" />
          </div>
          <h2 className="text-2xl font-semibold text-[#F1F0E5] tracking-tight">
            Create Slotly Account
          </h2>
          <p className="text-xs text-[#7E8D77] font-mono">
            Verified Infrastructure Exchange Registry
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Full Name & Title</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7E8D77] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Maya Rao"
                className="w-full bg-[#101D15] text-[#F1F0E5] pl-9 pr-3 py-2 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7E8D77] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya.rao@synthetic-lab.io"
                className="w-full bg-[#101D15] text-[#F1F0E5] pl-9 pr-3 py-2 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Facility / Lab Unit</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#7E8D77] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#101D15] text-[#F1F0E5] pl-9 pr-3 py-2 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  role === 'user' ? 'bg-[#203025] border-[#82996D] text-[#F1F0E5]' : 'bg-[#101D15] border-[#344438] text-[#7E8D77]'
                }`}
              >
                <div className="font-semibold text-xs">Researcher</div>
                <div className="text-[10px] opacity-75">Book capacity</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  role === 'owner' ? 'bg-[#203025] border-[#82996D] text-[#F1F0E5]' : 'bg-[#101D15] border-[#344438] text-[#7E8D77]'
                }`}
              >
                <div className="font-semibold text-xs">Facility Owner</div>
                <div className="text-[10px] opacity-75">List assets & govern</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#82996D] hover:bg-[#94AC7E] text-[#0B1510] font-semibold rounded-lg font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Node...' : 'Register & Launch Workspace'}
          </button>
        </form>

        <div className="text-center text-xs text-[#7E8D77] font-mono">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[#C7BC91] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
