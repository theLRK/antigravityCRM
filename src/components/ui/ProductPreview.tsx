"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', description: 'Real-time metrics and AI insights at a glance.' },
  { id: 'profile', label: 'Lead Profile', description: 'Deep intelligence on every buyer and seller.' },
  { id: 'engage', label: 'Engage Page', description: 'Automated follow-ups and communication center.' },
  { id: 'properties', label: 'Properties', description: 'Smart inventory matching for your high-intent leads.' },
];

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <section className="py-32 bg-[#F3F4F4]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#2C2C2C] mb-4">See the Platform in Action</h2>
          <p className="text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-widest text-xs">Everything you need to close deals, all in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-20 p-2 bg-white rounded-3xl shadow-sm border border-black/[0.03] w-fit mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#853953] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-[#853953]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Area */}
        <div className="relative max-w-6xl mx-auto h-[600px] bg-white rounded-[40px] shadow-2xl border border-black/5 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 p-8 flex flex-col"
                >
                    <div className="mb-8 pl-4 border-l-4 border-[#853953]">
                        <h3 className="text-2xl font-black text-[#2C2C2C] mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
                        <p className="text-gray-400 font-bold text-sm tracking-tight">{tabs.find(t => t.id === activeTab)?.description}</p>
                    </div>

                    <div className="flex-1 rounded-3xl bg-gray-50 border border-black/[0.03] p-12 overflow-hidden relative group">
                        <div className="absolute inset-x-0 top-0 h-10 bg-white border-b border-black/[0.03] flex items-center px-6 gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                        </div>
                        
                        {/* Recursive Mockup Content */}
                        <div className="pt-8 grid grid-cols-12 gap-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                             <div className="col-span-3 space-y-6">
                                 <div className="h-4 w-full bg-gray-200 rounded" />
                                 <div className="h-4 w-2/3 bg-gray-200 rounded" />
                                 <div className="pt-12 space-y-4">
                                     <div className="h-2 w-full bg-gray-100 rounded" />
                                     <div className="h-2 w-full bg-gray-100 rounded" />
                                 </div>
                             </div>
                             <div className="col-span-9 grid grid-cols-2 gap-8">
                                 <div className="h-32 rounded-2xl bg-[#853953]/5 border border-[#853953]/10" />
                                 <div className="h-32 rounded-2xl bg-gray-200" />
                                 <div className="col-span-2 h-64 rounded-2xl bg-gray-100 shadow-inner" />
                             </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
