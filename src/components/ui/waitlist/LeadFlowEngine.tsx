"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Instagram,
  Globe,
  Users,
  Cpu,
  TrendingUp,
  Send,
  UserCheck,
  Check,
  Calendar,
  Building,
  DollarSign
} from "lucide-react";

interface LeadSource {
  id: string;
  name: string;
  source: "whatsapp" | "instagram" | "website" | "referral";
  details: string;
  score: number;
  badge: string;
  action: string;
  outcomeId: string;
}

const LEADS_DATA: LeadSource[] = [
  {
    id: "lead-1",
    name: "David K.",
    source: "whatsapp",
    details: "Move ASAP • Pre-approved",
    score: 94,
    badge: "High Intent",
    action: "Call Scheduled",
    outcomeId: "outcome-1"
  },
  {
    id: "lead-2",
    name: "Sarah M.",
    source: "instagram",
    details: "Looking for 4BD, Lekki",
    score: 88,
    badge: "Hot Prospect",
    action: "Intro Email Sent",
    outcomeId: "outcome-2"
  },
  {
    id: "lead-3",
    name: "Elena R.",
    source: "website",
    details: "Cash Buyer • $1.5M budget",
    score: 97,
    badge: "VIP Buyer",
    action: "Brochure Dispatched",
    outcomeId: "outcome-3"
  },
  {
    id: "lead-4",
    name: "John D.",
    source: "referral",
    details: "Relocating next month",
    score: 82,
    badge: "Warm Lead",
    action: "Follow-up Sent",
    outcomeId: "outcome-1"
  }
];

const OUTCOMES = [
  { id: "outcome-1", title: "Site Visit Scheduled", icon: Calendar, color: "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20" },
  { id: "outcome-2", title: "Deal Progressing", icon: Building, color: "text-[#853953] bg-[#853953]/10 border-[#853953]/20" },
  { id: "outcome-3", title: "Property Sold", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }
];

