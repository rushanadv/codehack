/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  GitCommit, 
  UserCheck 
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/skills');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (userSkillId: string, action: 'approve' | 'reject') => {
    setProcessingId(userSkillId);
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSkillId, action })
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update qualification');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1510] py-32 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
        Loading Compliance & Verification Ledger...
      </div>
    );
  }

  const pendingSkills = data?.pendingSkills?.filter((s: any) => s.status === 'pending') || [];
  const verifiedSkills = data?.pendingSkills?.filter((s: any) => s.status !== 'pending') || [];
  const auditEvents = data?.auditEvents || [];

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#344438]">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#82996D]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A9BE89]" />
          <span>Operator Safety Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F0E5] tracking-tight">
          Credential Compliance & Audit Ledger
        </h1>
        <p className="text-xs text-[#7E8D77] mt-1.5 max-w-2xl leading-relaxed">
          Oversee laboratory credentials, verify institutional safety certifications, and inspect immutable transaction audit events across the platform.
        </p>
      </div>

      {/* Pending Skill Verification Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#344438]">
          <span className="text-[#B7C2B1] font-medium uppercase tracking-wider">
            Pending Credential Verifications ({pendingSkills.length})
          </span>
          <button 
            onClick={fetchAdminData} 
            className="text-[#7E8D77] hover:text-[#F1F0E5] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 
            <span>Sync</span>
          </button>
        </div>

        {pendingSkills.length === 0 ? (
          <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-[#7E8D77] text-xs">
            Zero pending credential verifications. All applicant qualifications are up to date.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSkills.map((sk: any) => (
              <div
                key={sk.id}
                className="p-5 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#C79A49]/20 text-[#C79A49] border border-[#C79A49]/40">
                      PENDING AUDIT
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#203025] text-[#7E8D77] border border-[#344438]">
                      {sk.skill_category}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F1F0E5]">
                    {sk.skill_name}
                  </h3>

                  <div className="text-xs text-[#7E8D77] font-mono">
                    Applicant: <strong className="text-[#F1F0E5] font-medium">{sk.user_name}</strong> ({sk.user_email}) • {sk.user_department}
                  </div>

                  {sk.certificate_ref && (
                    <div className="text-[11px] font-mono text-[#7E8D77] pt-0.5">
                      Certificate Reference: <span className="text-[#C7BC91]">{sk.certificate_ref}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleVerify(sk.id, 'reject')}
                    disabled={processingId === sk.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#203025] hover:bg-[#B84A39]/20 text-[#B7C2B1] hover:text-[#B84A39] rounded-lg font-mono text-xs border border-[#344438] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleVerify(sk.id, 'approve')}
                    disabled={processingId === sk.id}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] font-semibold rounded-lg font-mono text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify Credential
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Log Explorer */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#344438]">
          <span className="text-[#B7C2B1] font-medium uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#C7BC91]" />
            Platform Immutable Audit Ledger (Recent Events)
          </span>
          <span className="text-[11px] text-[#4E7A5D]">LEDGER SYNCHRONIZED</span>
        </div>

        <div className="bg-[#17251B] p-5 rounded-xl border border-[#344438] divide-y divide-[#344438] font-mono text-xs max-h-96 overflow-y-auto">
          {auditEvents.map((aud: any) => (
            <div key={aud.id} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#F1F0E5] font-medium text-[11px]">{aud.action}</span>
                  <span className="text-[#7E8D77] text-[10px]">[{aud.entity_type} • {aud.entity_id}]</span>
                </div>
                <div className="text-[#7E8D77] text-[11px] mt-0.5">
                  Actor: <span className="text-[#B7C2B1]">{aud.actor_name || aud.actor_id}</span>
                </div>
                {aud.payload && (
                  <div className="text-[10px] text-[#7E8D77] truncate max-w-xl mt-0.5">
                    {aud.payload}
                  </div>
                )}
              </div>
              <span className="text-[#7E8D77] text-[10px] shrink-0">
                {new Date(aud.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
