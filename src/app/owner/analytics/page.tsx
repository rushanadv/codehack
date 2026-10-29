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
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#AD7257]/20 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#D4FF00]">
            <BarChart3 className="w-4 h-4 text-[#D4FF00]" />
            <span>Idle Insights™ Utilization Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F1E7DE] tracking-tight">
            Asset Utilization Telemetry
          </h1>
          <p className="text-sm text-[#D9C5B4] mt-1 max-w-xl">
            Live telemetry calculated from real application bookings, turnaround buffer efficiency, and idle capacity monetization across research bays.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#24110C] hover:bg-[#2F1711] text-[#F1E7DE] rounded-xl font-mono text-xs uppercase border border-[#AD7257]/30 cursor-pointer transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-lg">
          <div className="text-[11px] font-mono text-[#A99A90] uppercase mb-2">Overall Utilization</div>
          <div className="text-3xl font-extrabold font-mono text-[#F1E7DE] flex items-baseline gap-1">
            <span className="text-[#D4FF00]">{data.overallUtilizationRate}%</span>
          </div>
          <div className="text-[10px] text-[#A99A90] font-mono mt-1">Target operational band</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-lg">
          <div className="text-[11px] font-mono text-[#A99A90] uppercase mb-2">Revenue / Cost Recovery</div>
          <div className="text-3xl font-extrabold font-mono text-[#F1E7DE]">
            ₹{data.totalRevenueRecovered.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#A99A90] font-mono mt-1">Reinvested in maintenance</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-lg">
          <div className="text-[11px] font-mono text-[#A99A90] uppercase mb-2">Idle Hours Captured</div>
          <div className="text-3xl font-extrabold font-mono text-[#D96335]">
            {data.idleCapacityCapturedHours} hrs
          </div>
          <div className="text-[10px] text-[#A99A90] font-mono mt-1">Mobilized research time</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 shadow-lg">
          <div className="text-[11px] font-mono text-[#A99A90] uppercase mb-2">Waitlist Demand Volume</div>
          <div className="text-3xl font-extrabold font-mono text-[#AD7257]">
            {data.waitlistVolume} requests
          </div>
          <div className="text-[10px] text-[#A99A90] font-mono mt-1">FairShare queued</div>
        </div>
      </div>

      {/* Demand Over Time Visualization */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/30 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#AD7257]/20">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">
              7-Day Utilization & Hourly Booking Demand
            </h3>
            <p className="text-xs text-[#D9C5B4] mt-0.5">Calculated utilization load across all campus bays</p>
          </div>
          <span className="badge-tech bg-[#D96335]/20 text-[#D96335] border border-[#D96335]/40 font-mono">
            Peak: Friday (31.5h)
          </span>
        </div>

        {/* Clean, robust SVG Bar Chart */}
        <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 pb-2">
          {data.demandTimeline.map((item, idx) => {
            const heightPercent = Math.round((item.hoursBooked / 35) * 100);
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-[#A99A90] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hoursBooked}h
                </div>
                <div className="w-full bg-[#24110C] rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5 h-36">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-[#A94427] to-[#D4FF00] rounded-t transition-all duration-500 group-hover:brightness-110"
                  ></div>
                </div>
                <div className="text-xs font-mono text-[#F1E7DE] mt-2 font-bold">{item.day}</div>
                <div className="text-[10px] font-mono text-[#A99A90]">₹{item.revenue}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset-by-Asset Utilization Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#170D0A] border border-[#AD7257]/25 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#AD7257]/20">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F1E7DE]">
            Granular Asset Performance & Turnaround Metrics
          </h3>
          <span className="text-[10px] font-mono text-[#A99A90]">
            {data.resourceBreakdown.length} ASSETS REGISTERED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#AD7257]/20 text-[#A99A90] uppercase text-[10px]">
                <th className="pb-3 font-medium">Asset Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Turnaround Buffer</th>
                <th className="pb-3 font-medium">Hours Utilized</th>
                <th className="pb-3 font-medium">Utilization</th>
                <th className="pb-3 font-medium">Revenue (₹)</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AD7257]/15">
              {data.resourceBreakdown.map((res) => (
                <tr key={res.id} className="hover:bg-[#24110C]/60 transition-colors">
                  <td className="py-3.5 pr-4 text-[#F1E7DE] font-medium font-sans truncate max-w-[200px]">
                    <Link href={`/resources/${res.id}`} className="hover:text-[#D4FF00] transition-colors">
                      {res.title}
                    </Link>
                  </td>
                  <td className="py-3.5 text-[#D9C5B4] capitalize">{res.category}</td>
                  <td className="py-3.5 text-[#D9C5B4]">+{res.turnaroundBufferMins}m</td>
                  <td className="py-3.5 text-[#F1E7DE]">{res.hoursUtilized} hrs</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#24110C] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${res.utilizationRate}%` }}
                          className="h-full bg-[#D4FF00] rounded-full"
                        ></div>
                      </div>
                      <span className="text-[#D9C5B4]">{res.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[#D4FF00] font-bold">₹{res.revenueGenerated}</td>
                  <td className="py-3.5 text-right">
                    <span className={`badge-tech font-mono ${
                      res.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                      res.status === 'in_use' ? 'bg-[#D96335]/25 text-[#D96335]' :
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

