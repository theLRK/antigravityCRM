"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, Mail, Star } from "lucide-react";

const metrics = [
  { label: "Pipeline Value", value: "$2.4M", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Leads This Month", value: "124", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Avg. Response", value: "4 min", icon: Mail, color: "text-[#853953]", bg: "bg-[#853953]/10" },
  { label: "Conversion Rate", value: "34%", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
];

const features = [
  "AI instantly scores lead intent",
  "Automated smart follow-ups via email",
  "Unified inbox for all communications",
  "Property-matching algorithms",
];

export function ValueSection() {
  return (
    <section className="py-24 bg-[#f3f4f4]">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display font-bold text-4xl leading-tight text-[#2c2c2c]">
              Stop managing databases. <br />
              <span className="text-[#853953]">Start managing relationships.</span>
            </h2>
            <div className="space-y-4">
              {features.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#612d53] shrink-0" />
                  <span className="text-lg font-medium text-[#2c2c2c]">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Animated ROI Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full"
          >
            {/* Dashboard card shell */}
            <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-black/5 overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Formative AI</p>
                  <h3 className="text-base font-black text-[#2c2c2c]">Your Results, This Month</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {metrics.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="bg-[#F3F4F4] rounded-2xl p-4 border border-black/[0.03] hover:bg-white hover:shadow-md transition-all duration-300 group"
                    >
                      <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-4.5 h-4.5 ${m.color}`} />
                      </div>
                      <p className="text-2xl font-black text-[#2c2c2c] tracking-tight">{m.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{m.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Conversion lift callout */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-[#853953] to-[#612D53] rounded-2xl p-5 text-white flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Avg. Agent Result</p>
                  <p className="text-lg font-black">2.5× more appointments</p>
                  <p className="text-white/70 text-xs font-medium mt-0.5">Within the first 30 days</p>
                </div>
                <div className="text-5xl font-black opacity-20 font-display">↑</div>
              </motion.div>

              {/* Ambient glow */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#853953]/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
