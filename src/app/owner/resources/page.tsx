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
  Sparkles
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
  const [hourlyRate, setHourlyRate] = useState('300');
  const [deposit, setDeposit] = useState('1000');
  const [bufferMins, setBufferMins] = useState('30');
  const [building, setBuilding] = useState('Advanced FabLab Complex');
  const [room, setRoom] = useState('Bay 108');
  const [location, setLocation] = useState('Central Campus');

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
            operational_voltage: '415V 3-phase',
            preventative_service_cycle: 'Monthly',
            safety_clearance: 'Standard Lab Protocol'
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
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-white/8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <Layers className="w-4 h-4" />
            <span>Asset Governance Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Resource Inventory
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Maintain institutional laboratory instruments, configure turnaround buffers, monitor maintenance intervals, and issue Resource Passports.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#D4FF00] hover:bg-[#C2EA00] text-black px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#D4FF00]/15"
        >
          <Plus className="w-4 h-4" />
          List New Asset
        </button>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="py-24 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Loading Inventory Assets...
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-xl bg-[#0D0F14] border border-white/8 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={r.image_url}
                  alt={r.title}
                  className="w-20 h-20 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-tech bg-white/10 text-neutral-300">
                      {r.passport_id}
                    </span>
                    <span className={`badge-tech ${
                      r.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      r.status === 'in_use' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    <Link href={`/resources/${r.id}`} className="hover:text-[#D4FF00] transition-colors">
                      {r.title}
                    </Link>
                  </h3>

                  <div className="text-xs text-neutral-400">
                    {r.building}, {r.room} ({r.location}) • Rate: ₹{r.hourly_rate}/hr
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 pt-1 flex items-center gap-4">
                    <span>Turnaround Buffer: <strong className="text-white">+{r.turnaround_buffer_mins}m</strong></span>
                    <span>Condition: <strong className="text-[#D4FF00] uppercase">{r.condition_rating}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 self-end md:self-auto">
                <Link
                  href={`/resources/${r.id}`}
                  className="px-3.5 py-1.5 bg-[#151921] hover:bg-white/10 text-neutral-200 rounded text-xs font-mono uppercase border border-white/10"
                >
                  View Passport →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1217] border border-white/15 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4FF00]" />
                Register Institutional Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 uppercase text-[10px] mb-1">Asset Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Olympus LEXT OLS5000 3D Laser Microscope"
                  className="w-full bg-[#151921] text-white p-2.5 rounded border border-white/10 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#151921] text-white p-2.5 rounded border border-white/10 focus:outline-none focus:border-[#D4FF00]"
                  >
                    <option value="equipment">Physical Equipment</option>
                    <option value="space">Space / Facility</option>
                    <option value="digital">Digital / Compute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-[#151921] text-white p-2.5 rounded border border-white/10 focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase text-[10px] mb-1">Description & Capabilities</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications, laser wavelength, sample preparation rules..."
                  className="w-full bg-[#151921] text-white p-2.5 rounded border border-white/10 focus:outline-none focus:border-[#D4FF00] font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Hourly Fee (₹)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-[#151921] text-white p-2 rounded border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full bg-[#151921] text-white p-2 rounded border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Turnaround Buffer</label>
                  <select
                    value={bufferMins}
                    onChange={(e) => setBufferMins(e.target.value)}
                    className="w-full bg-[#151921] text-white p-2 rounded border border-white/10"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#151921] text-neutral-300 rounded font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#D4FF00] text-black font-bold rounded font-mono text-xs uppercase tracking-wider"
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
