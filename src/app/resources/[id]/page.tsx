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
        <div className="w-6 h-6 border-2 border-[#82996D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
          Loading Resource Details & Availability...
        </div>
      </div>
    );
  }

  if (!data?.resource) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4 space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#C79A49] mx-auto" />
        <h2 className="text-base font-semibold text-[#F1F0E5]">Resource Not Found</h2>
        <p className="text-xs text-[#B7C2B1]">The specified identifier does not match any registered asset.</p>
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-1.5 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] px-4 py-2 rounded-md text-xs font-medium border border-[#344438] transition-colors"
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
          purpose: purpose || 'Standard operational research session'
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to complete reservation');
      }

      setBookingSuccess(resData.booking);
      fetchDetail(); // Refresh live availability
    } catch (e: any) {
      setBookingError(e.message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setIsJoiningWaitlist(true);
    try {
      const preferred = new Date(Date.now() + parseFloat(startOffsetHours) * 3600000).toISOString();
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          preferredStartTime: preferred,
          durationHours: parseFloat(bookingHours),
          notes: purpose || 'FairShare priority queue placement'
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setWaitlistSuccess(`Enrolled in FairShare queue at Priority Score: ${resData.entry.priority_score.toFixed(1)}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const isAvailable = resource.status === 'available';
  const isInUse = resource.status === 'in_use';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#344438] text-xs">
        <div className="flex items-center gap-2 text-[#B7C2B1]">
          <Link href="/explore" className="hover:text-[#F1F0E5] transition-colors">Directory</Link>
          <span>/</span>
          <span className="capitalize">{resource.category}</span>
          <span>/</span>
          <span className="text-[#F1F0E5] font-mono">{resource.passport_id}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded bg-[#17251B] text-[#B7C2B1] border border-[#344438] font-mono text-[11px]">
            Turnaround Buffer: +{resource.turnaround_buffer_mins}m
          </span>
          <span className={`px-2.5 py-1 rounded font-medium text-[11px] border flex items-center gap-1.5 ${
            isAvailable
              ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40'
              : 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#4E7A5D]' : 'bg-[#C79A49]'}`} />
            {isAvailable ? 'Available Now' : 'In Session'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Image */}
          <div className="relative h-72 sm:h-84 w-full rounded-xl overflow-hidden border border-[#344438] bg-[#0D1812]">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17251B] via-transparent to-black/30" />
            
            <div className="absolute bottom-5 left-5 right-5">
              <span className="text-[11px] font-mono text-[#C7BC91] uppercase tracking-wider bg-[#0D1812]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#344438] inline-block mb-1.5">
                {resource.subcategory}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold text-[#F1F0E5] tracking-tight">
                {resource.title}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#344438] pb-2 text-xs">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                  : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
              }`}
            >
              Specifications & Access
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'passport'
                  ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                  : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#C7BC91]" />
              Digital Passport ({passport?.conditionReports?.length || 0} Reports)
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'maintenance'
                  ? 'bg-[#203025] text-[#F1F0E5] border border-[#344438]'
                  : 'text-[#B7C2B1] hover:text-[#F1F0E5] hover:bg-[#17251B]'
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
              <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#7E8D77]">Resource Description</h3>
                <p className="text-xs sm:text-sm text-[#F1F0E5] leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#7E8D77]">Verified Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {Object.entries(resource.specifications || {}).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-[#203025] border border-[#344438]/60 flex flex-col justify-between">
                      <span className="text-[#B7C2B1] capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-[#F1F0E5] font-medium mt-1">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custody & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#17251B] border border-[#344438]">
                  <div className="text-[10px] font-mono text-[#7E8D77] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C7BC91]" />
                    Custodial Provider
                  </div>
                  <div className="font-semibold text-[#F1F0E5] text-xs sm:text-sm">{resource.owner_name}</div>
                  <div className="text-xs text-[#B7C2B1] mt-0.5">{resource.building}</div>
                  <div className="text-[11px] text-[#7E8D77] mt-0.5">{resource.owner_institution || 'IdleX Verified Facility (Demo)'}</div>
                </div>

                <div className="p-5 rounded-xl bg-[#17251B] border border-[#344438]">
                  <div className="text-[10px] font-mono text-[#7E8D77] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#82996D]" />
                    Physical Location
                  </div>
                  <div className="font-semibold text-[#F1F0E5] text-xs sm:text-sm">{resource.room}</div>
                  <div className="text-xs text-[#B7C2B1] mt-0.5">{resource.building}</div>
                  <div className="text-[11px] text-[#7E8D77] mt-0.5">{resource.location}</div>
                </div>
              </div>

              {/* SkillGate Gatekeeper Status */}
              <div className={`p-4 sm:p-5 rounded-xl border flex items-start gap-3.5 ${
                userEligibility?.isEligible
                  ? 'bg-[#4E7A5D]/15 border-[#4E7A5D]/40'
                  : 'bg-[#B84A39]/15 border-[#B84A39]/40'
              }`}>
                {userEligibility?.isEligible ? (
                  <ShieldCheck className="w-5 h-5 text-[#A9BE89] shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#B84A39] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold text-[#F1F0E5]">
                    {userEligibility?.isEligible ? 'SkillGate Verification: Cleared' : 'SkillGate Verification: Restricted'}
                  </div>
                  <p className="text-xs text-[#B7C2B1] mt-1 leading-relaxed">
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
              <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-lg shrink-0">
                  <img
                    src={passport?.qrCodeDataUrl}
                    alt={`QR Code for ${resource.passport_id}`}
                    className="w-32 h-32"
                  />
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] text-[#7E8D77] uppercase tracking-wider">
                    Digital Passport ID
                  </div>
                  <div className="text-base font-bold text-[#F1F0E5]">{passport?.passportId}</div>
                  <div className="text-[#B7C2B1]">Serial Number: {passport?.serialNumber}</div>
                  <div className="text-[#B7C2B1]">
                    Condition Rating: <span className="text-[#A9BE89] uppercase font-bold">{passport?.conditionRating}</span>
                  </div>
                  <div className="text-[11px] text-[#7E8D77] leading-relaxed font-sans pt-1">
                    Scannable physical QR code affixed to equipment enclosure. Used for automated condition checkout and checkin handovers.
                  </div>
                </div>
              </div>

              {/* Handover Log History */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#7E8D77]">
                  Handover Condition History
                </h3>

                {passport?.conditionReports?.length === 0 ? (
                  <p className="text-xs text-[#7E8D77]">No condition reports logged yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {passport?.conditionReports?.map((report: any) => (
                      <div key={report.id} className="p-3.5 rounded-lg bg-[#203025] border border-[#344438]/60 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#C7BC91] font-medium text-[11px] uppercase">
                            {report.report_type} Report
                          </span>
                          <span className="text-[#7E8D77] text-[10px]">
                            {new Date(report.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="text-[#B7C2B1]">
                          Inspected by: <span className="text-[#F1F0E5] font-medium">{report.reporter_name}</span> • Rating: <span className="text-[#A9BE89] font-medium uppercase">{report.condition_rating}</span>
                        </div>
                        {report.discrepancies && (
                          <div className="p-2 rounded bg-[#0D1812] text-[#B7C2B1] text-[11px] border border-[#344438]/40">
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
              <div className="p-5 sm:p-6 rounded-xl bg-[#17251B] border border-[#344438] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#7E8D77]">
                  Maintenance & Inspection History
                </h3>

                {passport?.maintenanceRecords?.length === 0 ? (
                  <p className="text-xs text-[#7E8D77]">No maintenance records logged.</p>
                ) : (
                  <div className="space-y-2.5">
                    {passport?.maintenanceRecords?.map((m: any) => (
                      <div key={m.id} className="p-3.5 rounded-lg bg-[#203025] border border-[#344438]/60 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#F1F0E5] font-medium text-[11px] uppercase">
                            {m.maintenance_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[#7E8D77] text-[10px]">
                            {new Date(m.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#B7C2B1] leading-relaxed text-xs">{m.description}</p>
                        {m.parts_replaced && (
                          <div className="text-[11px] font-mono text-[#7E8D77] pt-1">
                            Parts Replaced: <span className="text-[#F1F0E5]">{m.parts_replaced}</span>
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
            <div className="pt-4 border-t border-[#344438] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#82996D]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compatible Alternative Resources</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternatives.map((alt: any) => (
                  <Link
                    key={alt.id}
                    href={`/resources/${alt.slug || alt.id}`}
                    className="p-3.5 rounded-lg bg-[#17251B] border border-[#344438] hover:border-[#82996D] transition-colors block text-xs"
                  >
                    <div className="font-semibold text-[#F1F0E5] truncate">{alt.title}</div>
                    <div className="text-[11px] text-[#B7C2B1] mt-1 font-mono">${alt.hourly_rate}/hr • {alt.location}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Console (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-[#17251B] border border-[#344438] rounded-xl p-5 sm:p-6 space-y-5">
            
            {/* Pricing Summary */}
            <div className="flex items-baseline justify-between pb-4 border-b border-[#344438]">
              <div>
                <span className="text-2xl font-bold text-[#C7BC91] font-mono">
                  ${resource.hourly_rate}
                </span>
                <span className="text-xs text-[#7E8D77] ml-1">/ hour</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#7E8D77] uppercase">Deposit</span>
                <div className="text-xs font-mono text-[#F1F0E5]">${resource.deposit || 0}</div>
              </div>
            </div>

            {/* In-Use Notice */}
            {resource.status === 'in_use' && (
              <div className="p-3 rounded-lg bg-[#203025] border border-[#C79A49]/40 text-xs text-[#E0A85C] font-mono space-y-0.5">
                <div className="font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Currently in Session
                </div>
                <div className="text-[11px] text-[#B7C2B1]">
                  Reservations can be scheduled after active slot + {resource.turnaround_buffer_mins}m buffer.
                </div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#7E8D77] mb-1">
                  Start Window
                </label>
                <select
                  value={startOffsetHours}
                  onChange={(e) => setStartOffsetHours(e.target.value)}
                  className="w-full bg-[#0D1812] text-[#F1F0E5] px-3 py-2 rounded-md border border-[#344438] text-xs font-mono focus:outline-none focus:border-[#82996D]"
                >
                  <option value="1">Starts in 1 Hour</option>
                  <option value="2">Starts in 2 Hours</option>
                  <option value="4">Starts in 4 Hours</option>
                  <option value="24">Tomorrow Morning (24h)</option>
                  <option value="48">In 2 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#7E8D77] mb-1">
                  Duration
                </label>
                <select
                  value={bookingHours}
                  onChange={(e) => setBookingHours(e.target.value)}
                  className="w-full bg-[#0D1812] text-[#F1F0E5] px-3 py-2 rounded-md border border-[#344438] text-xs font-mono focus:outline-none focus:border-[#82996D]"
                >
                  <option value="1">1 Hour Session</option>
                  <option value="2">2 Hours Session</option>
                  <option value="3">3 Hours Session</option>
                  <option value="4">4 Hours Session</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#7E8D77] mb-1">
                  Research Purpose / Use Case
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Master thesis prototype run"
                  className="w-full bg-[#0D1812] text-[#F1F0E5] px-3 py-2 rounded-md border border-[#344438] text-xs focus:outline-none focus:border-[#82996D] placeholder:text-[#7E8D77]"
                />
              </div>

              {/* Cost Calculation */}
              <div className="p-3.5 rounded-lg bg-[#203025] border border-[#344438]/60 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-[#B7C2B1]">
                  <span>Rate x {bookingHours} hrs:</span>
                  <span>${parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
                <div className="flex justify-between text-[#B7C2B1]">
                  <span>Turnaround Buffer (+{resource.turnaround_buffer_mins}m):</span>
                  <span className="text-[#A9BE89]">Included</span>
                </div>
                <div className="flex justify-between text-[#F1F0E5] font-bold pt-1.5 border-t border-[#344438]">
                  <span>Total Cost:</span>
                  <span className="text-[#C7BC91]">${parseFloat(bookingHours) * resource.hourly_rate}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isBooking || resource.status === 'maintenance'}
                className="w-full flex items-center justify-center gap-2 bg-[#82996D] hover:bg-[#A9BE89] text-[#0B1510] py-2.5 rounded-md font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
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
              <div className="p-3.5 rounded-lg bg-[#B84A39]/15 border border-[#B84A39]/40 text-xs text-[#F1F0E5] space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B84A39] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{bookingError}</div>
                </div>

                {bookingError.includes('Booking Conflict') && !waitlistSuccess && (
                  <button
                    onClick={handleJoinWaitlist}
                    disabled={isJoiningWaitlist}
                    className="w-full py-2 bg-[#203025] hover:bg-[#293B2F] text-[#F1F0E5] rounded-md font-mono text-xs transition-colors cursor-pointer border border-[#344438]"
                  >
                    {isJoiningWaitlist ? 'Enrolling...' : 'Join FairShare Waitlist'}
                  </button>
                )}
              </div>
            )}

            {/* Waitlist Success Message */}
            {waitlistSuccess && (
              <div className="p-3 rounded-lg bg-[#4E7A5D]/20 border border-[#4E7A5D]/40 text-xs text-[#A9BE89] font-mono">
                <CheckCircle2 className="w-4 h-4 mb-0.5 inline mr-1.5" />
                {waitlistSuccess}
              </div>
            )}

            {/* Booking Success Confirmation */}
            {bookingSuccess && (
              <div className="p-3.5 rounded-lg bg-[#4E7A5D]/20 border border-[#4E7A5D]/40 text-xs text-[#F1F0E5] space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-[#A9BE89]">
                  <CheckCircle2 className="w-4 h-4" />
                  Reservation Confirmed!
                </div>
                <div className="text-[11px] text-[#B7C2B1]">
                  Booking ID: <span className="font-mono text-[#F1F0E5]">{bookingSuccess.id}</span>
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
      <div className="min-h-screen py-32 text-center text-xs font-mono text-[#7E8D77]">
        Loading Resource Passport & Availability...
      </div>
    }>
      <ResourceDetailContent />
    </Suspense>
  );
}
