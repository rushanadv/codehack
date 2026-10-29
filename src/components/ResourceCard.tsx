'use client';

import Link from 'next/link';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight
} from 'lucide-react';
import { Resource } from '@/lib/types';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isAvailable = resource.status === 'available';
  const isInUse = resource.status === 'in_use';

  const categoryLabels: Record<string, { label: string; accent: string }> = {
    space: { label: 'Property & Spaces', accent: 'text-[#D69A49] border-[#D69A49]/30 bg-[#D69A49]/10' },
    equipment: { label: 'Physical Assets', accent: 'text-[#B65E42] border-[#B65E42]/30 bg-[#B65E42]/10' },
    digital: { label: 'Digital & Tech', accent: 'text-[#F3EADF] border-[#38312C] bg-[#211E1B]' },
  };

  const cat = categoryLabels[resource.category] || { label: resource.category, accent: 'text-[#B8ADA0] border-[#38312C] bg-[#211E1B]' };

  return (
    <div className="group rounded-xl overflow-hidden border border-[#38312C] hover:border-[#B65E42] bg-[#191715] flex flex-col justify-between transition-all duration-200">
      
      <div>
        {/* Resource Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-[#11100F]">
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-102 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191715] via-transparent to-black/40" />

          {/* Category & Status Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${cat.accent}`}>
              {cat.label}
            </span>

            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 ${
              isAvailable 
                ? 'bg-[#4E7A5D]/15 text-[#6BA87E] border-[#4E7A5D]/30' 
                : isInUse 
                ? 'bg-[#C68A3C]/15 text-[#E0A85C] border-[#C68A3C]/30'
                : 'bg-[#211E1B] text-[#B8ADA0] border-[#38312C]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-[#6BA87E]' : isInUse ? 'bg-[#E0A85C]' : 'bg-[#B8ADA0]'
              }`} />
              {isAvailable ? 'Available' : isInUse ? 'In Use' : 'Scheduled'}
            </span>
          </div>

          {/* Subcategory Pill */}
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#B8ADA0] bg-[#191715]/90 px-2 py-0.5 rounded border border-[#38312C]">
            {resource.subcategory}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[#F3EADF] group-hover:text-white transition-colors line-clamp-1">
              {resource.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[#B8ADA0] mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B65E42] shrink-0" />
              <span className="truncate">{resource.building} • {resource.location}</span>
            </div>

            <p className="text-xs text-[#B8ADA0] mt-2 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Specifications & Buffer Matrix */}
          <div className="pt-3 border-t border-[#38312C]/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-[#B8ADA0]">
              <Clock className="w-3 h-3 text-[#D69A49]" />
              <span>Buffer: +{resource.turnaround_buffer_mins}m</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#B8ADA0] justify-end">
              <ShieldCheck className="w-3 h-3 text-[#4E7A5D]" />
              <span className="truncate">
                {resource.required_skills && resource.required_skills.length > 0
                  ? resource.required_skills[0].name.split(' ')[0] + ' Req.'
                  : 'Open Access'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Rate & Action */}
      <div className="p-4 pt-3 border-t border-[#38312C] bg-[#141211] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase text-[#B8ADA0] tracking-wider">Hourly Rate</div>
          <div className="text-base font-bold text-[#F3EADF] font-mono leading-none mt-0.5">
            ${resource.hourly_rate}
            <span className="text-xs font-normal text-[#B8ADA0]"> / hr</span>
          </div>
        </div>

        <Link
          href={`/resources/${resource.slug || resource.id}`}
          className="inline-flex items-center gap-1.5 bg-[#211E1B] hover:bg-[#B65E42] text-[#F3EADF] hover:text-white border border-[#38312C] hover:border-[#B65E42] px-3.5 py-1.5 rounded-md text-xs font-medium transition-all active:translate-y-0.5 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
