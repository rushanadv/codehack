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
    space: { label: 'Property & Spaces', accent: 'text-[#C7BC91] border-[#C7BC91]/30 bg-[#C7BC91]/10' },
    equipment: { label: 'Physical Assets', accent: 'text-[#82996D] border-[#82996D]/30 bg-[#82996D]/10' },
    digital: { label: 'Digital & Tech', accent: 'text-[#A9BE89] border-[#A9BE89]/30 bg-[#A9BE89]/10' },
  };

  const cat = categoryLabels[resource.category] || { label: resource.category, accent: 'text-[#B7C2B1] border-[#344438] bg-[#203025]' };

  return (
    <div className="group rounded-xl overflow-hidden border border-[#344438] hover:border-[#82996D] bg-[#17251B] flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-[#82996D]/5">
      
      <div>
        {/* Resource Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-[#0D1812]">
          <img
            src={resource.image_url}
            alt={resource.title}
            onError={(e) => {
              // Graceful high-integrity fallback to reliable technical laboratory photography
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-102 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17251B] via-transparent to-black/40" />

          {/* Category & Status Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${cat.accent}`}>
              {cat.label}
            </span>

            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 ${
              isAvailable 
                ? 'bg-[#4E7A5D]/20 text-[#A9BE89] border-[#4E7A5D]/40' 
                : isInUse 
                ? 'bg-[#C79A49]/20 text-[#E0A85C] border-[#C79A49]/40'
                : 'bg-[#203025] text-[#B7C2B1] border-[#344438]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-[#4E7A5D]' : isInUse ? 'bg-[#C79A49]' : 'bg-[#7E8D77]'
              }`} />
              {isAvailable ? 'Available' : isInUse ? 'In Use' : 'Scheduled'}
            </span>
          </div>

          {/* Subcategory Pill */}
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#B7C2B1] bg-[#17251B]/90 px-2 py-0.5 rounded border border-[#344438]">
            {resource.subcategory}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[#F1F0E5] group-hover:text-white transition-colors line-clamp-1">
              {resource.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[#B7C2B1] mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#82996D] shrink-0" />
              <span className="truncate">{resource.building} • {resource.location}</span>
            </div>

            <p className="text-xs text-[#B7C2B1] mt-2 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Specifications & Buffer Matrix */}
          <div className="pt-3 border-t border-[#344438]/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-[#B7C2B1]">
              <Clock className="w-3 h-3 text-[#C7BC91]" />
              <span>Buffer: +{resource.turnaround_buffer_mins}m</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#B7C2B1] justify-end">
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
      <div className="p-4 pt-3 border-t border-[#344438] bg-[#101D15] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase text-[#7E8D77] tracking-wider">Hourly Rate</div>
          <div className="text-base font-bold text-[#C7BC91] font-mono leading-none mt-0.5">
            ${resource.hourly_rate}
            <span className="text-xs font-normal text-[#7E8D77]"> / hr</span>
          </div>
        </div>

        <Link
          href={`/resources/${resource.slug || resource.id}`}
          className="inline-flex items-center gap-1.5 bg-[#203025] hover:bg-[#82996D] text-[#F1F0E5] hover:text-[#0B1510] border border-[#344438] hover:border-[#82996D] px-3.5 py-1.5 rounded-md text-xs font-medium transition-all active:translate-y-0.5 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
