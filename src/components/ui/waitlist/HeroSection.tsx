"use client";

import { motion } from "framer-motion";
import { WaitlistForm } from "./WaitlistForm";
import { LeadFlowEngine } from "./LeadFlowEngine";

export function HeroSectionWaitlist() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#853953]/10 text-[#853953] font-bold text-sm mb-8 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#853953] animate-pulse" />
              Early Access Now Open
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-bold text-5xl md:text-6xl lg:text-[72px] leading-[1.05] tracking-tight text-[#2c2c2c] mb-6"
            >
              Close More Deals. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#853953] to-[#612d53]">
                Chase Fewer Leads.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-[#2c2c2c]/70 font-medium max-w-lg mb-10 leading-relaxed"
            >
              Turn messaging chaos into a streamlined pipeline. Formative organizes your real estate leads, automates follow-ups, and scores intent so you only focus on buyers ready to move.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full"
            >
              <WaitlistForm />
              <p className="text-[#2c2c2c]/60 text-sm mt-4 font-medium">Join 500+ agents already on the list. No credit card required.</p>
            </motion.div>
          </div>

          {/* Right: Lead Flow Engine Visual */}
          <div className="relative w-full flex items-center justify-center">
            <LeadFlowEngine />
          </div>

        </div>
      </div>
    </section>
  );
}
