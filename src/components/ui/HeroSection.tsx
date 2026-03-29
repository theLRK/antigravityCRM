"use client";

import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2, Mail, Sparkles, TrendingUp, Calendar } from 'lucide-react';

const springTransition = { type: 'spring', damping: 20, stiffness: 100 };

export default function HeroSection() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
    const yTransform = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: springTransition as any
        }
    };

    return (
        <section ref={targetRef} className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-[#F3F4F4]">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#853953]/5 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#612D53]/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left: Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ opacity, scale, y: yTransform }}
                    className="flex flex-col items-start"
                >
                    <motion.div 
                        variants={itemVariants} 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-black/5 text-[#853953] text-sm font-bold mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Next-Gen Real Estate Intelligence
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-6xl lg:text-8xl font-black text-[#2C2C2C] leading-[0.95] mb-8 tracking-tighter"
                    >
                        Close More <br />
                        Deals with <span className="text-[#853953]">AI <br /> Powered</span> CRM
                    </motion.h1>

                    <motion.p 
                        variants={itemVariants}
                        className="text-xl text-[#2C2C2C]/60 mb-12 max-w-xl leading-relaxed font-medium"
                    >
                        Capture leads, match buyers to properties, and automate follow-ups with intelligent workflows designed for high-performance agents.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
                        <a href="/sign-up" className="btn-primary flex items-center gap-2 px-10 py-5 text-lg">
                            Get Started
                        </a>
                        <button className="btn-secondary px-10 py-5 text-lg">
                            Watch Demo
                        </button>
                    </motion.div>
                </motion.div>

                {/* Right: Star of the Show Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.4, type: 'spring' } as any}
                    className="relative hidden lg:block h-[600px]"
                >
                    {/* Main Mockup Base */}
                    <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl border border-black/[0.03] overflow-hidden translate-x-12 translate-y-12 opacity-40" />
                    <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl border border-black/[0.05] overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-16 bg-gray-50 border-b border-black/[0.03] flex items-center px-8 gap-3">
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                        </div>
                        <div className="p-8 pt-24 grid grid-cols-2 gap-6">
                            <div className="h-32 rounded-3xl bg-gray-50 animate-pulse" />
                            <div className="h-32 rounded-3xl bg-gray-50 animate-pulse" />
                            <div className="col-span-2 h-64 rounded-3xl bg-gray-50 animate-pulse" />
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [2, 1, 2] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute -top-10 -left-10 z-30 card-modern p-6 min-w-[240px]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Hot Lead</span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Lead Score</p>
                        <p className="text-4xl font-black text-[#2C2C2C]">87<span className="text-xl font-bold text-gray-300">/100</span></p>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [-2, -3, -2] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute top-1/4 -right-12 z-30 card-modern p-6 min-w-[260px]"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#853953]/10 flex items-center justify-center text-[#853953]">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Property Match</p>
                                <p className="text-sm font-black text-[#2C2C2C]">Lekki Duplex</p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-[92%] bg-gradient-to-r from-[#853953] to-[#612D53]" />
                        </div>
                        <p className="text-right text-xs font-black text-[#853953] mt-2">92% Match</p>
                    </motion.div>

                    <motion.div
                        animate={{ x: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                        className="absolute bottom-20 -left-16 z-30 card-modern p-4 flex items-center gap-4 shadow-2xl"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#2C2C2C]">Email Sent</p>
                            <p className="text-[11px] font-medium text-gray-400 leading-none">Auto-Followup #1</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ x: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                        className="absolute -bottom-8 right-10 z-30 card-modern p-4 flex items-center gap-4 shadow-2xl"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#2C2C2C]">Task Scheduled</p>
                            <p className="text-[11px] font-medium text-gray-400 leading-none">Viewing at 2 PM</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
