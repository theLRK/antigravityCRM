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
    Eye,
    EyeOff,
    LogOut,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { usePresenterMode } from '@/components/ui/PresenterModeContext';

export function Sidebar({ user, avatarUrl }: { user: any, avatarUrl?: string }) {
    const pathname = usePathname();
    const { isPresenterMode, togglePresenterMode } = usePresenterMode();
    const meta = user?.user_metadata || {};
    const fullName = meta.full_name || meta.name || '';
    const nameParts = fullName ? fullName.trim().split(' ') : [];
    
    const firstName = meta.first_name || (nameParts.length > 0 ? nameParts[0] : '') || 'Agent';
    const lastName = meta.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || '';
    const displayAvatar = avatarUrl || meta.avatar_url || meta.picture || '';
    const initials = `${firstName[0] || 'A'}${lastName[0] || ''}`.toUpperCase();

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

                {/* Presenter Privacy Mode Toggle */}
                <button
                    type="button"
                    onClick={togglePresenterMode}
                    className={`w-full flex items-center justify-between px-4 py-2.5 mt-6 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isPresenterMode
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-800'
                            : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                    }`}
                    title="Mask internal AI scores & sales likelihood during client presentations"
                >
                    <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        Presenter Mode
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                        {isPresenterMode ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                        {isPresenterMode ? 'ON' : 'OFF'}
                    </span>
                </button>
            </div>


            {/* Bottom User Profile & Sign Out */}
            <div className="p-5 border-t border-black/5 bg-[#F3F4F4]/20">
                <div className="flex items-center justify-between gap-2">
                    <Link href="/account" title="View & Edit Agent Profile" className="flex items-center gap-3 cursor-pointer group hover:bg-white p-2 rounded-2xl transition-all border border-transparent hover:border-black/5 hover:shadow-sm flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white text-xs font-black">
                                {displayAvatar ? (
                                    <img
                                        src={displayAvatar}
                                        alt={`${firstName} ${lastName}`}
                                        className="w-full h-full object-cover grayscale-[0.1] transition-all group-hover:grayscale-0"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-[#2C2C2C] truncate group-hover:text-[#853953] transition-colors">
                                {firstName} {lastName}
                            </p>
                            <p className="text-[10px] font-bold text-[#853953] uppercase tracking-wider">Agent Profile</p>
                        </div>
                    </Link>

                    <form action="/auth/signout" method="POST">
                        <button
                            type="submit"
                            title="Log Out of Account"
                            className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 flex items-center justify-center cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
