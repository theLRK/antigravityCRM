'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Bell, X, CheckCheck, UserPlus, MailOpen, Clock, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const TYPE_CONFIG: Record<string, { icon: ReactNode; color: string; bg: string }> = {
    new_lead:         { icon: <UserPlus className="w-4 h-4" />,  color: 'text-[#853953]', bg: 'bg-[#853953]/5' },
    lead_reply:       { icon: <MailOpen className="w-4 h-4" />,  color: 'text-[#612D53]', bg: 'bg-[#612D53]/5' },
    follow_up_overdue: { icon: <Clock className="w-4 h-4" />,    color: 'text-amber-600',  bg: 'bg-amber-50' },
    high_intent:      { icon: <Sparkles className="w-4 h-4" />,  color: 'text-green-600',  bg: 'bg-green-50' },
};

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications?limit=15');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch {}
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {}
    };

    const markRead = async (id: string) => {
        try {
            await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {}
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative text-slate-400 hover:text-slate-600 p-2 transition-colors rounded-lg hover:bg-slate-100"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && <p className="text-xs text-slate-400 font-medium">{unreadCount} unread</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#853953] font-bold hover:text-[#612D53] px-2 py-1 rounded-lg hover:bg-[#853953]/5 transition-colors">
                                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-500">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-1">You'll be notified of key CRM events here.</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG['new_lead'];
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => markRead(notif.id)}
                                        className={`flex gap-3 px-5 py-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-[#853953]/5' : ''}`}
                                    >
                                        <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {!notif.read && <div className="w-2 h-2 rounded-full bg-[#853953] mt-1.5" />}
                                            {notif.leadId && (
                                                <Link href={`/leads?drawer=${notif.leadId}`} onClick={e => e.stopPropagation()} className="text-slate-300 hover:text-[#853953] transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
