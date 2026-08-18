'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function FinalCtaBanner() {
    return (
        <section className="py-24 bg-[#1E141A] text-white relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#853953]/40 via-[#A34366]/25 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 max-w-[1000px] relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 shadow-sm mb-6 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-pink-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                        Upgrade Your Pipeline Today
                    </span>
                </div>

                <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-6 leading-tight">
                    Start Closing High-Intent Real Estate Leads with AI
                </h2>

                <p className="text-lg sm:text-xl text-white/75 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                    Join hundreds of top luxury agents, producers, and brokerages automating their daily sales workflows with Formative.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <Link
                        href="/sign-up"
                        className="btn-primary w-full sm:w-auto px-10 py-4 text-base font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all"
                    >
                        <span>Start 14-Day Free Trial</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/sign-in"
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black text-base flex items-center justify-center transition-all"
                    >
                        <span>Sign In to Account</span>
                    </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 font-semibold">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Instant 60-Second Setup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>No Credit Card Required</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Cancel Anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
