"use client";

import React from 'react';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Core Node */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-xl rotate-45 transition-transform group-hover:rotate-90 duration-500 shadow-lg shadow-[#853953]/20" />
        
        {/* Connection Points */}
        <div className="relative z-10 flex flex-wrap w-5 h-5 gap-1 justify-center items-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-75" />
        </div>
        
        {/* Orbiting Ring (Subtle) */}
        <div className="absolute inset-[-4px] border border-[#853953]/10 rounded-2xl rotate-12 group-hover:rotate-[192deg] transition-transform duration-1000" />
      </div>
      
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black text-[#2C2C2C] tracking-tighter">Formative</span>
        <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5">CRM Intelligence</span>
      </div>
    </div>
  );
}
