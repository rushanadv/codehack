'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  User,
  Wrench,
  Sparkles
} from 'lucide-react';

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
        <div className="w-6 h-6 border-2 border-[#B65E42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs font-mono text-[#B8ADA0] uppercase tracking-wider">
          Loading Resource Details & Availability...
        </div>
      </div>
    );
  }

  if (!data?.resource) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4 space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#C68A3C] mx-auto" />
        <h2 className="text-base font-semibold text-[#F3EADF]">Resource Not Found</h2>
        <p className="text-xs text-[#B8ADA0]">The specified identifier does not match any registered asset.</p>
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-1.5 bg-[#211E1B] hover:bg-[#B65E42] text-[#F3EADF] px-4 py-2 rounded-md text-xs font-medium border border-[#38312C] transition-colors"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const { resource, userEligibility, passport, alternatives } = data;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

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
          purpose: purpose || 'Standard research and prototyping reservation'
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setBookingError(result.error || 'Failed to complete reservation');
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
        setWaitlistSuccess(`Enrolled in queue. Position: ${result.entry.queue_position} (Priority Score: ${result.entry.priority_score})`);
      } else {
        setBookingError(result.error || 'Failed to join waitlist');
      }
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const isAvailable = resource.status === 'available';
  const isInUse = resource.status === 'in_use';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#38312C] text-xs">
        <div className="flex items-center gap-2 text-[#B8ADA0]">
          <Link href="/explore" className="hover:text-[#F3EADF] transition-colors">Directory</Link>
          <span>/</span>
          <span className="capitalize">{resource.category}</span>
          <span>/</span>
          <span className="text-[#F3EADF] font-mono">{resource.passport_id}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded bg-[#191715] text-[#B8ADA0] border border-[#38312C] font-mono text-[11px]">
            Turnaround Buffer: +{resource.turnaround_buffer_mins}m
          </span>
          <span className={`px-2.5 py-1 rounded font-medium text-[11px] border flex items-center gap-1.5 ${
            isAvailable
              ? 'bg-[#4E7A5D]/15 text-[#6BA87E] border-[#4E7A5D]/30'
              : 'bg-[#C68A3C]/15 text-[#E0A85C] border-[#C68A3C]/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#6BA87E]' : 'bg-[#E0A85C]'}`} />
            {isAvailable ? 'Available Now' : 'In Session'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Image */}
          <div className="relative h-72 sm:h-84 w-full rounded-xl overflow-hidden border border-[#38312C] bg-[#11100F]">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191715] via-transparent to-black/30" />
            
            <div className="absolute bottom-5 left-5 right-5">
              <span className="text-[11px] font-mono text-[#D69A49] uppercase tracking-wider bg-[#11100F]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#38312C] inline-block mb-1.5">
                {resource.subcategory}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold text-[#F3EADF] tracking-tight">
                {resource.title}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#38312C] pb-2 text-xs">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                  : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
              }`}
            >
              Specifications & Access
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'passport'
                  ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                  : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#D69A49]" />
              Digital Passport ({passport?.conditionReports?.length || 0} Reports)
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'maintenance'
                  ? 'bg-[#211E1B] text-[#F3EADF] border border-[#38312C]'
                  : 'text-[#B8ADA0] hover:text-[#F3EADF] hover:bg-[#191715]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Maintenance ({passport?.maintenanceRecords?.length || 0})
            </button>
          </div>

          {/* TAB 1: SPECIFICATIONS & ACCESS */}
          {activeTab === 'booking' && (
            <div className="space-y-5">
              {/* Description */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8ADA0]">Resource Description</h3>
                <p className="text-xs sm:text-sm text-[#F3EADF] leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8ADA0]">Verified Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {Object.entries(resource.specifications || {}).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-[#211E1B] border border-[#38312C]/60 flex flex-col justify-between">
                      <span className="text-[#B8ADA0] capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-[#F3EADF] font-medium mt-1">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custody & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#191715] border border-[#38312C]">
                  <div className="text-[10px] font-mono text-[#B8ADA0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D69A49]" />
                    Custodial Provider
                  </div>
                  <div className="font-semibold text-[#F3EADF] text-xs sm:text-sm">{resource.owner_name}</div>
                  <div className="text-xs text-[#B8ADA0] mt-0.5">{resource.building}</div>
                  <div className="text-[11px] text-[#B8ADA0]/80 mt-0.5">{resource.owner_institution || 'IdleX Verified Facility (Fictional)'}</div>
                </div>

                <div className="p-5 rounded-xl bg-[#191715] border border-[#38312C]">
                  <div className="text-[10px] font-mono text-[#B8ADA0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B65E42]" />
                    Physical Location
                  </div>
                  <div className="font-semibold text-[#F3EADF] text-xs sm:text-sm">{resource.room}</div>
                  <div className="text-xs text-[#B8ADA0] mt-0.5">{resource.building}</div>
                  <div className="text-[11px] text-[#B8ADA0]/80 mt-0.5">{resource.location}</div>
                </div>
              </div>

              {/* SkillGate Gatekeeper Status */}
              <div className={`p-4 sm:p-5 rounded-xl border flex items-start gap-3.5 ${
                userEligibility?.isEligible
                  ? 'bg-[#4E7A5D]/10 border-[#4E7A5D]/30'
                  : 'bg-[#B84A39]/10 border-[#B84A39]/30'
              }`}>
                {userEligibility?.isEligible ? (
                  <ShieldCheck className="w-5 h-5 text-[#6BA87E] shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#B84A39] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold text-[#F3EADF]">
                    {userEligibility?.isEligible ? 'SkillGate Verification: Cleared' : 'SkillGate Verification: Restricted'}
                  </div>
                  <p className="text-xs text-[#B8ADA0] mt-1 leading-relaxed">
                    {userEligibility?.isEligible
                      ? 'Your profile holds verified credential authorization meeting all required operating protocols.'
                      : `You have not verified the prerequisite credential: "${userEligibility?.missingSkills?.join(', ')}". Reservation will require administrator sign-off.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCE PASSPORT */}
          {activeTab === 'passport' && (
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-lg shrink-0">
                  <img
                    src={passport?.qrCodeDataUrl}
                    alt={`QR Code for ${resource.passport_id}`}
                    className="w-32 h-32"
                  />
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] text-[#B8ADA0] uppercase tracking-wider">
                    Digital Passport ID
                  </div>
                  <div className="text-base font-bold text-[#F3EADF]">{passport?.passportId}</div>
                  <div className="text-[#B8ADA0]">Serial Number: {passport?.serialNumber}</div>
                  <div className="text-[#B8ADA0]">
                    Condition Rating: <span className="text-[#6BA87E] uppercase font-bold">{passport?.conditionRating}</span>
                  </div>
                  <div className="text-[11px] text-[#B8ADA0] leading-relaxed font-sans pt-1">
                    Scannable physical QR code affixed to equipment enclosure. Used for automated condition checkout and checkin handovers.
                  </div>
                </div>
              </div>

              {/* Handover Log History */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8ADA0]">
                  Handover Condition History
                </h3>

                {passport?.conditionReports?.length === 0 ? (
                  <p className="text-xs text-[#B8ADA0]">No condition reports logged yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {passport?.conditionReports?.map((report: any) => (
                      <div key={report.id} className="p-3.5 rounded-lg bg-[#211E1B] border border-[#38312C]/60 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#D69A49] font-medium text-[11px] uppercase">
                            {report.report_type} Report
                          </span>
                          <span className="text-[#B8ADA0] text-[10px]">
                            {new Date(report.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="text-[#B8ADA0]">
                          Inspected by: <span className="text-[#F3EADF] font-medium">{report.reporter_name}</span> • Rating: <span className="text-[#6BA87E] font-medium uppercase">{report.condition_rating}</span>
                        </div>
                        {report.discrepancies && (
                          <div className="p-2 rounded bg-[#191715] text-[#B8ADA0] text-[11px] border border-[#38312C]/40">
                            Notes: {report.discrepancies}
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
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-xl bg-[#191715] border border-[#38312C] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8ADA0]">
                  Maintenance & Inspection History
                </h3>

                {passport?.maintenanceRecords?.length === 0 ? (
                  <p className="text-xs text-[#B8ADA0]">No maintenance records logged.</p>
                ) : (
                  <div className="space-y-2.5">
                    {passport?.maintenanceRecords?.map((m: any) => (
                      <div key={m.id} className="p-3.5 rounded-lg bg-[#211E1B] border border-[#38312C]/60 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#F3EADF] font-medium text-[11px] uppercase">
                            {m.maintenance_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[#B8ADA0] text-[10px]">
                            {new Date(m.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#B8ADA0] leading-relaxed text-xs">{m.description}</p>
                        {m.parts_replaced && (
                          <div className="text-[11px] font-mono text-[#B8ADA0] pt-1">
                            Parts Replaced: <span className="text-[#F3EADF]">{m.parts_replaced}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {alternatives && alternatives.length > 0 && (
            <div className="pt-4 border-t border-[#38312C] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D69A49]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compatible Alternative Resources</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternatives.map((alt: any) => (
                  <Link
                    key={alt.id}
                    href={`/resources/${alt.slug || alt.id}`}
                    className="p-3.5 rounded-lg bg-[#191715] border border-[#38312C] hover:border-[#B65E42] transition-colors block text-xs"
                  >
                    <div className="font-semibold text-[#F3EADF] truncate">{alt.title}</div>
                    <div className="text-[11px] text-[#B8ADA0] mt-1 font-mono">${alt.hourly_rate}/hr • {alt.location}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Console (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-[#191715] border border-[#38312C] rounded-xl p-5 sm:p-6 space-y-5">
            
            {/* Pricing Summary */}
            <div className="flex items-baseline justify-between pb-4 border-b border-[#38312C]">
              <div>
                <span className="text-2xl font-bold text-[#F3EADF] font-mono">
                  ${resource.hourly_rate}
                </span>
                <span className="text-xs text-[#B8ADA0] ml-1">/ hour</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#B8ADA0] uppercase">Deposit</span>
                <div className="text-xs font-mono text-[#F3EADF]">${resource.deposit || 0}</div>
              </div>
            </div>

            {/* In-Use Notice */}
            {resource.status === 'in_use' && (
              <div className="p-3 rounded-lg bg-[#211E1B] border border-[#C68A3C]/40 text-xs text-[#E0A85C] font-mono space-y-0.5">
                <div className="font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Currently in Session
                </div>
                <div className="text-[11px] text-[#B8ADA0]">
                  Reservations can be scheduled after active slot + {resource.turnaround_buffer_mins}m buffer.
                </div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#B8ADA0] mb-1">
                  Start Window
                </label>
                <select
                  value={startOffsetHours}
                  onChange={(e) => setStartOffsetHours(e.target.value)}
                  className="w-full bg-[#11100F] text-[#F3EADF] px-3 py-2 rounded-md border border-[#38312C] text-xs font-mono focus:outline-none focus:border-[#B65E42]"
                >
                  <option value="1">Starts in 1 Hour</option>
                  <option value="2">Starts in 2 Hours</option>
                  <option value="4">Starts in 4 Hours</option>
                  <option value="24">Tomorrow Morning (24h)</option>
                  <option value="48">In 2 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#B8ADA0] mb-1">
                  Duration
                </label>
                <select
                  value={bookingHours}
                  onChange={(e) => setBookingHours(e.target.value)}
                  className="w-full bg-[#11100F] text-[#F3EADF] px-3 py-2 rounded-md border border-[#38312C] text-xs font-mono focus:outline-none focus:border-[#B65E42]"
                >
                  <option value="1">1 Hour Session</option>
                  <option value="2">2 Hours Session</option>
                  <option value="3">3 Hours Session</option>
                  <option value="4">4 Hours Session</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#B8ADA0] mb-1">
                  Research Purpose / Use Case
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Master thesis prototype run"
                  className="w-full bg-[#11100F] text-[#F3EADF] px-3 py-2 rounded-md border border-[#38312C] text-xs focus:outline-none focus:border-[#B65E42] placeholder:text-[#B8ADA0]/60"
                />
              </div>

              {/* Cost Calculation */}
              <div className="p-3.5 rounded-lg bg-[#211E1B] border border-[#38312C]/60 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-[#B8ADA0]">
                  <span>Rate x {bookingHours} hrs:</span>
                  <span>${parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
                <div className="flex justify-between text-[#B8ADA0]">
                  <span>Turnaround Buffer (+{resource.turnaround_buffer_mins}m):</span>
                  <span className="text-[#6BA87E]">Included</span>
                </div>
                <div className="flex justify-between text-[#F3EADF] font-bold pt-1.5 border-t border-[#38312C]">
                  <span>Total Cost:</span>
                  <span>${parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isBooking || resource.status === 'maintenance'}
                className="w-full flex items-center justify-center gap-2 bg-[#B65E42] hover:bg-[#C86C4E] text-white py-2.5 rounded-md font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validating ACID Lock...
                  </>
                ) : (
                  <>
                    Confirm Reservation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Error / Conflict Alert */}
            {bookingError && (
              <div className="p-3.5 rounded-lg bg-[#B84A39]/15 border border-[#B84A39]/40 text-xs text-[#F3EADF] space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B84A39] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{bookingError}</div>
                </div>

                {bookingError.includes('Booking Conflict') && !waitlistSuccess && (
                  <button
                    onClick={handleJoinWaitlist}
                    disabled={isJoiningWaitlist}
                    className="w-full py-2 bg-[#211E1B] hover:bg-[#292420] text-[#F3EADF] rounded-md font-mono text-xs transition-colors cursor-pointer border border-[#38312C]"
                  >
                    {isJoiningWaitlist ? 'Enrolling...' : 'Join FairShare Waitlist'}
                  </button>
                )}
              </div>
            )}

            {/* Waitlist Success Message */}
            {waitlistSuccess && (
              <div className="p-3 rounded-lg bg-[#4E7A5D]/15 border border-[#4E7A5D]/30 text-xs text-[#6BA87E] font-mono">
                <CheckCircle2 className="w-4 h-4 mb-0.5 inline mr-1.5" />
                {waitlistSuccess}
              </div>
            )}

            {/* Booking Success Confirmation */}
            {bookingSuccess && (
              <div className="p-3.5 rounded-lg bg-[#4E7A5D]/15 border border-[#4E7A5D]/40 text-xs text-[#F3EADF] space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-[#6BA87E]">
                  <CheckCircle2 className="w-4 h-4" />
                  Reservation Confirmed!
                </div>
                <div className="text-[11px] text-[#B8ADA0]">
                  Booking ID: <span className="font-mono text-[#F3EADF]">{bookingSuccess.id}</span>
                </div>
                <Link
                  href={`/bookings/${bookingSuccess.id}`}
                  className="block text-center bg-[#4E7A5D] hover:bg-[#5E9470] text-white py-1.5 rounded-md font-medium text-xs transition-colors"
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
    <Suspense fallback={
      <div className="min-h-screen py-32 text-center text-xs font-mono text-[#B8ADA0]">
        Loading Resource Passport & Availability...
      </div>
    }>
      <ResourceDetailContent />
    </Suspense>
  );
}
