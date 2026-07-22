'use client';

import { useEffect, useState } from 'react';
import { Activity, Mail, RefreshCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ActivityFeedClient() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/activity?limit=5');
            const data = await res.json();
            if (data.feed) {
                setEvents(data.feed);
            }
        } catch (error) {
            console.error("Failed to fetch activity feed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-6">
                <RefreshCw className="w-5 h-5 text-[#853953] animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative">
            <button 
                onClick={fetchActivity} 
                className="absolute -top-10 right-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Refresh Feed"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
            {events.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400 relative">
                        <Activity className="w-5 h-5 animate-pulse text-[#853953]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Awaiting Activity</h4>
                    <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
                        Live CRM events, outreach updates, and AI scoring events will stream here in real time.
                    </p>
                </motion.div>
            ) : (
                <>
                    <div className="space-y-4">
                        {events.map((evt, idx) => (
                            <div key={evt.id + '-' + idx} className="flex gap-3 text-sm relative group">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center z-10 
                                        ${evt.isError ? 'bg-red-50 text-red-500' : evt.type === 'email' ? 'bg-[#612D53]/10 text-[#612D53]' : 'bg-[#853953]/10 text-[#853953]'}`}>
                                        {evt.isError ? <TriangleAlert className="w-4 h-4" /> : evt.type === 'email' ? <Mail className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                    </div>
                                    <div className="w-px h-full bg-slate-100 -mt-2 absolute top-8 bottom-0 z-0 group-last:hidden"></div>
                                </div>
                                <div className="flex-1 pb-2 pt-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className={`font-bold capitalize truncate ${evt.isError ? 'text-red-700' : 'text-slate-900'}`}>
                                            {evt.title}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 whitespace-nowrap">
                                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate border-b border-transparent">
                                        {evt.lead && evt.leadId ? (
                                            <Link href={`/leads?drawer=${evt.leadId}`} className="font-semibold text-[#853953] hover:underline">
                                                {evt.lead}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{evt.lead}</span>
                                        )} 
                                        <span className="mx-1">•</span> 
                                        {evt.description ? (
                                            <span className="truncate italic" title={evt.description}>
                                                {evt.description.length > 40 ? evt.description.substring(0, 40) + '...' : evt.description}
                                            </span>
                                        ) : 'System event'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                        <Link href="/leads" className="text-xs font-bold text-[#853953] hover:text-[#612D53] uppercase tracking-wider">
                            View All Activity →
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
