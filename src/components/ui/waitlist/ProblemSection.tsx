"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Leads slipping through the cracks",
    description: "You're getting leads from Zillow, Facebook, and your site, but without a unified inbox, they get lost in chaos."
  },
  {
    title: "Wasting hours on unqualified buyers",
    description: "Calling numbers that go straight to voicemail while your hot leads cool down waiting for a response."
  },
  {
    title: "Manual follow-ups that don't scale",
    description: "Trying to remember who to text on Tuesday and whom to email on Friday. It’s exhausting and prone to error."
  }
];

export function ProblemSection() {
  return (
    <section className="py-24 bg-white border-y border-black/5">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-bold text-4xl text-[#2c2c2c] mb-6">
            The traditionalCRM is breaking your pipeline.
          </h2>
          <p className="text-[#2c2c2c]/70 text-lg font-medium">
            Real estate moves fast, but your tools are slowing you down.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((prob, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#f3f4f4] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 rounded-2xl border border-transparent hover:border-black/5"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold font-display text-xl mb-6">
                {idx + 1}
              </div>
              <h3 className="font-display font-bold text-xl text-[#2c2c2c] mb-3">{prob.title}</h3>
              <p className="text-[#2c2c2c]/70 font-medium leading-relaxed">{prob.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
