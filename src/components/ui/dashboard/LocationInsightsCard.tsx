'use client';
import { useEffect, useState } from 'react';
import { MapPin, TrendingUp, Home, Users, Loader2 } from 'lucide-react';

type Insight = { id: string; name: string; group: string; leadCount: number; propertyCount: number; demandScore: number };

export default function LocationInsightsCard() {
    const [data, setData] = useState<{ insights: Insight[]; narrative: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/location-insights').then(r => r.json()).then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
    );

    const max = Math.max(...((data?.insights || []).map(i => i.leadCount) || [1]), 1);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Location Demand</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Month</span>
            </div>
            {data?.narrative && (
                <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.narrative }} />
            )}
            <div className="p-4 space-y-3">
                {(data?.insights || []).length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        No location data yet. Assign locations to leads & properties to see insights.
                    </div>
                ) : (
                    (data?.insights || []).map(item => (
                        <div key={item.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{item.group}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#853953]" />{item.leadCount}</span>
                                    <span className="flex items-center gap-1"><Home className="w-3 h-3 text-[#612D53]" />{item.propertyCount}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                                    style={{ width: `${Math.round((item.leadCount / max) * 100)}%` }} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
