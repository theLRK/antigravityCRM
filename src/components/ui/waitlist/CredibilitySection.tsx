"use client";

import React from "react";
import { LiveCounter } from "./LiveCounter";
import { Sparkles, Activity, Target } from "lucide-react";

export function CredibilitySection() {
  return (
    <div className="py-24 bg-white border-y border-black/5 overflow-hidden relative">
      {/* Background soft blob */}
      <div className="absolute top-1/2 left-[80%] w-[300px] h-[300px] bg-[#3b82f6]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        
        {/* 1. Live Counters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Card 1: Leads Captured */}
          <div className="group bg-[#F3F4F4]/40 border border-black/5 rounded-[20px] p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:bg-white transition-all duration-300 flex items-center gap-5">
            <div className="p-3 bg-[#853953]/10 border border-[#853953]/10 text-[#853953] rounded-2xl flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-3xl font-display font-bold text-[#2c2c2c] tracking-tight">
                  <LiveCounter end={14842} />
                </p>
                {/* Pulse Indicator */}
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Leads Captured</p>
            </div>
          </div>

          {/* Card 2: Follow Ups Scheduled */}
          <div className="group bg-[#F3F4F4]/40 border border-black/5 rounded-[20px] p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:bg-white transition-all duration-300 flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 border border-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-3xl font-display font-bold text-[#2c2c2c] tracking-tight">
                  <LiveCounter end={3892} />
                </p>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Follow Ups Scheduled</p>
            </div>
          </div>

          {/* Card 3: Deals Tracked */}
          <div className="group bg-[#F3F4F4]/40 border border-black/5 rounded-[20px] p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:bg-white transition-all duration-300 flex items-center gap-5">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-3xl font-display font-bold text-[#2c2c2c] tracking-tight">
                  <LiveCounter end={642} />
                </p>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Deals Tracked</p>
            </div>
          </div>

        </div>

        {/* 2. Brand Trust Logos */}
        <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Backed by top producers in modern real estate</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-35 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
          <div className="font-display text-2xl font-black italic select-none">RE/MAX</div>
          <div className="font-display text-2xl font-black italic select-none">Compass</div>
          <div className="font-display text-2xl font-black italic select-none">Zillow</div>
          <div className="font-display text-2xl font-black italic select-none">Sotheby's</div>
          <div className="font-display text-2xl font-black italic select-none">Redfin</div>
        </div>

      </div>
    </div>
  );
}
