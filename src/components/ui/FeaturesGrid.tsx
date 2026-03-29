"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Search, Calendar, History, Clock } from 'lucide-react';

const features = [
  {
    title: "AI Lead Scoring",
    description: "Rank every lead dynamically based on intent, property match, and behavior.",
    icon: ShieldCheck
  },
  {
    title: "Automated Follow Ups",
    description: "Personalized outreach at the exact moment they show interest in a property.",
    icon: Mail
  },
  {
    title: "Property Matching Engine",
    description: "Our core AI algorithm matches leads to specific inventory with high precision.",
    icon: Search
  },
  {
    title: "Task & Calendar System",
    description: "Never miss a viewing or a call with AI-generated priorities for your day.",
    icon: Calendar
  },
  {
    title: "Email Tracking & History",
    description: "See when links are clicked and which properties are getting the most attention.",
    icon: History
  },
  {
    title: "Lead Timeline & Notes",
    description: "A chronological story of every interaction, from first click to closed deal.",
    icon: Clock
  }
];

export function FeaturesGrid() {
  return (
    <section className="py-32 bg-[#F3F4F4]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-modern p-10 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#853953]/5 flex items-center justify-center text-[#853953] mb-8 group-hover:bg-[#853953] group-hover:text-white transition-all duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#2C2C2C] mb-4">{feature.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
