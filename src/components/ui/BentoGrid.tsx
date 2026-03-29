'use client';

import { motion } from 'framer-motion';
import { Bot, Zap, Mail, LayoutDashboard, Database, Search } from 'lucide-react';

const features = [
    {
        title: 'AI Lead Scoring',
        description: 'Instantly rank every incoming lead 0-100 based on buyer intent, budget, and property preferences.',
        icon: <Bot className="w-6 h-6" />,
        className: 'md:col-span-2 md:row-span-2'
    },
    {
        title: 'Automated Emails',
        description: 'Send perfectly timed, personalized follow-ups that sound human and drive engagement.',
        icon: <Mail className="w-6 h-6" />,
        className: 'md:col-span-1'
    },
    {
        title: 'Property Matching',
        description: 'Automatically match high-intent leads with available inventory using our smart engine.',
        icon: <Search className="w-6 h-6" />,
        className: 'md:col-span-1'
    },
    {
        title: 'Smart Task Management',
        description: 'Never miss a callback with AI-generated priorities and automated deadline tracking.',
        icon: <LayoutDashboard className="w-6 h-6" />,
        className: 'md:col-span-1'
    },
    {
        title: 'Seamless Integrations',
        description: 'Connect leads from Zillow, Typeform, or custom sites in literal clicks.',
        icon: <Database className="w-6 h-6" />,
        className: 'md:col-span-2 md:row-span-1'
    },
];

export default function BentoGrid() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { type: 'spring' as const, damping: 20, stiffness: 100 } 
        }
    };

    return (
        <section className="py-32 bg-[#F3F4F4]">
            <div className="container mx-auto px-6">

                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold text-[#2C2C2C] mb-6 tracking-tight"
                    >
                        Built for the Modern <span className="text-[#853953]">Closing Agent</span>
                    </motion.h2>
                    <p className="text-xl text-[#2C2C2C]/60">
                        Powerful automation tools wrapped in a minimal, high-performance interface.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[220px]"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={`card-modern p-8 flex flex-col justify-between group overflow-hidden relative ${feature.className}`}
                        >
                            {/* Hover highlight background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#853953]/[0.02] to-[#612D53]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F3F4F4] text-[#2C2C2C] mb-6 relative z-10 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#853953] group-hover:to-[#612D53] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#853953]/25">
                                {feature.icon}
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-3 group-hover:text-[#853953] transition-colors">{feature.title}</h3>
                                <p className="text-[#2C2C2C]/60 text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
