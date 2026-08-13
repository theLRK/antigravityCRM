"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { createClient } from '@/utils/supabase/client';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

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
          ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-black text-[#2C2C2C]/60 hover:text-[#853953] transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-black text-[#2C2C2C]/60 hover:text-[#853953] transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm font-black text-[#2C2C2C]/60 hover:text-[#853953] transition-colors">Pricing</Link>
          
          {user ? (
            <>
              <Link href="/dashboard" className="btn-primary py-2.5 text-sm">
                Go to Dashboard
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-black text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-black text-[#2C2C2C]/60 hover:text-[#853953] transition-colors">Login</Link>
              <Link href="/sign-up" className="btn-primary py-2.5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Placeholder */}
        <div className="md:hidden">
          <button className="text-[#2C2C2C]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
