"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Home,
    Settings,
    Send,
    Globe,
    Shield,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';


export function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const firstName = user?.user_metadata?.first_name || 'Agent';
    const lastName = user?.user_metadata?.last_name || '';

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', href: '/leads', icon: Users },
        { name: 'Lead Capture', href: '/lead-capture', icon: Globe },
        { name: 'Engage', href: '/engage', icon: Send },
        { name: 'Properties', href: '/properties', icon: Home },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className="w-72 bg-white border-r border-black/5 flex flex-col h-screen sticky top-0 z-40">
            {/* Branding Header */}
            <div className="h-24 flex items-center px-8 border-b border-black/5">
                <Link href="/dashboard" className="flex items-center group w-full">
                    <div className="flex-shrink-0 origin-left scale-90 -ml-2">
                        <Logo />
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <nav className="space-y-1.5 font-medium">
                    {navLinks.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-[#853953]/5 text-[#853953]'
                                    : 'text-gray-500 hover:bg-[#F3F4F4] hover:text-[#2C2C2C]'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#853953] rounded-r-full" />
                                )}
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#853953]' : 'text-gray-400 group-hover:text-[#2C2C2C]'}`} />
                                <span className="text-sm tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>


            {/* Bottom User Profile */}
            <div className="p-6 border-t border-black/5 bg-[#F3F4F4]/20">
                <Link href="/account" title="View & Edit Agent Profile" className="flex items-center gap-4 cursor-pointer group hover:bg-white p-2.5 rounded-2xl transition-all border border-transparent hover:border-black/5 hover:shadow-sm">
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                                src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"}
                                alt="User avatar"
                                className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0"
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#2C2C2C] truncate group-hover:text-[#853953] transition-colors">
                            {firstName} {lastName}
                        </p>
                        <p className="text-[11px] font-bold text-[#853953] uppercase tracking-wider">Agent Profile</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
