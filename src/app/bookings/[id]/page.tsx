'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CalendarCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  GitCommit,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Booking } from '@/lib/types';

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [conditionReports, setConditionReports] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handover state
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [conditionRating, setConditionRating] = useState('good');
  const [discrepancies, setDiscrepancies] = useState('');
  const [checklist, setChecklist] = useState({
    optics_inspected: true,
    calibration_verified: true,
    safety_interlock_tested: true,
    workspace_sanitized: true
  });
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Overrun simulation state
  const [isSimulatingDelay, setIsSimulatingDelay] = useState(false);
  const [delayMessage, setDelayMessage] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error('Booking not found');
      const data = await res.json();
      setBooking(data.booking);
      setConditionReports(data.conditionReports || []);
      setAuditEvents(data.auditEvents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 text-center">
        <div className="w-6 h-6 border-2 border-[#82996D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
          Loading Booking Lifecycle...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4 space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#C79A49] mx-auto" />
        <h2 className="text-base font-semibold text-[#F1F0E5]">Booking Not Found</h2>
        <p className="text-xs text-[#B7C2B1]">The specified reservation ID does not exist.</p>
        <Link 
          href="/bookings" 
          className="inline-flex items-center gap-1.5 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] px-4 py-2 rounded-md text-xs font-medium border border-[#344438] transition-colors"
        >
          Return to Bookings
        </Link>
      </div>
    );
  }

  const handleHandoverReport = async (reportType: 'checkout' | 'return') => {
    setIsSubmittingReport(true);
    setReportSuccess(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          conditionRating,
          discrepancies: discrepancies || (reportType === 'checkout' ? 'Nominal pre-operation checklist verified.' : 'Nominal post-operation return handover.'),
          checklist
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReportSuccess(`Successfully registered ${reportType} report & updated custody stage.`);
        fetchDetail();
      } else {
        alert(data.error || 'Failed to submit handover report');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSimulateOverrun = async (delayMins: number) => {
    setIsSimulatingDelay(true);
    setDelayMessage(null);
    try {
      const res = await fetch('/api/promise-protection/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          delayMinutes: delayMins,
          reason: 'Extended analytical calibration during active session'
        })
      });

      const data = await res.json();
      if (data.success) {
        setDelayMessage(`Simulated +${delayMins}m delay. Risk level: ${data.result.riskLevel.toUpperCase()}.`);
        fetchDetail();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingDelay(false);
    }
  };

  const lifecycleStages = [
    { label: 'Requested', done: true },
    { label: 'Confirmed', done: ['confirmed', 'in_progress', 'returned', 'delayed'].includes(booking.status) },
    { label: 'Active Custody', done: ['in_progress', 'returned', 'delayed'].includes(booking.status) },
    { label: 'Returned & Audited', done: booking.status === 'returned' }
  ];

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#7E8D77]">
        <Link href="/bookings" className="hover:text-[#F1F0E5] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Reservations
        </Link>
        <ChevronRight className="w-3 h-3 text-[#344438]" />
        <span className="text-[#B7C2B1] truncate">{booking.id}</span>
      </div>

      {/* Top Header Card */}
      <div className="p-6 rounded-xl bg-[#17251B] border border-[#344438] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2 font-mono text-[11px]">
            <span className="text-[#7E8D77]">ID: {booking.id}</span>
            <span className="text-[#344438]">•</span>
            <span className="text-[#C7BC91]">PASSPORT: {booking.resource_passport_id}</span>
            <span className="text-[#344438]">•</span>
            <span className="text-[#7E8D77]">{booking.resource_building}, {booking.resource_room}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F0E5] tracking-tight">
            {booking.resource_title}
          </h1>
          <p className="text-xs text-[#7E8D77] font-mono mt-1.5">
            Booker: <span className="text-[#B7C2B1]">{booking.user_name}</span> ({booking.user_email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium border ${
            booking.status === 'in_progress' ? 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40' :
            booking.status === 'confirmed' ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40' :
            booking.status === 'returned' ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40' :
            booking.status === 'delayed' ? 'bg-[#B84A39]/20 text-[#B84A39] border-[#B84A39]/40' :
            'bg-[#203025] text-[#7E8D77] border-[#344438]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {booking.status.toUpperCase()}
          </span>

          <Link
            href={`/resources/${booking.resource_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#203025] hover:bg-[#293B2F] text-[#F1F0E5] rounded-lg text-xs font-mono border border-[#344438] transition-colors"
          >
            <span>Resource Ledger</span>
            <ExternalLink className="w-3 h-3 text-[#7E8D77]" />
          </Link>
        </div>
      </div>

      {/* Visual Lifecycle Stepper */}
      <div className="p-6 rounded-xl bg-[#17251B] border border-[#344438] shadow-sm">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#7E8D77] mb-4">
          Lifecycle State Transition
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                stage.done
                  ? 'bg-[#203025] border-[#344438] text-[#F1F0E5]'
                  : 'bg-[#0D1812] border-[#344438]/50 text-[#7E8D77]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  stage.done ? 'bg-[#82996D] text-[#0B1510]' : 'bg-[#203025] text-[#7E8D77]'
                }`}>
                  {idx + 1}
                </div>
                <span>{stage.label}</span>
              </div>
              {stage.done && <CheckCircle2 className="w-4 h-4 text-[#4E7A5D]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Handover & Incident Actions (7 cols), Right Audit Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Handover Form Interface */}
          <div className="p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#344438]">
              <h3 className="text-xs font-semibold font-mono uppercase text-[#F1F0E5] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#82996D]" />
                Custody & Handover Inspection
              </h3>
              <span className="text-[10px] font-mono text-[#7E8D77]">
                IMMUTABLE AUDIT RECORD
              </span>
            </div>

            {/* If Confirmed -> Checkout button */}
            {booking.status === 'confirmed' && (
              <div className="space-y-4">
                <p className="text-xs text-[#B7C2B1] leading-relaxed">
                  Before operating this resource, confirm prerequisite calibration and physical safety checks to start custody.
                </p>

                {/* Checklist */}
                <div className="space-y-2.5 text-xs font-mono bg-[#0D1812] p-4 rounded-lg border border-[#344438]">
                  {Object.entries(checklist).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2.5 text-[#B7C2B1] cursor-pointer hover:text-[#F1F0E5] transition-colors">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                        className="rounded border-[#344438] text-[#82996D] focus:ring-0 bg-[#203025]"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleHandoverReport('checkout')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] py-2.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Verify Handover & Start Custody
                </button>
              </div>
            )}

            {/* If In Progress or Delayed -> Return Handover Form */}
            {(booking.status === 'in_progress' || booking.status === 'delayed') && (
              <div className="space-y-4">
                <p className="text-xs text-[#B7C2B1] leading-relaxed">
                  Active allocation session in progress. Verify physical condition and submit final inspection report to complete return.
                </p>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#7E8D77] mb-1.5">
                    Return Condition Rating:
                  </label>
                  <select
                    value={conditionRating}
                    onChange={(e) => setConditionRating(e.target.value)}
                    className="w-full bg-[#0D1812] text-[#F1F0E5] px-3.5 py-2.5 rounded-lg border border-[#344438] text-xs font-mono focus:outline-none focus:border-[#82996D]"
                  >
                    <option value="pristine">Pristine (Cleaned, calibrated, zero issues)</option>
                    <option value="good">Good (Normal nominal wear, cleaned)</option>
                    <option value="fair">Fair (Minor cosmetic wear noted)</option>
                    <option value="maintenance_required">Maintenance Required (Service flag)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#7E8D77] mb-1.5">
                    Inspection Notes / Discrepancies:
                  </label>
                  <input
                    type="text"
                    value={discrepancies}
                    onChange={(e) => setDiscrepancies(e.target.value)}
                    placeholder="e.g., Work surface cleaned, optical path inspected, consumable replaced."
                    className="w-full bg-[#0D1812] text-[#F1F0E5] px-3.5 py-2.5 rounded-lg border border-[#344438] text-xs placeholder:text-[#7E8D77] focus:outline-none focus:border-[#82996D]"
                  />
                </div>

                <button
                  onClick={() => handleHandoverReport('return')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] py-2.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Return Inspection & Release Custody
                </button>

                {/* Overrun simulation on this active session */}
                <div className="pt-4 mt-4 border-t border-[#344438] space-y-2.5">
                  <div className="text-[11px] font-mono text-[#C7BC91] uppercase flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    Simulate Experimental Overrun (Disruption Cascade)
                  </div>
                  <div className="flex items-center gap-2">
                    {[15, 30, 45].map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSimulateOverrun(m)}
                        disabled={isSimulatingDelay}
                        className="px-3 py-1.5 bg-[#203025] hover:bg-[#293B2F] text-[#B7C2B1] hover:text-[#F1F0E5] rounded-md text-xs font-mono border border-[#344438] transition-colors"
                      >
                        +{m}m Overrun
                      </button>
                    ))}
                  </div>
                  {delayMessage && (
                    <div className="p-3 bg-[#B84A39]/15 border border-[#B84A39]/30 rounded-lg text-xs text-[#F1F0E5] font-mono">
                      {delayMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If already returned */}
            {booking.status === 'returned' && (
              <div className="p-4 rounded-lg bg-[#4E7A5D]/15 border border-[#4E7A5D]/30 text-xs text-[#F1F0E5] font-mono space-y-1">
                <div className="font-semibold text-[#A9BE89] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Custody Completed & Verified
                </div>
                <div className="text-[#B7C2B1]">
                  Returned at: {new Date(booking.actual_return_time || booking.updated_at).toLocaleString()}
                </div>
                <div className="text-[#7E8D77] text-[11px]">
                  All condition inspection records committed to the immutable resource ledger.
                </div>
              </div>
            )}

            {reportSuccess && (
              <div className="p-3 bg-[#4E7A5D]/20 border border-[#4E7A5D]/40 rounded-lg text-xs text-[#A9BE89] font-mono">
                {reportSuccess}
              </div>
            )}
          </div>

          {/* Condition Reports Inspection History */}
          {conditionReports.length > 0 && (
            <div className="p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-4 shadow-sm">
              <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F1F0E5]">
                Logged Inspection Reports ({conditionReports.length})
              </h3>
              <div className="space-y-3">
                {conditionReports.map((cr: any) => (
                  <div key={cr.id} className="p-4 rounded-lg bg-[#203025] border border-[#344438] text-xs space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#C7BC91] uppercase font-semibold text-[10px]">
                        {cr.report_type} INSPECTION
                      </span>
                      <span className="text-[#7E8D77] text-[10px]">
                        {new Date(cr.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[#B7C2B1]">
                      Inspector: <span className="text-[#F1F0E5] font-medium">{cr.reporter_name}</span> • Rating: <span className="uppercase text-[#A9BE89] font-bold">{cr.condition_rating}</span>
                    </div>
                    {cr.discrepancies && (
                      <p className="text-[#7E8D77] text-[11px] font-mono bg-[#0D1812] p-2.5 rounded border border-[#344438]">
                        {cr.discrepancies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Audit Events Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F1F0E5] flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-[#82996D]" />
              Immutable Audit Log
            </h3>

            {auditEvents.length === 0 ? (
              <div className="text-xs text-[#7E8D77] py-4">No audit events recorded for this entity.</div>
            ) : (
              <div className="space-y-2.5">
                {auditEvents.map((aud: any) => (
                  <div key={aud.id} className="p-3 rounded-lg bg-[#203025] border border-[#344438] text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F1F0E5] font-semibold text-[10px]">
                        {aud.action}
                      </span>
                      <span className="text-[#7E8D77] text-[10px]">
                        {new Date(aud.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7E8D77]">
                      Actor: <span className="text-[#B7C2B1]">{aud.actor_name || aud.actor_id}</span>
                    </div>
                    {aud.payload && (
                      <div className="text-[10px] text-[#7E8D77] bg-[#0D1812] p-2 rounded border border-[#344438] truncate max-w-full font-mono">
                        {aud.payload}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1510] py-32 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">Loading Reservation...</div>}>
      <BookingDetailContent />
    </Suspense>
  );
}
