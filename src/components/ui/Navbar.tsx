'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { createClient } from '@/utils/supabase/client';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch {}
    };
    checkUser();
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 py-3.5 shadow-sm' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 max-w-[1240px] flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#features" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors">
            Features
          </a>
          <a href="#simulator" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#853953]" />
            <span>AI Simulator</span>
          </a>
          <a href="#solutions" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors">
            Comparison
          </a>
          <a href="#roi" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors">
            ROI Calculator
          </a>
          <a href="#pricing" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm font-black text-[#2C2C2C]/70 hover:text-[#853953] transition-colors">
            FAQ
          </a>
          
          <div className="h-4 w-px bg-gray-300 mx-1" />

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-primary py-2.5 px-5 text-xs font-black shadow-md">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/sign-in" 
                className="text-sm font-black text-[#2C2C2C] hover:text-[#853953] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="btn-primary py-2.5 px-5 text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <span>Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-[#2C2C2C]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-gray-200 px-6 py-6 space-y-4 shadow-xl">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            Features
          </a>
          <a 
            href="#simulator" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            AI Simulator
          </a>
          <a 
            href="#solutions" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            Comparison
          </a>
          <a 
            href="#roi" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            ROI Calculator
          </a>
          <a 
            href="#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            Pricing
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black text-[#2C2C2C] hover:text-[#853953] py-2"
          >
            FAQ
          </a>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link 
              href="/sign-in" 
              className="w-full py-3 rounded-xl border border-gray-200 text-center font-black text-xs text-[#2C2C2C]"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="btn-primary w-full py-3 text-center font-black text-xs"
            >
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
