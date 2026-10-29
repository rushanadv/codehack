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
      <div className="min-h-screen py-32 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
        Loading Administrative Oversight Console...
      </div>
    );
  }

  const pendingSkills = data?.pendingSkills?.filter((s: any) => s.status === 'pending') || [];
  const verifiedSkills = data?.pendingSkills?.filter((s: any) => s.status !== 'pending') || [];
  const auditEvents = data?.auditEvents || [];

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-8 border-b border-[#AD7257]/20">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
          <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
          <span>Institutional Safety Oversight</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F1E7DE] tracking-tight">
          SkillGate Verification & Compliance Audit
        </h1>
        <p className="text-sm text-[#D9C5B4] mt-1 max-w-2xl leading-relaxed">
          Oversee laboratory credentials, verify institutional safety certifications, and inspect immutable transaction audit events across the platform fabric.
        </p>
      </div>

      {/* Pending Skill Verification Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#AD7257]/20">
          <span className="text-[#F1E7DE] font-bold uppercase tracking-wider">
            Pending SkillGate Verification Requests ({pendingSkills.length})
          </span>
          <button onClick={fetchAdminData} className="text-[#A99A90] hover:text-[#F1E7DE] flex items-center gap-1 cursor-pointer transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {pendingSkills.length === 0 ? (
          <div className="p-8 text-center bg-[#170D0A] rounded-2xl border border-[#AD7257]/25 text-[#D9C5B4] text-xs shadow-xl">
            Zero pending credential verifications. All applicant qualifications are up to date.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSkills.map((sk: any) => (
              <div
                key={sk.id}
                className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-tech bg-[#D96335]/25 text-[#D96335] border border-[#D96335]/40 font-mono">
                      PENDING AUDIT
                    </span>
                    <span className="badge-tech bg-[#24110C] text-[#D9C5B4] border border-[#AD7257]/25 font-mono">
                      {sk.skill_category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F1E7DE] mt-1">
                    {sk.skill_name}
                  </h3>

                  <div className="text-xs text-[#D9C5B4] font-mono">
                    Applicant: <strong className="text-[#F1E7DE]">{sk.user_name}</strong> ({sk.user_email}) • {sk.user_department}
                  </div>

                  {sk.certificate_ref && (
                    <div className="text-[11px] font-mono text-[#A99A90] pt-1">
                      Certificate Reference: <span className="text-[#D4FF00]">{sk.certificate_ref}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleVerify(sk.id, 'reject')}
                    disabled={processingId === sk.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-mono text-xs uppercase border border-red-500/30 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleVerify(sk.id, 'approve')}
                    disabled={processingId === sk.id}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
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
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#AD7257]/20">
          <span className="text-[#F1E7DE] font-bold uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#D4FF00]" />
            Platform-Wide Immutable Audit Trail (Last 50 Events)
          </span>
          <span className="text-[#D4FF00]">WAL SYNCHRONIZED</span>
        </div>

        <div className="bg-[#170D0A] p-5 rounded-2xl border border-[#AD7257]/25 divide-y divide-[#AD7257]/15 font-mono text-xs max-h-96 overflow-y-auto shadow-xl">
          {auditEvents.map((aud: any) => (
            <div key={aud.id} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#D4FF00] font-bold text-[11px]">{aud.action}</span>
                  <span className="text-[#A99A90] text-[10px]">[{aud.entity_type} • {aud.entity_id}]</span>
                </div>
                <div className="text-[#D9C5B4] text-[11px] mt-0.5">
                  Actor: <span className="text-[#F1E7DE]">{aud.actor_name || aud.actor_id}</span>
                </div>
                {aud.payload && (
                  <div className="text-[10px] text-[#A99A90] truncate max-w-xl mt-0.5">
                    {aud.payload}
                  </div>
                )}
              </div>
              <span className="text-[#A99A90] text-[10px] shrink-0">
                {new Date(aud.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

