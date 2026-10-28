'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Terminal,
  Zap
} from 'lucide-react';
import { OwnerAnalyticsSummary } from '@/lib/insights';

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<OwnerAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/owner/analytics');
      const json = await res.json();
      setData(json.insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
        Aggregating Idle Insights Telemetry...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-white/8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
            <BarChart3 className="w-4 h-4" />
            <span>Idle Insights™ Utilization Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Asset Utilization Telemetry
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Live telemetry calculated from real application bookings, turnaround buffer efficiency, and idle capacity monetization across research bays.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12151B] hover:bg-white/10 text-neutral-300 rounded font-mono text-xs uppercase border border-white/10 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="text-[11px] font-mono text-neutral-400 uppercase mb-2">Overall Utilization</div>
          <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-1">
            <span className="text-[#D4FF00]">{data.overallUtilizationRate}%</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-1">Target operational band</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="text-[11px] font-mono text-neutral-400 uppercase mb-2">Revenue / Cost Recovery</div>
          <div className="text-3xl font-extrabold font-mono text-white">
            ₹{data.totalRevenueRecovered.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-1">Reinvested in maintenance</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="text-[11px] font-mono text-neutral-400 uppercase mb-2">Idle Hours Captured</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {data.idleCapacityCapturedHours} hrs
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-1">Mobilized research time</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F1217] border border-white/8">
          <div className="text-[11px] font-mono text-neutral-400 uppercase mb-2">Waitlist Demand Volume</div>
          <div className="text-3xl font-extrabold font-mono text-purple-400">
            {data.waitlistVolume} requests
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-1">FairShare queued</div>
        </div>
      </div>

      {/* Demand Over Time Visualization */}
      <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
              7-Day Utilization & Hourly Booking Demand
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Calculated utilization load across all campus bays</p>
          </div>
          <span className="badge-tech bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Peak: Friday (31.5h)
          </span>
        </div>

        {/* Clean, robust SVG Bar Chart */}
        <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 pb-2">
          {data.demandTimeline.map((item, idx) => {
            const heightPercent = Math.round((item.hoursBooked / 35) * 100);
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-neutral-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hoursBooked}h
                </div>
                <div className="w-full bg-[#151921] rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5 h-36">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-cyan-600 to-[#D4FF00] rounded-t transition-all duration-500 group-hover:brightness-110"
                  ></div>
                </div>
                <div className="text-xs font-mono text-neutral-300 mt-2 font-bold">{item.day}</div>
                <div className="text-[10px] font-mono text-neutral-500">₹{item.revenue}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset-by-Asset Utilization Table */}
      <div className="p-6 rounded-xl bg-[#0D0F14] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
            Granular Asset Performance & Turnaround Metrics
          </h3>
          <span className="text-[10px] font-mono text-neutral-400">
            {data.resourceBreakdown.length} ASSETS REGISTERED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px]">
                <th className="pb-3 font-medium">Asset Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Turnaround Buffer</th>
                <th className="pb-3 font-medium">Hours Utilized</th>
                <th className="pb-3 font-medium">Utilization</th>
                <th className="pb-3 font-medium">Revenue (₹)</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.resourceBreakdown.map((res) => (
                <tr key={res.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 pr-4 text-white font-medium font-sans truncate max-w-[200px]">
                    <Link href={`/resources/${res.id}`} className="hover:text-[#D4FF00] transition-colors">
                      {res.title}
                    </Link>
                  </td>
                  <td className="py-3.5 text-neutral-400 capitalize">{res.category}</td>
                  <td className="py-3.5 text-neutral-300">+{res.turnaroundBufferMins}m</td>
                  <td className="py-3.5 text-white">{res.hoursUtilized} hrs</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${res.utilizationRate}%` }}
                          className="h-full bg-[#D4FF00] rounded-full"
                        ></div>
                      </div>
                      <span className="text-neutral-300">{res.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[#D4FF00] font-bold">₹{res.revenueGenerated}</td>
                  <td className="py-3.5 text-right">
                    <span className={`badge-tech ${
                      res.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                      res.status === 'in_use' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
