'use client';

import Link from 'next/link';
import { 
  Cpu, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Resource } from '@/lib/types';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isAvailable = resource.status === 'available';
  const isInUse = resource.status === 'in_use';
  const isMaintenance = resource.status === 'maintenance';

  const categoryLabels: Record<string, string> = {
    equipment: 'Physical Equipment',
    space: 'Space & Facility',
    digital: 'Digital & Technical'
  };

  return (
    <div className="group bg-[#0D0F14] hover:bg-[#12151B] border border-white/8 hover:border-[#D4FF00]/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl">
      <div>
        {/* Image & Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-black">
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-transparent to-black/40"></div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="badge-tech bg-black/70 backdrop-blur-md text-white border border-white/10">
              {categoryLabels[resource.category] || resource.category}
            </span>

            <span className={`badge-tech backdrop-blur-md ${
              isAvailable 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : isInUse 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-400 animate-pulse' : isInUse ? 'bg-amber-400' : 'bg-red-400'
              }`}></span>
              {resource.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Passport ID pill */}
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            ID: {resource.passport_id}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-[11px] font-mono text-[#D4FF00] uppercase tracking-wider mb-1">
            {resource.subcategory}
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#D4FF00] transition-colors line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>

          {/* Location & Turnaround */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{resource.building}, {resource.room} ({resource.location})</span>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                Turnaround Buffer:
              </span>
              <span className="text-white font-medium">+{resource.turnaround_buffer_mins}m</span>
            </div>

            {/* SkillGate requirement badge */}
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4FF00]" />
                SkillGate Clearance:
              </span>
              <span className="text-[#D4FF00] font-medium">
                {resource.required_skills && resource.required_skills.length > 0
                  ? resource.required_skills[0].name
                  : 'Open Access'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500">Hourly Rate</div>
            <div className="text-base font-bold text-white font-mono">
              ₹{resource.hourly_rate}
              <span className="text-xs font-normal text-neutral-400">/hr</span>
            </div>
          </div>

          <Link
            href={`/resources/${resource.id}`}
            className="flex items-center gap-1.5 bg-[#151921] group-hover:bg-[#D4FF00] text-neutral-200 group-hover:text-black px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all"
          >
            Inspect Passport
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

