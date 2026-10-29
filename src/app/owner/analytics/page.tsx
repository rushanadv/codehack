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
      <div className="min-h-screen bg-[#11100F] py-32 text-center text-xs font-mono text-[#8C827A] uppercase tracking-wider">
        Aggregating Utilization Telemetry...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#11100F] text-[#F3EADF] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#2C2723] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[#D69A49]">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Capacity Analytics & Utilization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F3EADF] tracking-tight">
            Operational Telemetry
          </h1>
          <p className="text-xs text-[#8C827A] mt-1.5 max-w-xl">
            Live telemetry calculated from real application bookings, turnaround buffer efficiency, and idle capacity monetization across research bays.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#211E1B] hover:bg-[#2A2622] text-[#F3EADF] rounded-lg font-mono text-xs border border-[#38312C] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#191715] border border-[#2C2723]">
          <div className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider mb-2">Overall Utilization</div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#D69A49]">
            {data.overallUtilizationRate}%
          </div>
          <div className="text-[10px] text-[#6B6158] font-mono mt-1">Target operational band</div>
        </div>

        <div className="p-5 rounded-xl bg-[#191715] border border-[#2C2723]">
          <div className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider mb-2">Cost Recovery (USD)</div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#F3EADF]">
            ${data.totalRevenueRecovered.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#6B6158] font-mono mt-1">Reinvested in maintenance</div>
        </div>

        <div className="p-5 rounded-xl bg-[#191715] border border-[#2C2723]">
          <div className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider mb-2">Idle Hours Captured</div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#B65E42]">
            {data.idleCapacityCapturedHours} hrs
          </div>
          <div className="text-[10px] text-[#6B6158] font-mono mt-1">Mobilized research time</div>
        </div>

        <div className="p-5 rounded-xl bg-[#191715] border border-[#2C2723]">
          <div className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider mb-2">Waitlist Volume</div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#B8ADA0]">
            {data.waitlistVolume} reqs
          </div>
          <div className="text-[10px] text-[#6B6158] font-mono mt-1">FairShare queued</div>
        </div>
      </div>

      {/* Demand Over Time Visualization */}
      <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2C2723]">
          <div>
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F3EADF]">
              7-Day Utilization & Hourly Booking Demand
            </h3>
            <p className="text-xs text-[#8C827A] mt-0.5">Calculated utilization load across all campus facilities</p>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#211E1B] text-[#D69A49] border border-[#38312C]">
            Peak: Friday (31.5h)
          </span>
        </div>

        {/* Clean, robust Bar Chart */}
        <div className="grid grid-cols-7 gap-3 items-end h-48 pt-4 pb-2">
          {data.demandTimeline.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.hoursBooked / 35) * 100));
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-[#8C827A] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hoursBooked}h
                </div>
                <div className="w-full bg-[#151312] rounded overflow-hidden flex flex-col justify-end h-32 border border-[#24201D]">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#B65E42] rounded-t transition-all duration-300 group-hover:bg-[#A35238]"
                  />
                </div>
                <div className="text-xs font-mono text-[#F3EADF] mt-2 font-medium">{item.day}</div>
                <div className="text-[10px] font-mono text-[#6B6158]">${item.revenue}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset-by-Asset Utilization Table */}
      <div className="p-6 rounded-xl bg-[#191715] border border-[#2C2723] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#2C2723]">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F3EADF]">
            Resource Performance & Turnaround Metrics
          </h3>
          <span className="text-[10px] font-mono text-[#8C827A]">
            {data.resourceBreakdown.length} ASSETS REGISTERED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2C2723] text-[#8C827A] uppercase text-[10px]">
                <th className="pb-3 font-medium">Asset Name</th>
                <th className="pb-3 font-medium">Domain</th>
                <th className="pb-3 font-medium">Turnaround</th>
                <th className="pb-3 font-medium">Hours Utilized</th>
                <th className="pb-3 font-medium">Utilization</th>
                <th className="pb-3 font-medium">Recovery ($)</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24201D]">
              {data.resourceBreakdown.map((res) => (
                <tr key={res.id} className="hover:bg-[#211E1B]/50 transition-colors">
                  <td className="py-3 pr-4 text-[#F3EADF] font-medium font-sans truncate max-w-[200px]">
                    <Link href={`/resources/${res.id}`} className="hover:text-[#D69A49] transition-colors">
                      {res.title}
                    </Link>
                  </td>
                  <td className="py-3 text-[#8C827A] capitalize">{res.category}</td>
                  <td className="py-3 text-[#8C827A]">+{res.turnaroundBufferMins}m</td>
                  <td className="py-3 text-[#F3EADF]">{res.hoursUtilized} hrs</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#211E1B] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${res.utilizationRate}%` }}
                          className="h-full bg-[#B65E42] rounded-full"
                        />
                      </div>
                      <span className="text-[#8C827A]">{res.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-[#D69A49] font-medium">${res.revenueGenerated}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                      res.status === 'available' ? 'bg-[#4E7A5D]/15 text-[#4E7A5D] border-[#4E7A5D]/30' :
                      res.status === 'in_use' ? 'bg-[#D69A49]/15 text-[#D69A49] border-[#D69A49]/30' :
                      'bg-[#B84A39]/15 text-[#B84A39] border-[#B84A39]/30'
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
