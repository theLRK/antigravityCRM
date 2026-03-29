"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="py-24 bg-white border-t border-black/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
              <Logo className="mb-8" />
              <p className="text-gray-400 max-w-xs leading-relaxed font-medium">
                The AI-powered command center for modern real estate professionals. Capture, score, and close with precision.
              </p>
          </div>
          <div>
              <h4 className="font-black text-[#2C2C2C] mb-8 uppercase text-[11px] tracking-widest">Product</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-bold">
                  <li><Link href="#features" className="hover:text-[#853953] transition-colors">AI Scoring</Link></li>
                  <li><Link href="#features" className="hover:text-[#853953] transition-colors">Property Matching</Link></li>
                  <li><Link href="#pricing" className="hover:text-[#853953] transition-colors">Pricing</Link></li>
              </ul>
          </div>
          <div>
              <h4 className="font-black text-[#2C2C2C] mb-8 uppercase text-[11px] tracking-widest">Legal & Contact</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-bold">
                  <li><Link href="#" className="hover:text-[#853953] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-[#853953] transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-[#853953] transition-colors">support@formative.io</Link></li>
              </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                © {new Date().getFullYear()} Formative CRM. All rights reserved.
            </p>
            <div className="flex gap-8 items-center">
                <Link href="#" className="text-gray-400 hover:text-[#853953] transition-colors font-bold text-xs uppercase tracking-widest text-[10px]">Twitter</Link>
                <Link href="#" className="text-gray-400 hover:text-[#853953] transition-colors font-bold text-xs uppercase tracking-widest text-[10px]">LinkedIn</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
