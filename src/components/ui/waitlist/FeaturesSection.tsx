"use client";

import { motion } from "framer-motion";
import { Zap, BrainCircuit, Mail, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Zap,
    title: "Capture Every Lead",
    description:
      "Embed your Formative form on your website, share it on Instagram, WhatsApp, or anywhere. Every submission flows into your pipeline automatically — no copy-paste, no lost DMs.",
    color: "from-[#853953] to-[#612D53]",
    tagColor: "bg-[#853953]/10 text-[#853953]",
    stat: "100%",
    statLabel: "Auto-captured",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "AI Scores Intent Instantly",
    description:
      "The moment a lead submits, our engine analyzes their timeline, budget, motivation, and property preferences to generate a 0–100 intent score in under 3 seconds.",
    color: "from-violet-600 to-purple-800",
    tagColor: "bg-violet-500/10 text-violet-600",
    stat: "<3s",
    statLabel: "Score time",
  },
  {
    number: "03",
    icon: Mail,
    title: "Smart Follow-Ups, Automated",
    description:
      "Hot leads get your best pitch. Warm leads get a nurture sequence. Cold leads stay tracked. Formative sends the right message at the right time — while you sleep.",
    color: "from-blue-600 to-sky-800",
    tagColor: "bg-blue-500/10 text-blue-600",
    stat: "94%",
    statLabel: "Open rate",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Close Deals Faster",
    description:
      "Every lead, scored and staged. See your full pipeline at a glance. Know exactly who to call today and who needs a nudge next week. Built for agents who close.",
    color: "from-emerald-600 to-teal-800",
    tagColor: "bg-emerald-500/10 text-emerald-600",
    stat: "2.5x",
    statLabel: "More closes",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-28 bg-[#f3f4f4] relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-0 right-[5%] w-[500px] h-[500px] bg-[#853953]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 text-[#853953] font-bold text-sm shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#853953] animate-pulse" />
            How It Works
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#2c2c2c] tracking-tight leading-[1.1] mb-6">
            From scattered messages{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#853953] to-[#612d53]">
              to closed deals.
            </span>
          </h2>
          <p className="text-[#2c2c2c]/70 text-lg font-medium leading-relaxed">
            One automated flow that handles your leads from first touch to final close.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="group relative bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-default"
              >
                {/* Gradient shine on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${step.color} opacity-[0.06] rounded-full -mr-16 -mt-16 blur-2xl`} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    {/* Step number */}
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full ${step.tagColor}`}>
                      Step {step.number}
                    </span>
                    {/* Stat badge */}
                    <div className="text-right">
                      <div className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${step.color}`}>
                        {step.stat}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {step.statLabel}
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-display font-bold text-xl text-[#2c2c2c] mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[#2c2c2c]/65 font-medium leading-relaxed text-sm">
                    {step.description}
                  </p>

                  {/* Arrow connector for non-last items */}
                  {idx < steps.length - 1 && (
                    <div className="mt-6 pt-4 border-t border-black/[0.04] flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                      <ArrowRight className="w-3 h-3" />
                      Then
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
