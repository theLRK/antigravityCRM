'use client';

import { motion } from 'framer-motion';
import { Settings, Users, ArrowRight, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const onboardingSteps = [
    {
        icon: <Settings className="w-6 h-6 text-[#853953]" />,
        title: 'Configure Your Pipeline',
        description: 'Connect your lead sources and define your custom AI scoring rules.',
        action: 'Setup Workflows',
        color: 'bg-[#853953]/5 border-[#853953]/10 hover:border-[#853953]/30',
        iconBg: 'bg-[#853953]/10',
        delay: 0.1,
    },
    {
        icon: <Users className="w-6 h-6 text-[#853953]" />,
        title: 'Invite Your Agents',
        description: 'Add team members and assign them to specific lead routing territories.',
        action: 'Manage Team',
        color: 'bg-[#853953]/5 border-[#853953]/10 hover:border-[#853953]/30',
        iconBg: 'bg-[#853953]/10',
        delay: 0.2,
    },
    {
        icon: <Target className="w-6 h-6 text-[#853953]" />,
        title: 'AI Lead Matching',
        description: 'Enable the reasoning engine to automatically match MLS properties to buyers.',
        action: 'Enable Engine',
        color: 'bg-[#853953]/5 border-[#853953]/10 hover:border-[#853953]/30',
        iconBg: 'bg-[#853953]/10',
        delay: 0.3,
    }
];

export function OnboardingGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {onboardingSteps.map((step, index) => (
                <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: step.delay }}
                    whileHover={{ y: -5 }}
                    className={cn(
                        "relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md",
                        step.color
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", step.iconBg)}>
                            {step.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-slate-600 text-sm flex-grow mb-6 leading-relaxed">
                            {step.description}
                        </p>

                        <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-[#853953] transition-colors">
                            {step.action}
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
