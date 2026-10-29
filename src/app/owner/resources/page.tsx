'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  X,
  ChevronRight
} from 'lucide-react';
import { Resource } from '@/lib/types';

export default function OwnerResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New resource form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'equipment' | 'space' | 'digital'>('equipment');
  const [subcategory, setSubcategory] = useState('Additive Manufacturing');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('85');
  const [deposit, setDeposit] = useState('250');
  const [bufferMins, setBufferMins] = useState('30');
  const [building, setBuilding] = useState('Precision Prototyping Bay');
  const [room, setRoom] = useState('Bay 108');
  const [location, setLocation] = useState('North Facility');

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          subcategory,
          description,
          hourly_rate: parseFloat(hourlyRate),
          deposit: parseFloat(deposit),
          turnaround_buffer_mins: parseInt(bufferMins, 10),
          building,
          room,
          location,
          specifications: {
            power_rating: '208V 3-phase',
            calibration_cycle: 'Bi-weekly',
            safety_rating: 'Standard Cleanroom'
          }
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchResources();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to register resource');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1510] text-[#F1F0E5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#344438] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#C7BC91]">
            <Layers className="w-3.5 h-3.5" />
            <span>Asset Governance Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F1F0E5] tracking-tight">
            Managed Resources
          </h1>
          <p className="text-xs text-[#B7C2B1] mt-1.5 max-w-xl">
            Maintain laboratory instruments, configure turnaround buffers, monitor maintenance intervals, and issue Resource Passports.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#82996D] hover:bg-[#94AC7E] text-[#0B1510] px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="py-24 text-center text-xs font-mono text-[#7E8D77] uppercase tracking-wider">
          Loading Inventory Assets...
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-xl bg-[#17251B] border border-[#344438] hover:border-[#4A5F4F] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={r.image_url}
                  alt={r.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[#344438] shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#203025] text-[#C7BC91] border border-[#344438]">
                      {r.passport_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                      r.status === 'available' ? 'bg-[#4E7A5D]/15 text-[#4E7A5D] border-[#4E7A5D]/30' :
                      r.status === 'in_use' ? 'bg-[#C79A49]/15 text-[#C79A49] border-[#C79A49]/30' :
                      'bg-[#B84A39]/15 text-[#B84A39] border-[#B84A39]/30'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F1F0E5]">
                    <Link href={`/resources/${r.id}`} className="hover:text-[#A9BE89] transition-colors">
                      {r.title}
                    </Link>
                  </h3>

                  <div className="text-xs text-[#B7C2B1]">
                    {r.building}, {r.room} ({r.location}) • Rate: <strong className="text-[#F1F0E5] font-mono">${r.hourly_rate}/hr</strong>
                  </div>

                  <div className="text-[11px] font-mono text-[#7E8D77] pt-1 flex items-center gap-4">
                    <span>Turnaround Buffer: <strong className="text-[#B7C2B1]">+{r.turnaround_buffer_mins}m</strong></span>
                    <span>Condition: <strong className="text-[#4E7A5D] uppercase">{r.condition_rating}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 self-end md:self-auto">
                <Link
                  href={`/resources/${r.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#203025] hover:bg-[#283C2F] text-[#F1F0E5] border border-[#344438] rounded-lg text-xs font-mono transition-colors"
                >
                  <span>Resource Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7E8D77]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#17251B] border border-[#344438] rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#344438]">
              <h3 className="text-sm font-semibold font-mono uppercase text-[#F1F0E5] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#82996D]" />
                Register Institutional Resource
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#7E8D77] hover:text-[#F1F0E5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Olympus LEXT OLS5000 3D Laser Microscope"
                  className="w-full bg-[#203025] text-[#F1F0E5] p-2.5 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Domain</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#203025] text-[#F1F0E5] p-2.5 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D]"
                  >
                    <option value="equipment">Physical Asset</option>
                    <option value="space">Property & Space</option>
                    <option value="digital">Digital & Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-[#203025] text-[#F1F0E5] p-2.5 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Description & Operational Specifications</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational parameters, sample preparation guidelines, safety protocols..."
                  className="w-full bg-[#203025] text-[#F1F0E5] p-2.5 rounded-lg border border-[#344438] focus:outline-none focus:border-[#82996D] font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Hourly Fee ($)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-[#203025] text-[#F1F0E5] p-2 rounded-lg border border-[#344438]"
                  />
                </div>

                <div>
                  <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Escrow Deposit ($)</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full bg-[#203025] text-[#F1F0E5] p-2 rounded-lg border border-[#344438]"
                  />
                </div>

                <div>
                  <label className="block text-[#B7C2B1] uppercase text-[10px] mb-1">Turnaround Buffer</label>
                  <select
                    value={bufferMins}
                    onChange={(e) => setBufferMins(e.target.value)}
                    className="w-full bg-[#203025] text-[#F1F0E5] p-2 rounded-lg border border-[#344438]"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#203025] hover:bg-[#283C2F] text-[#7E8D77] hover:text-[#F1F0E5] rounded-lg font-mono text-xs border border-[#344438] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#82996D] hover:bg-[#94AC7E] text-[#0B1510] font-semibold rounded-lg font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