export function LeadFlowEngine() {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [step, setStep] = useState<"incoming" | "scoring" | "prioritizing" | "nurturing" | "routing" | "outcome">("incoming");
  const [liveScore, setLiveScore] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeLead = LEADS_DATA[currentLeadIndex];

  // Mouse move handler for premium 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 35; // extremely subtle division
    const y = (e.clientY - rect.top - rect.height / 2) / 35;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Animation Loop Controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === "incoming") {
      setLiveScore(0);
      timer = setTimeout(() => setStep("scoring"), 1800);
    } else if (step === "scoring") {
      // Animate score from 0 to actual score
      let start = 0;
      const end = activeLead.score;
      const duration = 1200;
      const stepTime = Math.abs(Math.floor(duration / end));
      
      const scoreTimer = setInterval(() => {
        start += 1;
        setLiveScore(start);
        if (start >= end) {
          clearInterval(scoreTimer);
        }
      }, stepTime);

      timer = setTimeout(() => {
        setStep("prioritizing");
      }, 1600);
    } else if (step === "prioritizing") {
      timer = setTimeout(() => setStep("nurturing"), 1500);
    } else if (step === "nurturing") {
      timer = setTimeout(() => setStep("routing"), 1500);
    } else if (step === "routing") {
      timer = setTimeout(() => setStep("outcome"), 1500);
    } else if (step === "outcome") {
      timer = setTimeout(() => {
        // Go to next lead and reset loop
        setCurrentLeadIndex((prev) => (prev + 1) % LEADS_DATA.length);
        setStep("incoming");
      }, 2500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [step, currentLeadIndex]);

  const getSourceIcon = (source: LeadSource["source"]) => {
    switch (source) {
      case "whatsapp":
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-[#d62976]" />;
      case "website":
        return <Globe className="w-4 h-4 text-blue-500" />;
      case "referral":
        return <Users className="w-4 h-4 text-purple-500" />;
    }
  };

  const getSourceLabel = (source: LeadSource["source"]) => {
    switch (source) {
      case "whatsapp": return "WhatsApp";
      case "instagram": return "Instagram";
      case "website": return "Website";
      case "referral": return "Referral";
    }
  };

  return (
    <div className="w-full select-none">
      {/* Desktop Version */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg) translateY(${mousePos.y * 0.15}px) translateX(${mousePos.x * 0.15}px)`,
          transition: "transform 0.1s ease-out"
        }}
        className="hidden md:block relative w-full h-[580px] overflow-hidden rounded-[24px] bg-white border border-black/5 p-6 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#853953]/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/5 rounded-full blur-[80px]" />

        {/* 1. Left Area: Lead Sources */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[220px] flex flex-col gap-6 z-10">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 pl-2 mb-[-8px]">Lead Channels</p>
          {LEADS_DATA.map((lead, idx) => {
            const isThisLeadActive = activeLead.id === lead.id && step !== "outcome";
            return (
              <motion.div
                key={lead.id}
                animate={isThisLeadActive ? { scale: 1.03, y: -2 } : { scale: 1, y: 0 }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                  isThisLeadActive
                    ? "bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-[#853953]/20"
                    : "bg-white/50 shadow-sm border-black/[0.03] opacity-60"
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-50 border border-black/[0.02] flex items-center justify-center shrink-0">
                  {getSourceIcon(lead.source)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2C2C2C] truncate">{lead.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{getSourceLabel(lead.source)}</p>
                </div>
                {isThisLeadActive && step === "incoming" && (
                  <motion.div 
                    layoutId="active-dot"
                    className="ml-auto w-2 h-2 rounded-full bg-[#853953]" 
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Pulsing SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          {/* Left Lead Connections to Hub */}
          {[120, 204, 288, 372].map((yPos, idx) => {
            const lead = LEADS_DATA[idx];
            const isActive = activeLead.id === lead.id && step !== "outcome";
            return (
              <g key={lead.id}>
                {/* Background line */}
                <path
                  d={`M 226 ${yPos} C 290 ${yPos}, 290 290, 360 290`}
                  fill="none"
                  stroke={isActive ? "rgba(133,57,83,0.15)" : "rgba(0,0,0,0.03)"}
                  strokeWidth="2"
                  className="transition-colors duration-500"
                />
                {/* Pulsing overlay */}
                {isActive && step === "incoming" && (
                  <motion.path
                    d={`M 226 ${yPos} C 290 ${yPos}, 290 290, 360 290`}
                    fill="none"
                    stroke="url(#purpleGrad)"
                    strokeWidth="2"
                    strokeDasharray="6 20"
                    animate={{ strokeDashoffset: [-40, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}

          {/* Hub to Right Outcome Connections */}
          {[170, 290, 410].map((yPos, idx) => {
            const outcome = OUTCOMES[idx];
            const isActive = step === "outcome" && activeLead.outcomeId === outcome.id;
            return (
              <g key={outcome.id}>
                <path
                  d={`M 580 290 C 640 290, 640 ${yPos}, 700 ${yPos}`}
                  fill="none"
                  stroke={isActive ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.03)"}
                  strokeWidth="2"
                  className="transition-colors duration-500"
                />
                {isActive && (
                  <motion.path
                    d={`M 580 290 C 640 290, 640 ${yPos}, 700 ${yPos}`}
                    fill="none"
                    stroke="url(#emeraldGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="8 20"
                    animate={{ strokeDashoffset: [-40, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#853953" stopOpacity="0" />
              <stop offset="50%" stopColor="#853953" stopOpacity="1" />
              <stop offset="100%" stopColor="#612D53" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#853953" stopOpacity="0" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* 2. Center Hub: Formative Processor */}
        <div className="absolute left-[360px] top-[100px] w-[220px] h-[380px] z-10 flex flex-col justify-between p-5 rounded-[24px] bg-white/40 border border-white/30 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center shadow-sm">
                <Cpu className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-bold text-xs tracking-tight text-[#2C2C2C]">FORMATIVE</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#853953] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#853953]"></span>
            </span>
          </div>

          {/* Engine Processing Steps */}
          <div className="flex-1 py-4 flex flex-col justify-between relative">
            
            {/* Step 1: Lead Scoring */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border transition-colors duration-300 ${
                  step === "scoring" ? "bg-[#853953]/10 border-[#853953]/20" : "bg-slate-50 border-black/[0.02]"
                }`}>
                  <TrendingUp className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    step === "scoring" ? "text-[#853953]" : "text-gray-400"
                  }`} />
                </div>
                <span className={`text-[11px] font-bold transition-colors duration-300 ${
                  step === "scoring" ? "text-[#853953]" : "text-gray-400"
                }`}>Lead Scoring</span>
              </div>
              
              <div className="h-6 flex items-center">
                {step === "scoring" ? (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-black text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded-md"
                  >
                    {liveScore}/100
                  </motion.span>
                ) : step !== "incoming" ? (
                  <span className="text-xs font-black text-[#2C2C2C] bg-slate-100 px-2 py-0.5 rounded-md opacity-60">
                    {activeLead.score}/100
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-300">--</span>
                )}
              </div>
            </div>

            {/* Step 2: AI Prioritization */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border transition-colors duration-300 ${
                  step === "prioritizing" ? "bg-[#853953]/10 border-[#853953]/20" : "bg-slate-50 border-black/[0.02]"
                }`}>
                  <Cpu className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    step === "prioritizing" ? "text-[#853953]" : "text-gray-400"
                  }`} />
                </div>
                <span className={`text-[11px] font-bold transition-colors duration-300 ${
                  step === "prioritizing" ? "text-[#853953]" : "text-gray-400"
                }`}>AI Priority</span>
              </div>
              
              <div className="h-6 flex items-center">
                {step === "prioritizing" ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded"
                  >
                    {activeLead.badge}
                  </motion.span>
                ) : (step !== "incoming" && step !== "scoring") ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded opacity-60">
                    {activeLead.badge}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-300">--</span>
                )}
              </div>
            </div>

            {/* Step 3: Nurture & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border transition-colors duration-300 ${
                  step === "nurturing" ? "bg-[#853953]/10 border-[#853953]/20" : "bg-slate-50 border-black/[0.02]"
                }`}>
                  <Send className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    step === "nurturing" ? "text-[#853953]" : "text-gray-400"
                  }`} />
                </div>
                <span className={`text-[11px] font-bold transition-colors duration-300 ${
                  step === "nurturing" ? "text-[#853953]" : "text-gray-400"
                }`}>Nurture Dispatch</span>
              </div>
              
              <div className="h-6 flex items-center">
                {step === "nurturing" ? (
                  <motion.span
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1"
                  >
                    <Check className="w-2.5 h-2.5" /> Sent
                  </motion.span>
                ) : (step === "routing" || step === "outcome") ? (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 opacity-60">
                    <Check className="w-2.5 h-2.5" /> Sent
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-300">--</span>
                )}
              </div>
            </div>

            {/* Step 4: Routing & Assignment */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border transition-colors duration-300 ${
                  step === "routing" ? "bg-[#853953]/10 border-[#853953]/20" : "bg-slate-50 border-black/[0.02]"
                }`}>
                  <UserCheck className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    step === "routing" ? "text-[#853953]" : "text-gray-400"
                  }`} />
                </div>
                <span className={`text-[11px] font-bold transition-colors duration-300 ${
                  step === "routing" ? "text-[#853953]" : "text-gray-400"
                }`}>Agent Routing</span>
              </div>
              
              <div className="h-6 flex items-center">
                {step === "routing" ? (
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded"
                  >
                    Assigned
                  </motion.span>
                ) : step === "outcome" ? (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded opacity-60">
                    Assigned
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-300">--</span>
                )}
              </div>
            </div>

          </div>

          {/* Footer State */}
          <div className="pt-3 border-t border-black/[0.04] text-[10px] font-semibold text-gray-400 text-center uppercase tracking-wider">
            {step === "incoming" && "Analyzing Incoming..."}
            {step === "scoring" && "Calculating Fit..."}
            {step === "prioritizing" && "Applying AI Rules..."}
            {step === "nurturing" && "Triggering Campaign..."}
            {step === "routing" && "Pushing to Pipeline..."}
            {step === "outcome" && "Success Output!"}
          </div>
        </div>

        {/* 3. Right Area: Outcomes */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[220px] flex flex-col gap-6 z-10">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 pl-2 mb-[-8px]">Deals Won</p>
          {OUTCOMES.map((outcome) => {
            const isThisOutcomeActive = step === "outcome" && activeLead.outcomeId === outcome.id;
            const Icon = outcome.icon;
            return (
              <motion.div
                key={outcome.id}
                animate={isThisOutcomeActive ? { scale: 1.05, border: "1px solid rgba(16,185,129,0.3)" } : { scale: 1 }}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 bg-white shadow-sm border-black/[0.03] ${
                  isThisOutcomeActive ? "shadow-[0_12px_25px_rgba(16,185,129,0.1)]" : "opacity-50"
                }`}
              >
                <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                  isThisOutcomeActive ? outcome.color : "bg-slate-50 border-black/[0.02] text-gray-400"
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold transition-colors ${isThisOutcomeActive ? "text-slate-900" : "text-gray-500"}`}>
                    {outcome.title}
                  </p>
                  <p className="text-[9px] text-gray-400 font-semibold truncate">
                    {isThisOutcomeActive ? `${activeLead.name} via ${getSourceLabel(activeLead.source)}` : "Awaiting sync..."}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Mobile Version - Simplified Vertical Flow */}
      <div className="block md:hidden w-full p-5 rounded-[24px] bg-white border border-black/5 shadow-md flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#853953]" />
            <span className="font-display font-bold text-sm text-[#2C2C2C]">Lead Flow Engine</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#853953]/10 text-[#853953] text-[9px] font-black uppercase tracking-wider animate-pulse">
            Active
          </span>
        </div>

        {/* Incoming Lead Source */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-black/[0.02] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-black/[0.03] flex items-center justify-center shadow-sm">
            {getSourceIcon(activeLead.source)}
          </div>
          <div>
            <p className="text-xs font-black text-[#2C2C2C]">{activeLead.name}</p>
            <p className="text-[9px] text-gray-400 font-bold">Via {getSourceLabel(activeLead.source)}</p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="text-xs font-black text-[#853953] bg-[#853953]/5 px-2 py-0.5 rounded-md">
              Score: {step === "incoming" ? "--" : step === "scoring" ? liveScore : activeLead.score}
            </span>
          </div>
        </div>

        {/* Dynamic Processing Status */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-black/[0.02] flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">AI Intent Score</span>
            <span className="font-black text-[#2C2C2C]">
              {step !== "incoming" ? `${activeLead.score}/100` : "Calculating..."}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#853953] to-[#612D53]"
              initial={{ width: "0%" }}
              animate={{ 
                width: step === "incoming" ? "10%" : step === "scoring" ? "40%" : "100%" 
              }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] mt-1">
            <span className="font-bold text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded">
              {step !== "incoming" && step !== "scoring" ? activeLead.badge : "Scoring..."}
            </span>
            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              {(step === "nurturing" || step === "routing" || step === "outcome") ? "Auto-Nurtured" : "Queued"}
            </span>
          </div>
        </div>

        {/* Outcome result */}
        <div className="p-3.5 rounded-xl border border-dashed border-gray-200 flex items-center justify-center bg-white">
          {step === "outcome" ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600 font-bold text-xs"
            >
              <Check className="w-4 h-4 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
              <span>Deal Won: {OUTCOMES.find(o => o.id === activeLead.outcomeId)?.title}</span>
            </motion.div>
          ) : (
            <span className="text-gray-400 font-bold text-xs animate-pulse">Processing Deal Stream...</span>
          )}
        </div>
      </div>
    </div>
  );
}
