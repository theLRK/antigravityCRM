'use client';

import React from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';

export function TestimonialsSection() {
    const testimonials = [
        {
            name: 'Marcus Vance',
            role: 'Managing Broker & Team Lead',
            brokerage: 'Vance Luxury Group • Miami, FL',
            quote: 'Before Formative, our agents spent 3 hours every morning guessing which WhatsApp inquiries to call first. Formative’s 3-second scoring increased our lead-to-showing rate by 38% in our first 45 days.',
            stats: '+38% Showings Booked',
            rating: 5
        },
        {
            name: 'Sophia Sterling',
            role: 'Top 1% Luxury Producer',
            brokerage: 'Sotheby’s International • Aspen, CO',
            quote: 'The 1-Click Presenter Mode is a lifesaver. I share my screen with ultra-high-net-worth clients during Zoom pitches and all internal score notes and price margins are automatically hidden.',
            stats: '$4.2M Extra Volume Closed',
            rating: 5
        },
        {
            name: 'Julian Hayes',
            role: 'Commercial & Multi-Family Advisor',
            brokerage: 'Compass Commercial • Austin, TX',
            quote: 'The smart property matchmaker automatically paired 2 off-market listings with pre-approved buyers who submitted our web form while I was asleep. Formative paid for itself for the next 10 years.',
            stats: 'Saved 14 hrs/week',
            rating: 5
        }
    ];

    return (
        <section className="py-24 bg-[#F3F4F4] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-black uppercase tracking-widest text-[#853953] bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm mb-4 inline-block">
                        Social Proof & Results
                    </span>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-4">
                        Loved by Agents Who Close
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        Hear how top producers across luxury markets use Formative AI to streamline their pipelines.
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                        >
                            <div>
                                {/* Stars & Stat Badge */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {item.stats}
                                    </span>
                                </div>

                                <Quote className="w-8 h-8 text-[#853953]/20 mb-3" />

                                <p className="text-sm text-gray-700 font-medium leading-relaxed mb-6 italic">
                                    "{item.quote}"
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="font-black text-[#2C1E26] text-base">{item.name}</h4>
                                <p className="text-xs text-gray-500 font-semibold">{item.role}</p>
                                <p className="text-[11px] text-[#853953] font-bold mt-0.5">{item.brokerage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
