'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Inbox, 
  Check, 
  X, 
  Clock, 
  CalendarCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  User
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings?filter=owner_requests');
      const data = await res.json();
      setRequests(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: `Owner marked request as ${newStatus}`
        })
      });

      if (res.ok) {
        fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update request');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingList = requests.filter(r => r.status === 'pending');
  const pastList = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-8 border-b border-[#AD7257]/20">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
          <Inbox className="w-4 h-4" />
          <span>Custodial Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F1E7DE] tracking-tight">
          Booking Requests Queue
        </h1>
        <p className="text-sm text-[#D9C5B4] mt-1 max-w-xl">
          Review incoming student and researcher requests for your lab assets. Verify purpose and confirm reservations into the immutable schedule.
        </p>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#AD7257]/20">
          <span className="text-[#F1E7DE] font-bold uppercase">
            Awaiting Your Decision ({pendingList.length})
          </span>
          <button onClick={fetchRequests} className="text-[#A99A90] hover:text-[#F1E7DE] flex items-center gap-1 cursor-pointer transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-[#A99A90] uppercase tracking-widest">
            Loading Queued Requests...
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 text-center bg-[#170D0A] rounded-2xl border border-[#AD7257]/25 text-[#D9C5B4] text-xs shadow-xl">
            Queue clear. Zero requests currently pending custodial review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#170D0A] border border-[#D96335]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge-tech bg-[#D96335]/25 text-[#D96335] border border-[#D96335]/40 font-mono">
                      PENDING REVIEW
                    </span>
                    <span className="badge-tech bg-[#24110C] text-[#D9C5B4] border border-[#AD7257]/25 font-mono">
                      {req.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F1E7DE]">
                    {req.resource_title}
                  </h3>

                  <div className="text-xs text-[#D9C5B4] flex items-center gap-2 font-mono">
                    <User className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Applicant: <strong className="text-[#F1E7DE]">{req.user_name}</strong> ({req.user_email})
                  </div>

                  <p className="text-xs text-[#D9C5B4] max-w-2xl font-sans bg-[#24110C] p-3.5 rounded-xl border border-[#AD7257]/20 leading-relaxed">
                    <strong className="font-mono text-[#A99A90] uppercase text-[10px] block mb-0.5">Stated Purpose:</strong>
                    {req.purpose}
                  </p>

                  <div className="text-[11px] font-mono text-[#A99A90] flex items-center gap-4 pt-1">
                    <span>Requested: {new Date(req.start_time).toLocaleString()}</span>
                    <span>Fee: <strong className="text-[#F1E7DE]">₹{req.total_cost}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleAction(req.id, 'cancelled')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-mono text-xs uppercase border border-red-500/30 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleAction(req.id, 'confirmed')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Reservation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Decision History */}
      {pastList.length > 0 && (
        <div className="space-y-4 pt-8">
          <div className="font-mono text-xs pb-3 border-b border-[#AD7257]/20 text-[#F1E7DE] font-bold uppercase">
            Resolved Decision History ({pastList.length})
          </div>

          <div className="space-y-3">
            {pastList.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-[#170D0A] border border-[#AD7257]/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#F1E7DE]">{req.resource_title}</div>
                  <div className="text-[#A99A90] text-[11px] font-mono">
                    User: {req.user_name} • {new Date(req.start_time).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge-tech bg-[#24110C] text-[#D9C5B4] border border-[#AD7257]/20 uppercase font-mono">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

