"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function ProblemSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-[#2C2C2C] leading-tight mb-12 tracking-tighter"
          >
            Most agents lose deals because they <span className="text-gray-300">don’t follow up</span> at the right time.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl font-bold text-[#853953] leading-relaxed max-w-3xl mx-auto"
          >
            Our AI tells you who to contact, what to send, and which property to recommend.
          </motion.p>
        </div>
      </div>
      
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <div className="text-[20vw] font-black text-[#2C2C2C] whitespace-nowrap">FORMATIVE CRM AI SYSTEM</div>
      </div>
    </section>
  );
}
