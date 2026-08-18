'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck, CheckCircle2, Bot, MessageSquare, TrendingUp, Building2, Flame } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-gradient-to-b from-[#F3F4F4] via-[#FAFAFA] to-[#F3F4F4]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#853953]/10 via-[#612D53]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Hero Header */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-[#853953]/15 shadow-sm mb-8 backdrop-blur-md">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#853953] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#853953]"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-[#853953]">
                            AI-Powered Real Estate CRM 2.0
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight leading-[1.05] text-[#2C1E26] mb-8">
                        Close More Deals.{' '}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#853953] via-[#A34366] to-[#612D53]">
                            Chase Fewer Leads.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl md:text-2xl text-[#2C2C2C]/75 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Formative unifies WhatsApp, Instagram, and web inquiries into an autonomous CRM pipeline—scoring buyer intent in 3 seconds, triggering instant personalized follow-ups, and matching luxury listings automatically.
                    </p>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-10">
                        <Link
                            href="/sign-up"
                            className="btn-primary w-full sm:w-auto px-9 py-4 text-base font-black flex items-center justify-center gap-3 shadow-xl hover:shadow-[#853953]/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <span>Start 14-Day Free Trial</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <a
                            href="#simulator"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-[#2C2C2C] font-black text-base flex items-center justify-center gap-2.5 shadow-sm hover:border-[#853953]/30 transition-all"
                        >
                            <Sparkles className="w-4 h-4 text-[#853953]" />
                            <span>Try Interactive Simulator</span>
                        </a>

                        <Link
                            href="/sign-in"
                            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-[#853953] hover:bg-[#853953]/5 font-black text-base flex items-center justify-center transition-all"
                        >
                            <span>Sign In</span>
                        </Link>
                    </div>

                    {/* Trust Guarantees */}
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>60-Second Setup</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Enterprise-Grade Privacy</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Hero Preview Card */}
                <div className="relative mx-auto max-w-5xl rounded-[32px] p-2 bg-gradient-to-b from-white/80 via-white/50 to-white/20 border border-black/10 shadow-2xl backdrop-blur-xl">
                    <div className="bg-[#1e141a] rounded-[26px] p-6 sm:p-8 text-white overflow-hidden shadow-inner relative">
                        {/* Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="ml-3 text-xs font-mono text-white/50 tracking-wider">FORMATIVE INTELLIGENCE PLATFORM v2.4</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>AI Engine Active (94% Accuracy)</span>
                                </div>
                            </div>
                        </div>

                        {/* 3-Column Visual Dashboard Showcase */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Multi-Channel Inflow */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs uppercase font-black tracking-wider text-white/60">1. Real-Time Ingest</span>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">Omni-Channel</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">David Miller</p>
                                                    <p className="text-[10px] text-white/50">WhatsApp • 4-Bed Villa</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Just Now</span>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between opacity-80">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">Elena Rostova</p>
                                                    <p className="text-[10px] text-white/50">Web Intake • $1.8M Budget</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-white/60">3m ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/60 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Zero manual data entry</span>
                                </div>
                            </div>

                            {/* Column 2: Predictive Intent Scoring */}
                            <div className="bg-gradient-to-b from-[#853953]/25 to-white/5 border border-[#853953]/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#853953]/20 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs uppercase font-black tracking-wider text-pink-200">2. AI Intent Score</span>
                                        <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/10 text-center mb-3">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60">David Miller Intent</span>
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-white my-1">
                                            96 / 100
                                        </div>
                                        <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            HIGH INTENT • CASH BUYER
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/70 leading-snug">
                                        AI Rationale: Pre-approved, 30-day relocation timeline, specific property requirement in Marina.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400 font-bold flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>Scored in 2.4 seconds</span>
                                </div>
                            </div>

                            {/* Column 3: Autonomous Follow-Up & Pitch */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs uppercase font-black tracking-wider text-white/60">3. Autonomous Nurture</span>
                                        <Bot className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                                            <p className="font-bold text-blue-200">Personalized Pitch Generated</p>
                                            <p className="text-[11px] text-white/60 mt-0.5">Matched 2 off-market penthouses</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                            <p className="font-bold text-emerald-300">WhatsApp Dispatch Sent</p>
                                            <p className="text-[11px] text-white/60 mt-0.5">VIP viewing schedule link included</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/60 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Agent notified via Slack & Email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brokerage Trust Section */}
                <div className="mt-20 pt-10 border-t border-black/5 text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] mb-8">
                        Trusted by top luxury brokers & high-producing teams
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-500">
                        <span className="font-display text-2xl font-black italic tracking-tighter text-[#2C1E26]">COMPASS</span>
                        <span className="font-display text-2xl font-black italic tracking-tighter text-[#2C1E26]">SOTHEBY'S</span>
                        <span className="font-display text-2xl font-black italic tracking-tighter text-[#2C1E26]">KELLER WILLIAMS</span>
                        <span className="font-display text-2xl font-black italic tracking-tighter text-[#2C1E26]">RE/MAX</span>
                        <span className="font-display text-2xl font-black italic tracking-tighter text-[#2C1E26]">eXp REALTY</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
