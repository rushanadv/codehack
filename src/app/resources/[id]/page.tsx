'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Layers, 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  RefreshCw,
  Building2,
  Cpu,
  User,
  Wrench,
  FileText,
  Sparkles
} from 'lucide-react';
import { Resource, ConditionReport, MaintenanceRecord } from '@/lib/types';

function ResourceDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'booking' | 'passport' | 'maintenance'>('booking');

  // Booking Form State
  const [bookingHours, setBookingHours] = useState('2');
  const [startOffsetHours, setStartOffsetHours] = useState('2');
  const [purpose, setPurpose] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Waitlist Form State
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/resources/${id}`);
      if (!res.ok) throw new Error('Resource not found');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error(e);
      setBookingError(e.message);
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
        <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Loading Resource Passport & Availability...
        </div>
      </div>
    );
  }

  if (!data?.resource) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
        <p className="text-xs text-neutral-400 mb-6">The specified identifier does not match any registered asset.</p>
        <Link href="/explore" className="bg-[#D4FF00] text-black px-4 py-2 rounded font-mono text-xs font-bold uppercase">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const { resource, userEligibility, passport, bookings, alternatives } = data;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

    // Calculate dates
    const start = new Date(Date.now() + parseFloat(startOffsetHours) * 3600000);
    const end = new Date(start.getTime() + parseFloat(bookingHours) * 3600000);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          purpose: purpose || 'Academic Research Verification'
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setBookingError(result.error || 'Booking reservation could not be completed.');
      } else {
        setBookingSuccess(result.booking);
        fetchDetail();
      }
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setIsJoiningWaitlist(true);
    const start = new Date(Date.now() + parseFloat(startOffsetHours) * 3600000);
    const end = new Date(start.getTime() + parseFloat(bookingHours) * 3600000);

    try {
      const res = await fetch('/api/fairshare/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          requestedStart: start.toISOString(),
          requestedEnd: end.toISOString(),
          notes: purpose || 'FairShare Academic Research Queue'
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setWaitlistSuccess(`Successfully joined waitlist. Your queue position: ${result.entry.queue_position} (Priority Score: ${result.entry.priority_score})`);
      } else {
        setBookingError(result.error || 'Failed to join waitlist');
      }
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#AD7257]/20 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#A99A90]">
          <Link href="/explore" className="hover:text-[#F1E7DE] transition-colors">Directory</Link>
          <span className="text-[#AD7257]">/</span>
          <span className="text-[#D9C5B4] uppercase">{resource.category}</span>
          <span className="text-[#AD7257]">/</span>
          <span className="text-[#D4FF00]">{resource.passport_id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge-tech bg-[#170D0A] text-[#D9C5B4] border border-[#AD7257]/30 font-mono">
            Turnaround Buffer: +{resource.turnaround_buffer_mins}m
          </span>
          <span className={`badge-tech font-mono ${
            resource.status === 'available'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-[#D96335]/25 text-[#D96335] border border-[#D96335]/40'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {resource.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Details, Specs, Passport), Right 1 Col (Booking / Handover Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Hero Image & Overlay */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-[#AD7257]/30 bg-[#090706]">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#170D0A] via-transparent to-black/40"></div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[11px] font-mono text-[#D4FF00] uppercase tracking-wider bg-[#090706]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-[#AD7257]/30 inline-block mb-2">
                {resource.subcategory}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F1E7DE] tracking-tight">
                {resource.title}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs for Details */}
          <div className="flex items-center gap-2 border-b border-[#AD7257]/20 pb-2">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-[#24110C] text-[#D4FF00] font-bold border border-[#AD7257]/30'
                  : 'text-[#A99A90] hover:text-[#F1E7DE]'
              }`}
            >
              Specifications & Access
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'passport'
                  ? 'bg-[#24110C] text-[#D4FF00] font-bold border border-[#AD7257]/30'
                  : 'text-[#A99A90] hover:text-[#F1E7DE]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#D4FF00]" />
              Resource Passport ({passport.conditionReports.length} Logs)
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'maintenance'
                  ? 'bg-[#24110C] text-[#D4FF00] font-bold border border-[#AD7257]/30'
                  : 'text-[#A99A90] hover:text-[#F1E7DE]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Maintenance History ({passport.maintenanceRecords.length})
            </button>
          </div>

          {/* TAB 1: SPECIFICATIONS & ACCESS */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 space-y-3 shadow-xl">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">Asset Profile</h3>
                <p className="text-sm text-[#D9C5B4] leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {Object.entries(resource.specifications || {}).map(([key, val]) => (
                    <div key={key} className="p-3.5 rounded-xl bg-[#24110C] border border-[#AD7257]/20 flex flex-col justify-between">
                      <span className="text-[#A99A90] capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-[#F1E7DE] font-medium mt-1">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custody & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-xl">
                  <div className="text-[10px] font-mono text-[#A99A90] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Custodial Faculty & Owner
                  </div>
                  <div className="font-bold text-[#F1E7DE] text-sm">{resource.owner_name}</div>
                  <div className="text-xs text-[#D9C5B4] mt-0.5">{resource.owner_department}</div>
                  <div className="text-xs text-[#A99A90]">{resource.owner_institution}</div>
                </div>

                <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-xl">
                  <div className="text-[10px] font-mono text-[#A99A90] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4FF00]" />
                    Physical Location
                  </div>
                  <div className="font-bold text-[#F1E7DE] text-sm">{resource.building}</div>
                  <div className="text-xs text-[#D9C5B4] mt-0.5">{resource.room}</div>
                  <div className="text-xs text-[#A99A90]">{resource.location}</div>
                </div>
              </div>

              {/* SkillGate Gatekeeper Status */}
              <div className={`p-6 rounded-2xl border flex items-start gap-4 shadow-xl ${
                userEligibility.isEligible
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#D96335]/15 border-[#D96335]/40'
              }`}>
                {userEligibility.isEligible ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-[#D96335] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider font-bold text-[#F1E7DE]">
                    {userEligibility.isEligible ? 'SkillGate Verification: Cleared' : 'SkillGate Verification: Restricted'}
                  </div>
                  <p className="text-xs text-[#D9C5B4] mt-1 leading-relaxed">
                    {userEligibility.isEligible
                      ? 'Your profile contains verified certification meeting all mandatory safety clearances for this resource.'
                      : `You have not verified the required qualification: "${userEligibility.missingSkills.join(', ')}". Booking requests will be rejected by the server.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCE PASSPORT */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                {/* QR Code */}
                <div className="p-4 bg-[#24110C] border border-[#AD7257]/30 rounded-2xl shrink-0 shadow-inner">
                  <img
                    src={passport.qrCodeDataUrl}
                    alt={`QR Code for ${resource.passport_id}`}
                    className="w-40 h-40"
                  />
                  <div className="text-center font-mono text-[9px] text-[#D4FF00] mt-2 font-bold tracking-wider">
                    SCAN FOR HANDOVER
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-[#A99A90] uppercase tracking-widest">
                    Digital Asset Passport
                  </div>
                  <div className="text-xl font-bold text-[#F1E7DE]">{passport.passportId}</div>
                  <div className="text-[#D9C5B4]">Serial Number: {passport.serialNumber}</div>
                  <div className="text-[#D9C5B4]">Condition Rating: <span className="text-[#D4FF00] uppercase font-bold">{passport.conditionRating}</span></div>
                  <div className="text-[11px] text-[#A99A90] leading-relaxed font-sans mt-2">
                    Scannable physical QR attached to asset enclosure. Resolves to this verified audit passport for authorized checkout and return condition logging.
                  </div>
                </div>
              </div>

              {/* Condition Log History */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">
                  Handover & Condition Reports History
                </h3>

                {passport.conditionReports.length === 0 ? (
                  <p className="text-xs text-[#A99A90]">No condition reports logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {passport.conditionReports.map((report: any) => (
                      <div key={report.id} className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 text-xs space-y-2">
                        <div className="flex items-center justify-between font-mono">
                          <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                            report.report_type === 'checkout' ? 'bg-[#D96335]/20 text-[#D96335]' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {report.report_type} INSPECTION
                          </span>
                          <span className="text-[#A99A90] text-[10px]">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[#D9C5B4]">
                          Inspected by: <span className="text-[#F1E7DE] font-medium">{report.reporter_name}</span> • Rating: <span className="text-[#D4FF00] font-bold uppercase">{report.condition_rating}</span>
                        </div>
                        {report.discrepancies && (
                          <div className="p-2.5 rounded-lg bg-[#170D0A] text-[#D9C5B4] font-mono text-[11px] border border-[#AD7257]/20">
                            Notes / Diff: {report.discrepancies}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE LOGS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">
                  Preventative & Corrective Maintenance History
                </h3>

                {passport.maintenanceRecords.length === 0 ? (
                  <p className="text-xs text-[#A99A90]">No maintenance records logged.</p>
                ) : (
                  <div className="space-y-3">
                    {passport.maintenanceRecords.map((m: any) => (
                      <div key={m.id} className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 text-xs space-y-2">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#D4FF00] font-bold uppercase text-[11px]">
                            {m.maintenance_type.replace('_', ' ')}
                          </span>
                          <span className="text-[#A99A90] text-[10px]">
                            {new Date(m.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#D9C5B4] leading-relaxed">{m.description}</p>
                        {m.parts_replaced && (
                          <div className="text-[11px] font-mono text-[#A99A90]">
                            Parts Replaced: <span className="text-[#F1E7DE]">{m.parts_replaced}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equivalent Alternatives Section */}
          {alternatives && alternatives.length > 0 && (
            <div className="pt-6 border-t border-[#AD7257]/20">
              <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compatible Alternative Assets</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {alternatives.map((alt: any) => (
                  <Link
                    key={alt.id}
                    href={`/resources/${alt.id}`}
                    className="p-4 rounded-xl bg-[#170D0A] border border-[#AD7257]/25 hover:border-[#D4FF00]/40 transition-colors block text-xs shadow-md"
                  >
                    <div className="font-bold text-[#F1E7DE] truncate">{alt.title}</div>
                    <div className="text-[11px] text-[#A99A90] mt-1 font-mono">₹{alt.hourly_rate}/hr • {alt.location}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking & Reservation Console (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-[#170D0A] border border-[#AD7257]/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Pricing Summary */}
            <div className="flex items-baseline justify-between pb-5 border-b border-[#AD7257]/20">
              <div>
                <span className="text-3xl font-extrabold text-[#F1E7DE] font-mono">
                  ₹{resource.hourly_rate}
                </span>
                <span className="text-xs text-[#A99A90] ml-1">/ hour</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#A99A90] uppercase">Deposit</span>
                <div className="text-xs font-mono text-[#F1E7DE]">₹{resource.deposit || 0}</div>
              </div>
            </div>

            {/* Live Active Reservation Warning if In Use */}
            {resource.status === 'in_use' && (
              <div className="p-3.5 rounded-xl bg-[#24110C] border border-[#D96335]/40 text-xs text-[#D96335] font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Currently Operating
                </div>
                <div className="text-[11px] opacity-90 text-[#D9C5B4]">
                  Active session running. Reservations can be scheduled after turnaround window.
                </div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A99A90] mb-1.5">
                  Schedule Start Offset
                </label>
                <select
                  value={startOffsetHours}
                  onChange={(e) => setStartOffsetHours(e.target.value)}
                  className="w-full bg-[#24110C] text-[#F1E7DE] px-3.5 py-2.5 rounded-xl border border-[#AD7257]/30 text-xs font-mono focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="1">Starts in 1 Hour</option>
                  <option value="2">Starts in 2 Hours</option>
                  <option value="4">Starts in 4 Hours</option>
                  <option value="24">Tomorrow Morning (24h)</option>
                  <option value="48">In 2 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A99A90] mb-1.5">
                  Duration (Hours)
                </label>
                <select
                  value={bookingHours}
                  onChange={(e) => setBookingHours(e.target.value)}
                  className="w-full bg-[#24110C] text-[#F1E7DE] px-3.5 py-2.5 rounded-xl border border-[#AD7257]/30 text-xs font-mono focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="1">1 Hour Session</option>
                  <option value="2">2 Hours Session</option>
                  <option value="3">3 Hours Session</option>
                  <option value="4">4 Hours Session</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A99A90] mb-1.5">
                  Research Purpose / Thesis Ref
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Master thesis prototype run"
                  className="w-full bg-[#24110C] text-[#F1E7DE] px-3.5 py-2.5 rounded-xl border border-[#AD7257]/30 text-xs focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              {/* Cost Calculation */}
              <div className="p-4 rounded-xl bg-[#24110C] border border-[#AD7257]/20 font-mono text-xs space-y-2">
                <div className="flex justify-between text-[#A99A90]">
                  <span>Usage Fee ({bookingHours} hrs):</span>
                  <span>₹{parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
                <div className="flex justify-between text-[#A99A90]">
                  <span>Turnaround Buffer (+{resource.turnaround_buffer_mins}m):</span>
                  <span className="text-[#D4FF00]">Included</span>
                </div>
                <div className="flex justify-between text-[#F1E7DE] font-bold pt-2 border-t border-[#AD7257]/20">
                  <span>Estimated Total:</span>
                  <span>₹{parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isBooking || resource.status === 'maintenance'}
                className="w-full flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4FF00]/15 disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Checking ACID Locks...
                  </>
                ) : (
                  <>
                    Confirm Reservation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Error / Conflict Alert with FairShare Waitlist Option */}
            {bookingError && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-[#F1E7DE] space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{bookingError}</div>
                </div>

                {bookingError.includes('Booking Conflict') && !waitlistSuccess && (
                  <button
                    onClick={handleJoinWaitlist}
                    disabled={isJoiningWaitlist}
                    className="w-full py-2.5 bg-[#24110C] hover:bg-[#2F1711] text-[#F1E7DE] rounded-xl font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#AD7257]/30"
                  >
                    {isJoiningWaitlist ? 'Enrolling...' : 'Join FairShare Waitlist'}
                  </button>
                )}
              </div>
            )}

            {/* Waitlist Success Message */}
            {waitlistSuccess && (
              <div className="p-3.5 rounded-xl bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs text-[#D4FF00] font-mono">
                <CheckCircle2 className="w-4 h-4 mb-1 inline mr-1.5" />
                {waitlistSuccess}
              </div>
            )}

            {/* Booking Success Confirmation */}
            {bookingSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-[#F1E7DE] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Reservation Confirmed!
                </div>
                <div className="text-[11px] leading-relaxed text-[#D9C5B4]">
                  Booking ID: <span className="font-mono text-[#F1E7DE]">{bookingSuccess.id}</span>
                </div>
                <Link
                  href={`/bookings/${bookingSuccess.id}`}
                  className="block text-center bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-lg font-mono font-bold text-xs uppercase mt-2 transition-colors"
                >
                  View Booking Lifecycle →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourceDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-32 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">Loading Resource Passport & Availability...</div>}>
      <ResourceDetailContent />
    </Suspense>
  );
}
