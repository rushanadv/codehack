'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  QrCode, 
  Upload,
  User,
  Zap,
  HelpCircle,
  GitCommit
} from 'lucide-react';
import { Booking, ConditionReport, AuditEvent } from '@/lib/types';

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Handover Checklist state
  const [conditionRating, setConditionRating] = useState('pristine');
  const [discrepancies, setDiscrepancies] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    safety_gear_worn: true,
    calibration_verified: true,
    workspace_clean: true,
    all_components_present: true
  });

  // Delay simulation on this booking
  const [isSimulatingDelay, setIsSimulatingDelay] = useState(false);
  const [delayMessage, setDelayMessage] = useState<string | null>(null);

  const fetchBookingDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error('Booking not found');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 text-center">
        <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Loading Booking Lifecycle & Audit History...
        </div>
      </div>
    );
  }

  if (!data?.booking) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
        <Link href="/bookings" className="bg-[#D4FF00] text-black px-4 py-2 rounded font-mono text-xs font-bold uppercase">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const { booking, conditionReports, auditEvents, nextReservation, isOwner, isBooker, isAdmin } = data;

  const handleHandoverReport = async (reportType: 'checkout' | 'return') => {
    setIsSubmittingReport(true);
    setReportSuccess(null);
    try {
      const res = await fetch('/api/handover/condition-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          resourceId: booking.resource_id,
          reportType,
          conditionRating,
          checklist,
          discrepancies: discrepancies || undefined,
          photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setReportSuccess(`${reportType === 'checkout' ? 'Check-in handover' : 'Return inspection'} recorded in Resource Passport.`);
        fetchBookingDetail();
      } else {
        alert(resData.error || 'Failed to submit condition report');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSimulateOverrun = async (mins: number) => {
    setIsSimulatingDelay(true);
    try {
      const res = await fetch('/api/promise-protection/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          delayMinutes: mins,
          reason: 'Interactive simulation of experimental overrun'
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setDelayMessage(`Delay of +${mins}m recorded. Promise Protection cascade evaluated: ${resData.result.riskLevel.toUpperCase()}`);
        fetchBookingDetail();
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
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="text-neutral-400">BOOKING ID: {booking.id}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-[#D4FF00]">PASSPORT: {booking.resource_passport_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {booking.resource_title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Booked by {booking.user_name} ({booking.user_email}) • {booking.resource_building}, {booking.resource_room}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`badge-tech ${
            booking.status === 'in_progress' ? 'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40' :
            booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
            booking.status === 'returned' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
            booking.status === 'delayed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
            'bg-neutral-500/20 text-neutral-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            STATUS: {booking.status.toUpperCase()}
          </span>

          <Link
            href={`/resources/${booking.resource_id}`}
            className="px-3 py-1.5 bg-[#12151B] hover:bg-white/10 text-white rounded text-xs font-mono uppercase border border-white/10"
          >
            Resource Passport →
          </Link>
        </div>
      </div>

      {/* Visual Lifecycle Stepper */}
      <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-4">
          Booking Lifecycle State Machine
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between ${
                stage.done
                  ? 'bg-[#151921] border-[#D4FF00]/40 text-white'
                  : 'bg-[#0A0C10] border-white/5 text-neutral-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  stage.done ? 'bg-[#D4FF00] text-black font-bold' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {idx + 1}
                </div>
                <span>{stage.label}</span>
              </div>
              {stage.done && <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Handover & Incident Actions (7 cols), Right Audit Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Handover Form Interface */}
          <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4FF00]" />
                Custody & Handover Inspection Console
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                PASSPORT AUDITED
              </span>
            </div>

            {/* If Confirmed -> Checkout button */}
            {booking.status === 'confirmed' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Before physical operation begins, verify all baseline safety requirements and record the starting condition into the Resource Passport.
                </p>

                {/* Checklist */}
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(checklist).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                        className="rounded border-white/20 text-[#D4FF00] focus:ring-0"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleHandoverReport('checkout')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Complete Verified Checkout & Begin Session
                </button>
              </div>
            )}

            {/* If In Progress or Delayed -> Return Handover Form */}
            {(booking.status === 'in_progress' || booking.status === 'delayed') && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Session is currently active. When work is complete, verify clean workspace shutdown and document return state.
                </p>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Returned Asset Condition Rating:
                  </label>
                  <select
                    value={conditionRating}
                    onChange={(e) => setConditionRating(e.target.value)}
                    className="w-full bg-[#12151B] text-white px-3 py-2 rounded border border-white/10 text-xs font-mono focus:outline-none focus:border-[#D4FF00]"
                  >
                    <option value="pristine">Pristine (Clean, zero issues)</option>
                    <option value="good">Good (Normal wear, cleaned)</option>
                    <option value="fair">Fair (Minor cosmetic wear)</option>
                    <option value="maintenance_required">Requires Preventative Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Inspection Notes / Discrepancy Observation:
                  </label>
                  <input
                    type="text"
                    value={discrepancies}
                    onChange={(e) => setDiscrepancies(e.target.value)}
                    placeholder="e.g. Nozzle purged and cooled, 84% spool remaining, work surface wiped down."
                    className="w-full bg-[#12151B] text-white px-3 py-2 rounded border border-white/10 text-xs focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>

                <button
                  onClick={() => handleHandoverReport('return')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Return Handover & Release Custody
                </button>

                {/* Overrun simulation on this active session */}
                <div className="pt-4 mt-4 border-t border-white/8 space-y-2">
                  <div className="text-[11px] font-mono text-amber-400 uppercase flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Simulate Overrun on This Active Session
                  </div>
                  <div className="flex items-center gap-2">
                    {[15, 30, 45].map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSimulateOverrun(m)}
                        disabled={isSimulatingDelay}
                        className="px-3 py-1 bg-[#151921] hover:bg-amber-500/20 hover:text-amber-300 text-neutral-300 rounded text-xs font-mono border border-white/10 transition-colors cursor-pointer"
                      >
                        +{m}m Overrun
                      </button>
                    ))}
                  </div>
                  {delayMessage && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 font-mono">
                      {delayMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If already returned */}
            {booking.status === 'returned' && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Custody Completed & Verified
                </div>
                <div>Returned at: {new Date(booking.actual_return_time || booking.updated_at).toLocaleString()}</div>
                <div>Full inspection reports archived into Resource Passport.</div>
              </div>
            )}

            {reportSuccess && (
              <div className="p-3 bg-[#D4FF00]/10 border border-[#D4FF00]/30 rounded text-xs text-[#D4FF00] font-mono">
                {reportSuccess}
              </div>
            )}
          </div>

          {/* Condition Reports Inspection History */}
          {conditionReports.length > 0 && (
            <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/8 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Condition Reports on This Booking ({conditionReports.length})
              </h3>
              <div className="space-y-3">
                {conditionReports.map((cr: any) => (
                  <div key={cr.id} className="p-4 rounded-lg bg-[#12151B] border border-white/5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#D4FF00] uppercase font-bold text-[10px]">
                        {cr.report_type} REPORT
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        {new Date(cr.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-neutral-300">
                      Reported by: <span className="text-white font-medium">{cr.reporter_name}</span> • Rating: <span className="uppercase text-[#D4FF00] font-bold">{cr.condition_rating}</span>
                    </div>
                    {cr.discrepancies && (
                      <p className="text-neutral-400 text-[11px] font-mono bg-black/40 p-2 rounded">
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
          <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-[#D4FF00]" />
              Immutable Audit Events
            </h3>

            {auditEvents.length === 0 ? (
              <div className="text-xs text-neutral-500">No audit logs recorded for this entity.</div>
            ) : (
              <div className="space-y-3">
                {auditEvents.map((aud: any) => (
                  <div key={aud.id} className="p-3.5 rounded-lg bg-[#12151B] border border-white/5 text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#D4FF00] font-bold text-[10px]">
                        {aud.action}
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        {new Date(aud.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-300">
                      Actor: <span className="text-white">{aud.actor_name || aud.actor_id}</span>
                    </div>
                    {aud.payload && (
                      <div className="text-[10px] text-neutral-400 bg-black/50 p-2 rounded truncate max-w-full">
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
    <Suspense fallback={<div className="min-h-screen py-32 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">Loading Booking...</div>}>
      <BookingDetailContent />
    </Suspense>
  );
}
