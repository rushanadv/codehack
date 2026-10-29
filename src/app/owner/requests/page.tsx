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
    <div className="min-h-screen bg-[#11100F] text-[#F3EADF] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#2C2723]">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#D69A49]">
          <Inbox className="w-3.5 h-3.5" />
          <span>Custodial Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F3EADF] tracking-tight">
          Allocation Requests Queue
        </h1>
        <p className="text-xs text-[#8C827A] mt-1.5 max-w-xl">
          Review incoming researcher requests for lab assets. Verify operator prerequisites and confirm reservations into the schedule.
        </p>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#2C2723]">
          <span className="text-[#B8ADA0] font-medium uppercase tracking-wider">
            Awaiting Review ({pendingList.length})
          </span>
          <button 
            onClick={fetchRequests} 
            className="text-[#8C827A] hover:text-[#F3EADF] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 
            <span>Sync</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-[#8C827A] uppercase tracking-wider">
            Loading Queued Requests...
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 text-center bg-[#191715] rounded-xl border border-[#2C2723] text-[#8C827A] text-xs">
            Queue clear. Zero requests currently pending custodial review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#2C2723] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#D69A49]/15 text-[#D69A49] border border-[#D69A49]/30">
                      PENDING REVIEW
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#211E1B] text-[#8C827A] border border-[#2C2723]">
                      {req.id}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F3EADF]">
                    {req.resource_title}
                  </h3>

                  <div className="text-xs text-[#8C827A] flex items-center gap-2 font-mono">
                    <User className="w-3.5 h-3.5 text-[#B65E42]" />
                    Applicant: <strong className="text-[#F3EADF] font-medium">{req.user_name}</strong> ({req.user_email})
                  </div>

                  <p className="text-xs text-[#8C827A] max-w-2xl bg-[#151312] p-3 rounded-lg border border-[#24201D] leading-relaxed">
                    <strong className="font-mono text-[#6B6158] uppercase text-[10px] block mb-0.5">Stated Purpose:</strong>
                    {req.purpose}
                  </p>

                  <div className="text-[11px] font-mono text-[#6B6158] flex items-center gap-4 pt-1">
                    <span>Requested: {new Date(req.start_time).toLocaleString()}</span>
                    <span>Fee: <strong className="text-[#F3EADF]">${req.total_cost}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 self-end md:self-auto">
                  <button
                    onClick={() => handleAction(req.id, 'cancelled')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#211E1B] hover:bg-[#B84A39]/20 text-[#B8ADA0] hover:text-[#B84A39] rounded-lg font-mono text-xs border border-[#38312C] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleAction(req.id, 'confirmed')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B65E42] hover:bg-[#A35238] text-white font-medium rounded-lg font-mono text-xs tracking-wider transition-colors"
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
        <div className="space-y-4 pt-6">
          <div className="font-mono text-xs pb-3 border-b border-[#2C2723] text-[#B8ADA0] font-medium uppercase tracking-wider">
            Resolved Decision History ({pastList.length})
          </div>

          <div className="space-y-2.5">
            {pastList.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-lg bg-[#191715] border border-[#2C2723] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-[#F3EADF]">{req.resource_title}</div>
                  <div className="text-[#8C827A] text-[11px] font-mono">
                    User: {req.user_name} • {new Date(req.start_time).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#211E1B] text-[#8C827A] border border-[#2C2723] uppercase">
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
