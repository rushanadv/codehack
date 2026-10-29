'use client';

import React from 'react';
import CinematicHeroExperience from '@/components/CinematicHeroExperience';

export default function HomePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0A0706] text-[#F1E7DE] selection:bg-[#D4FF00] selection:text-black">
      {/* 3D FULL-VIEWPORT HORIZONTAL EXPERIENCE ONLY (NO VERTICAL SCROLL) */}
      <CinematicHeroExperience />
    </div>
  );
}
