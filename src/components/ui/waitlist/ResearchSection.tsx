"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, EyeOff, FolderMinus, FileText, CheckCircle2, TrendingUp } from "lucide-react";

const insights = [
  {
    number: "01",
    headline: "Leads get buried inside WhatsApp chats.",
    text: "Many agents told us important conversations become difficult to find once new inquiries start arriving.",
    icon: MessageSquare,
    color: "text-emerald-500 bg-emerald-50 border-emerald-100"
  },
  {
    number: "02",
    headline: "Follow ups are easy to forget.",
    text: "Without reminders, buyers who seemed interested often disappear.",
    icon: AlertTriangle,
    color: "text-[#853953] bg-[#853953]/5 border-[#853953]/10"
  },
  {
    number: "03",
    headline: "No clear view of who is serious.",
    text: "Agents spend time chasing cold leads while hot opportunities go unnoticed.",
    icon: EyeOff,
    color: "text-blue-500 bg-blue-50 border-blue-100"
  },
  {
    number: "04",
    headline: "Everything is scattered.",
    text: "Leads often live across Instagram, WhatsApp, spreadsheets, notebooks, and memory.",
    icon: FolderMinus,
    color: "text-purple-500 bg-purple-50 border-purple-100"
  }
];

export function ResearchSection() {
  return (
    <section className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-[-10%] w-[350px] h-[350px] bg-[#853953]/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-black/5 text-slate-500 font-bold text-xs uppercase tracking-wider mb-6">
            <FileText className="w-3.5 h-3.5" />
            Market Validation Research
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#2c2c2c] mb-6 tracking-tight leading-none">
            We Didn't Start With Software.<br />
            We Started With Conversations.
          </h2>
          <p className="text-[#2c2c2c]/75 text-lg font-medium max-w-2xl leading-relaxed">
            We spoke with agents and researched how leads are managed. The same problems appeared again and again.
          </p>
        </div>

        {/* Layout Grid: Stats Sidebar + Findings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (Span 4): Research Stats Card */}
          <div className="lg:col-span-4 bg-[#F3F4F4]/80 border border-black/5 rounded-[24px] p-6 md:p-8 backdrop-blur-md shadow-sm">
            <h3 className="font-display font-bold text-lg text-[#2c2c2c] mb-6">Validation Methodology</h3>
            
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white border border-black/5 text-[#853953]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-[#2c2c2c]">50+ Sources</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Industry reports and agent pipelines reviewed.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white border border-black/5 text-[#853953]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-[#2c2c2c]">Multiple AI Reports</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Automated lead routing and sorting analyses.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white border border-black/5 text-[#853953]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-[#2c2c2c]">Industry Analysis</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">In-depth validation of workflow bottle-necks completed.</p>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-black/5 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
              100% Verified Findings
            </div>
          </div>

          {/* Right Column (Span 8): Insights Grid */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.number}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded-full">
                        Insight #{insight.number}
                      </span>
                      <div className={`p-2 rounded-xl border flex items-center justify-center ${insight.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <h4 className="font-display font-bold text-lg text-[#2c2c2c] mb-3 leading-snug">
                      {insight.headline}
                    </h4>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-black/[0.02] text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                    Source: Agent Interviews
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
