'use client';

import Link from 'next/link';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { Resource } from '@/lib/types';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isAvailable = resource.status === 'available';
  const isInUse = resource.status === 'in_use';
  const isMaintenance = resource.status === 'maintenance';

  const categoryConfigs: Record<string, { label: string; stripe: string; tagColor: string }> = {
    equipment: {
      label: '02 // PHYSICAL ASSET',
      stripe: 'from-[#7A210A] to-[#B53F1E]',
      tagColor: 'text-[#D95927]',
    },
    space: {
      label: '01 // CONTROLLED SPACE',
      stripe: 'from-[#0D2127] to-[#1C3E48]',
      tagColor: 'text-cyan-400',
    },
    digital: {
      label: '03 // DIGITAL COMPUTE',
      stripe: 'from-[#1B1E13] to-[#2D331A]',
      tagColor: 'text-[#D4FF00]',
    },
  };

  const config = categoryConfigs[resource.category] || {
    label: resource.category.toUpperCase(),
    stripe: 'from-[#2E1610] to-[#592618]',
    tagColor: 'text-[#D4FF00]',
  };

  return (
    <div className="group rounded-xl overflow-hidden border-2 border-[#AD7257]/35 hover:border-[#D4FF00] bg-[#140F0D] flex flex-col justify-between transition-colors duration-200">
      
      {/* Solid Top Category Header Stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${config.stripe}`} />

      <div>
        {/* Image & Status Stamp Header */}
        <div className="relative h-44 w-full overflow-hidden bg-[#0A0706]">
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140F0D] via-transparent to-black/60" />

          {/* Top Header Stamps */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px]">
            <span className="bg-[#0A0706]/90 text-[#F1E7DE] border border-[#AD7257]/40 px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider">
              {config.label}
            </span>

            <span className={`px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider border ${
              isAvailable 
                ? 'bg-[#15803D] text-white border-emerald-400' 
                : isInUse 
                ? 'bg-[#B53F1E] text-white border-[#E25822]'
                : 'bg-neutral-800 text-neutral-300 border-neutral-600'
            }`}>
              {isAvailable ? 'AVAILABLE NOW' : isInUse ? 'IN USE // RESERVED' : 'CALIBRATING'}
            </span>
          </div>

          {/* Passport ID Seal */}
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-[#E6D7CB] bg-[#140F0D]/95 px-2 py-0.5 rounded-xs border border-[#AD7257]/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#D4FF00]" />
            <span>PASSPORT: {resource.passport_id}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-widest font-bold mb-1 ${config.tagColor}`}>
              {resource.subcategory}
            </div>

            <h3 className="text-lg font-bold text-[#F1E7DE] group-hover:text-[#D4FF00] transition-colors line-clamp-1 leading-snug">
              {resource.title}
            </h3>

            <p className="text-xs text-[#D9C5B4] mt-2 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Concrete Tabular Specification Matrix */}
          <div className="p-3.5 rounded-lg bg-[#1B1310] border border-[#AD7257]/30 font-mono text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 text-[#D9C5B4]">
              <MapPin className="w-3.5 h-3.5 text-[#D95927] shrink-0" />
              <span className="truncate">{resource.building}, {resource.room} ({resource.location})</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#AD7257]/20">
              <span className="text-[#A99A90] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#AD7257]" />
                Turnaround Buffer:
              </span>
              <span className="text-[#F1E7DE] font-bold">+{resource.turnaround_buffer_mins}m</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#AD7257]/20">
              <span className="text-[#A99A90] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4FF00]" />
                SkillGate Clearance:
              </span>
              <span className="text-[#D4FF00] font-bold">
                {resource.required_skills && resource.required_skills.length > 0
                  ? resource.required_skills[0].name
                  : 'Open Access'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Solid Rate & Booking Bar */}
      <div className="p-5 pt-3 border-t border-[#AD7257]/20 bg-[#100A08] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase text-[#A99A90] tracking-wider">Hourly Rate</div>
          <div className="text-lg font-bold text-[#D4FF00] font-mono leading-none mt-0.5">
            ₹{resource.hourly_rate}
            <span className="text-xs font-normal text-[#A99A90]"> / hr</span>
          </div>
        </div>

        <Link
          href={`/resources/${resource.id}`}
          className="inline-flex items-center gap-1.5 bg-[#201612] hover:bg-[#D4FF00] text-[#F1E7DE] hover:text-black border border-[#AD7257]/40 hover:border-[#D4FF00] px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
        >
          <span>Inspect Slot</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
