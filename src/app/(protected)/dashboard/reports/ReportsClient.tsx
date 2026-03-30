'use client';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Home, Loader2, Award } from 'lucide-react';

type ReportItem = { id: string; name: string; group: string; leads: number; properties: number; deals: number };

export default function ReportsClient() {
    const [data, setData] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(d => { setData(d.data || []); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#853953] mb-4" />
            <p className="font-medium text-sm">Generating reports...</p>
        </div>
    );

    if (data.length === 0) return (
        <div className="text-center py-20 text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-700">No Location Data Yet</p>
            <p className="text-sm">Start assigning locations to leads and properties to see analytics.</p>
        </div>
    );

    const maxLeads = Math.max(...data.map(d => d.leads), 1);
    const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
    const totalProperties = data.reduce((sum, item) => sum + item.properties, 0);
    const totalDeals = data.reduce((sum, item) => sum + item.deals, 0);

    return (
        <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#853953]/10 flex items-center justify-center text-[#853953]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Leads w/ Location</p>
                        <p className="text-3xl font-black text-slate-900">{totalLeads}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Deals Won</p>
                        <p className="text-3xl font-black text-slate-900">{totalDeals}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#612D53]/10 flex items-center justify-center text-[#612D53]">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Listed Properties</p>
                        <p className="text-3xl font-black text-slate-900">{totalProperties}</p>
                    </div>
                </div>
            </div>

            {/* Main Location Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-900">Location Performance Analytics</h2>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">Location</th>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">Group</th>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-right">Leads</th>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-right">Properties</th>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 text-right">Deals Won</th>
                                    <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 w-1/4 pl-6">Demand Heat</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 font-bold text-slate-900 border-b border-slate-50">{row.name}</td>
                                        <td className="py-4 text-slate-500 font-medium border-b border-slate-50">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">{row.group}</span>
                                        </td>
                                        <td className="py-4 text-slate-700 font-bold text-right border-b border-slate-50">{row.leads}</td>
                                        <td className="py-4 text-slate-700 font-bold text-right border-b border-slate-50">{row.properties}</td>
                                        <td className="py-4 text-emerald-600 font-bold text-right border-b border-slate-50">{row.deals > 0 ? row.deals : '-'}</td>
                                        <td className="py-4 border-b border-slate-50 pl-6">
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-[#853953] to-[#612D53] rounded-full" 
                                                    style={{ width: `${Math.round((row.leads / maxLeads) * 100)}%` }} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
