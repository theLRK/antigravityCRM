"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Cpu, Handshake } from 'lucide-react';

const steps = [
  {
    title: "Capture Leads",
    description: "Connect your website, portal accounts, and social ads directly to Formative.",
    icon: Target
  },
  {
    title: "AI Scores & Matches",
    description: "Our engine analyzes intent and matches the right property in milliseconds.",
    icon: Cpu
  },
  {
    title: "Close Deals Faster",
    description: "Schedule viewings, automate follow-ups, and get contracts signed.",
    icon: Handshake
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-[#2C2C2C] mb-6">Built for Closing</h2>
            <p className="text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-widest text-xs">Transforming your workflow in three steps</p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-16 md:gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/[0.03] hidden md:block -translate-y-1/2 overflow-hidden">
             <motion.div 
               initial={{ x: '-100%' }}
               whileInView={{ x: '100%' }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#853953]/20 to-transparent"
             />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-[32px] bg-white shadow-2xl border border-black/[0.03] flex items-center justify-center text-[#853953] mb-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#853953] to-[#612D53] opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
                <step.icon className="w-10 h-10 relative z-10 transition-colors group-hover:text-white" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#853953] text-white flex items-center justify-center text-xs font-black shadow-lg">
                    {idx + 1}
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#2C2C2C] mb-4">{step.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
