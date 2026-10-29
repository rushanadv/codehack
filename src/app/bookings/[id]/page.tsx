'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
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
  GitCommit,
  ExternalLink,
  ChevronRight
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
    safety_gear_verified: true,
    calibration_confirmed: true,
    workstation_cleared: true,
    peripherals_accounted: true
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
      <div className="min-h-screen bg-[#11100F] py-32 text-center">
        <div className="w-7 h-7 border-2 border-[#B65E42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-[11px] font-mono text-[#8C827A] uppercase tracking-wider">
          Loading Reservation Lifecycle & Audit Trail...
        </div>
      </div>
    );
  }

  if (!data?.booking) {
    return (
      <div className="min-h-screen bg-[#11100F] py-32 text-center max-w-md mx-auto px-4">
        <AlertTriangle className="w-10 h-10 text-[#B65E42] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#F3EADF] mb-2 tracking-tight">Reservation Not Found</h2>
        <p className="text-xs text-[#8C827A] mb-6">
          The requested booking record could not be retrieved from the ledger.
        </p>
        <Link 
          href="/bookings" 
          className="inline-flex items-center gap-2 bg-[#B65E42] hover:bg-[#A35238] text-[#F3EADF] px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reservations
        </Link>
      </div>
    );
  }

  const { booking, conditionReports = [], auditEvents = [], nextReservation, isOwner, isBooker, isAdmin } = data;

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
        setReportSuccess(`${reportType === 'checkout' ? 'Check-in handover' : 'Return inspection'} logged in Resource Passport.`);
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
    <div className="min-h-screen bg-[#11100F] text-[#F3EADF] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8C827A]">
        <Link href="/bookings" className="hover:text-[#F3EADF] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Reservations
        </Link>
        <ChevronRight className="w-3 h-3 text-[#544B43]" />
        <span className="text-[#B8ADA0] truncate">{booking.id}</span>
      </div>

      {/* Top Header Card */}
      <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2 font-mono text-[11px]">
            <span className="text-[#8C827A]">ID: {booking.id}</span>
            <span className="text-[#544B43]">•</span>
            <span className="text-[#D69A49]">PASSPORT: {booking.resource_passport_id}</span>
            <span className="text-[#544B43]">•</span>
            <span className="text-[#8C827A]">{booking.resource_building}, {booking.resource_room}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F3EADF] tracking-tight">
            {booking.resource_title}
          </h1>
          <p className="text-xs text-[#8C827A] font-mono mt-1.5">
            Booker: <span className="text-[#B8ADA0]">{booking.user_name}</span> ({booking.user_email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium border ${
            booking.status === 'in_progress' ? 'bg-[#D69A49]/15 text-[#D69A49] border-[#D69A49]/30' :
            booking.status === 'confirmed' ? 'bg-[#B65E42]/15 text-[#B65E42] border-[#B65E42]/30' :
            booking.status === 'returned' ? 'bg-[#4E7A5D]/15 text-[#4E7A5D] border-[#4E7A5D]/30' :
            booking.status === 'delayed' ? 'bg-[#B84A39]/15 text-[#B84A39] border-[#B84A39]/30' :
            'bg-[#211E1B] text-[#8C827A] border-[#2C2723]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {booking.status.toUpperCase()}
          </span>

          <Link
            href={`/resources/${booking.resource_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#211E1B] hover:bg-[#2A2622] text-[#F3EADF] rounded-lg text-xs font-mono border border-[#38312C] transition-colors"
          >
            <span>Resource Ledger</span>
            <ExternalLink className="w-3 h-3 text-[#8C827A]" />
          </Link>
        </div>
      </div>

      {/* Visual Lifecycle Stepper */}
      <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] shadow-sm">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C827A] mb-4">
          Lifecycle State Transition
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                stage.done
                  ? 'bg-[#211E1B] border-[#38312C] text-[#F3EADF]'
                  : 'bg-[#151312] border-[#24201D] text-[#6B6158]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  stage.done ? 'bg-[#B65E42] text-white' : 'bg-[#211E1B] text-[#6B6158]'
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
          <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2723]">
              <h3 className="text-xs font-semibold font-mono uppercase text-[#F3EADF] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B65E42]" />
                Custody & Handover Inspection
              </h3>
              <span className="text-[10px] font-mono text-[#8C827A]">
                IMMUTABLE AUDIT RECORD
              </span>
            </div>

            {/* If Confirmed -> Checkout button */}
            {booking.status === 'confirmed' && (
              <div className="space-y-4">
                <p className="text-xs text-[#B8ADA0] leading-relaxed">
                  Before operating this resource, confirm prerequisite calibration and physical safety checks to start custody.
                </p>

                {/* Checklist */}
                <div className="space-y-2.5 text-xs font-mono bg-[#151312] p-4 rounded-lg border border-[#24201D]">
                  {Object.entries(checklist).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2.5 text-[#B8ADA0] cursor-pointer hover:text-[#F3EADF] transition-colors">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                        className="rounded border-[#38312C] text-[#B65E42] focus:ring-0 bg-[#211E1B]"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleHandoverReport('checkout')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#B65E42] hover:bg-[#A35238] text-white py-2.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Verify Handover & Start Custody
                </button>
              </div>
            )}

            {/* If In Progress or Delayed -> Return Handover Form */}
            {(booking.status === 'in_progress' || booking.status === 'delayed') && (
              <div className="space-y-4">
                <p className="text-xs text-[#B8ADA0] leading-relaxed">
                  Active allocation session in progress. Verify physical condition and submit final inspection report to complete return.
                </p>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8C827A] mb-1.5">
                    Return Condition Rating:
                  </label>
                  <select
                    value={conditionRating}
                    onChange={(e) => setConditionRating(e.target.value)}
                    className="w-full bg-[#211E1B] text-[#F3EADF] px-3.5 py-2.5 rounded-lg border border-[#38312C] text-xs font-mono focus:outline-none focus:border-[#B65E42]"
                  >
                    <option value="pristine">Pristine (Cleaned, calibrated, zero issues)</option>
                    <option value="good">Good (Normal nominal wear, cleaned)</option>
                    <option value="fair">Fair (Minor cosmetic wear noted)</option>
                    <option value="maintenance_required">Maintenance Required (Service flag)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8C827A] mb-1.5">
                    Inspection Notes / Discrepancies:
                  </label>
                  <input
                    type="text"
                    value={discrepancies}
                    onChange={(e) => setDiscrepancies(e.target.value)}
                    placeholder="e.g., Work surface cleaned, optical path inspected, consumable replaced."
                    className="w-full bg-[#211E1B] text-[#F3EADF] px-3.5 py-2.5 rounded-lg border border-[#38312C] text-xs placeholder:text-[#6B6158] focus:outline-none focus:border-[#B65E42]"
                  />
                </div>

                <button
                  onClick={() => handleHandoverReport('return')}
                  disabled={isSubmittingReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#B65E42] hover:bg-[#A35238] text-white py-2.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Return Inspection & Release Custody
                </button>

                {/* Overrun simulation on this active session */}
                <div className="pt-4 mt-4 border-t border-[#2C2723] space-y-2.5">
                  <div className="text-[11px] font-mono text-[#D69A49] uppercase flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    Simulate Experimental Overrun (Disruption Cascade)
                  </div>
                  <div className="flex items-center gap-2">
                    {[15, 30, 45].map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSimulateOverrun(m)}
                        disabled={isSimulatingDelay}
                        className="px-3 py-1.5 bg-[#211E1B] hover:bg-[#2A2622] text-[#B8ADA0] hover:text-[#F3EADF] rounded-md text-xs font-mono border border-[#38312C] transition-colors"
                      >
                        +{m}m Overrun
                      </button>
                    ))}
                  </div>
                  {delayMessage && (
                    <div className="p-3 bg-[#B84A39]/15 border border-[#B84A39]/30 rounded-lg text-xs text-[#F3EADF] font-mono">
                      {delayMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If already returned */}
            {booking.status === 'returned' && (
              <div className="p-4 rounded-lg bg-[#4E7A5D]/10 border border-[#4E7A5D]/30 text-xs text-[#F3EADF] font-mono space-y-1">
                <div className="font-semibold text-[#4E7A5D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Custody Completed & Verified
                </div>
                <div className="text-[#B8ADA0]">
                  Returned at: {new Date(booking.actual_return_time || booking.updated_at).toLocaleString()}
                </div>
                <div className="text-[#8C827A] text-[11px]">
                  All condition inspection records committed to the immutable resource ledger.
                </div>
              </div>
            )}

            {reportSuccess && (
              <div className="p-3 bg-[#4E7A5D]/15 border border-[#4E7A5D]/30 rounded-lg text-xs text-[#4E7A5D] font-mono">
                {reportSuccess}
              </div>
            )}
          </div>

          {/* Condition Reports Inspection History */}
          {conditionReports.length > 0 && (
            <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] space-y-4 shadow-sm">
              <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F3EADF]">
                Logged Inspection Reports ({conditionReports.length})
              </h3>
              <div className="space-y-3">
                {conditionReports.map((cr: any) => (
                  <div key={cr.id} className="p-4 rounded-lg bg-[#211E1B] border border-[#2C2723] text-xs space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#D69A49] uppercase font-semibold text-[10px]">
                        {cr.report_type} INSPECTION
                      </span>
                      <span className="text-[#8C827A] text-[10px]">
                        {new Date(cr.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[#B8ADA0]">
                      Inspector: <span className="text-[#F3EADF] font-medium">{cr.reporter_name}</span> • Rating: <span className="uppercase text-[#4E7A5D] font-bold">{cr.condition_rating}</span>
                    </div>
                    {cr.discrepancies && (
                      <p className="text-[#8C827A] text-[11px] font-mono bg-[#151312] p-2.5 rounded border border-[#24201D]">
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
          <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F3EADF] flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-[#B65E42]" />
              Immutable Audit Log
            </h3>

            {auditEvents.length === 0 ? (
              <div className="text-xs text-[#8C827A] py-4">No audit events recorded for this entity.</div>
            ) : (
              <div className="space-y-2.5">
                {auditEvents.map((aud: any) => (
                  <div key={aud.id} className="p-3 rounded-lg bg-[#211E1B] border border-[#2C2723] text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F3EADF] font-semibold text-[10px]">
                        {aud.action}
                      </span>
                      <span className="text-[#8C827A] text-[10px]">
                        {new Date(aud.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8C827A]">
                      Actor: <span className="text-[#B8ADA0]">{aud.actor_name || aud.actor_id}</span>
                    </div>
                    {aud.payload && (
                      <div className="text-[10px] text-[#6B6158] bg-[#151312] p-2 rounded border border-[#24201D] truncate max-w-full font-mono">
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
    <Suspense fallback={<div className="min-h-screen bg-[#11100F] py-32 text-center text-xs font-mono text-[#8C827A] uppercase tracking-wider">Loading Reservation...</div>}>
      <BookingDetailContent />
    </Suspense>
  );
}
