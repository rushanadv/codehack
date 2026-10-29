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
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#344438]">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#C7BC91]">
          <Inbox className="w-3.5 h-3.5" />
          <span>Custodial Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F0E5] tracking-tight">
          Allocation Requests Queue
        </h1>
        <p className="text-xs text-[#B7C2B1] mt-1.5 max-w-xl">
          Review incoming researcher requests for lab assets. Verify operator prerequisites and confirm reservations into the schedule.
        </p>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-[#344438]">
          <span className="text-[#B7C2B1] font-medium uppercase tracking-wider">
            Awaiting Review ({pendingList.length})
          </span>
          <button 
            onClick={fetchRequests} 
            className="text-[#7E8D77] hover:text-[#F1F0E5] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 
            <span>Sync</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
            Loading Queued Requests...
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 text-center bg-[#17251B] rounded-xl border border-[#344438] text-[#7E8D77] text-xs">
            Queue clear. Zero requests currently pending custodial review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#C79A49]/15 text-[#C79A49] border border-[#C79A49]/30">
                      PENDING REVIEW
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#203025] text-[#7E8D77] border border-[#344438]">
                      {req.id}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F1F0E5]">
                    {req.resource_title}
                  </h3>

                  <div className="text-xs text-[#B7C2B1] flex items-center gap-2 font-mono">
                    <User className="w-3.5 h-3.5 text-[#82996D]" />
                    Applicant: <strong className="text-[#F1F0E5] font-medium">{req.user_name}</strong> ({req.user_email})
                  </div>

                  <p className="text-xs text-[#B7C2B1] max-w-2xl bg-[#101D15] p-3 rounded-lg border border-[#344438] leading-relaxed">
                    <strong className="font-mono text-[#7E8D77] uppercase text-[10px] block mb-0.5">Stated Purpose:</strong>
                    {req.purpose}
                  </p>

                  <div className="text-[11px] font-mono text-[#7E8D77] flex items-center gap-4 pt-1">
                    <span>Requested: {new Date(req.start_time).toLocaleString()}</span>
                    <span>Fee: <strong className="text-[#F1F0E5]">${req.total_cost}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 self-end md:self-auto">
                  <button
                    onClick={() => handleAction(req.id, 'cancelled')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#203025] hover:bg-[#B84A39]/20 text-[#B7C2B1] hover:text-[#B84A39] rounded-lg font-mono text-xs border border-[#344438] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleAction(req.id, 'confirmed')}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#82996D] hover:bg-[#94AC7E] text-[#0B1510] font-semibold rounded-lg font-mono text-xs tracking-wider transition-colors"
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
          <div className="font-mono text-xs pb-3 border-b border-[#344438] text-[#B7C2B1] font-medium uppercase tracking-wider">
            Resolved Decision History ({pastList.length})
          </div>

          <div className="space-y-2.5">
            {pastList.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-lg bg-[#17251B] border border-[#344438] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-[#F1F0E5]">{req.resource_title}</div>
                  <div className="text-[#7E8D77] text-[11px] font-mono">
                    User: {req.user_name} • {new Date(req.start_time).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#203025] text-[#7E8D77] border border-[#344438] uppercase">
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
