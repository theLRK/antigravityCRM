'use client';

import { motion } from 'framer-motion';
import { Target, Brain, Trophy } from 'lucide-react';

const steps = [
    {
        title: 'Capture Leads',
        description: 'Leads from your website, Zillow, or ads flow directly into Formative.',
        icon: <Target className="w-8 h-8" />
    },
    {
        title: 'AI Scores & Matches',
        description: 'AI analyzes intent and matches the right property in milliseconds.',
        icon: <Brain className="w-8 h-8" />
    },
    {
        title: 'Close Deals Faster',
        description: 'Focus on high-intent buyers and automate your repetitive follow-ups.',
        icon: <Trophy className="w-8 h-8" />
    }
];

export default function ProcessStrip() {
    return (
        <section className="py-24 bg-white border-y border-black/5">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-16">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-[#F3F4F4] text-[#853953] flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-[#853953] group-hover:to-[#612D53] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-[#853953]/20">
                                {step.icon}
                            </div>
                            <div className="relative">
                                <span className="absolute -top-6 -left-4 text-6xl font-black text-[#853953]/5 select-none transition-group-hover:text-[#853953]/10">0{idx + 1}</span>
                                <h3 className="text-2xl font-extrabold text-[#2C2C2C] mb-4 relative z-10">{step.title}</h3>
                            </div>
                            <p className="text-[#2C2C2C]/60 text-base leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
