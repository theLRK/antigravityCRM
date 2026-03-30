'use client';
import { useState, useEffect } from 'react';
import { Users, Phone, Mail, TrendingUp, DollarSign, Calendar, Loader2, Send, CheckSquare, Presentation, Plus } from 'lucide-react';

type LeadMatch = {
    lead: { id: string; firstName: string; lastName: string; phone: string; email: string; budgetMax: number | null; moveTimeline: string | null; pipelineStage: string };
    score: number;
    percent: number;
    matchReason: string;
};

export default function MatchingLeadsSection({ property }: { property: any }) {
    const [matches, setMatches] = useState<LeadMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetch(`/api/properties/${property.id}/matching-leads`)
            .then(r => r.json())
            .then(d => { setMatches(d.matches || []); setLoading(false); });
    }, [property.id]);

    const toggleSelect = (id: string) => {
        if (selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(l => l !== id));
        else setSelectedLeads([...selectedLeads, id]);
    };

    const toggleAll = () => {
        if (selectedLeads.length === matches.length) setSelectedLeads([]);
        else setSelectedLeads(matches.map(m => m.lead.id));
    };

    const handleSendPitch = async () => {
        if (selectedLeads.length === 0) return alert("Select at least one lead.");
        setIsSending(true);
        try {
            const res = await fetch(`/api/properties/${property.id}/send-pitch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds: selectedLeads })
            });
            if (!res.ok) throw new Error("Failed");
            setSuccessMsg(`Successfully sent property pitch to ${selectedLeads.length} leads. Tasks created.`);
            setSelectedLeads([]);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            alert("Error sending pitch.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <div className="flex items-center gap-2 py-6 text-slate-400 text-sm justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Fetching latest matches...</div>;
    if (matches.length === 0) return <div className="text-center py-10 text-slate-400 text-sm"><Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />No leads match this property.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b-2 border-[#853953] pb-1 inline-block">Matching Buyers</h3>
                    <p className="text-slate-500 text-sm mt-1">{matches.length} leads algorithmically match {property.title}'s criteria.</p>
                </div>
                {selectedLeads.length > 0 && (
                    <button onClick={handleSendPitch} disabled={isSending} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm shadow-emerald-600/20 transition-all text-sm">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Property To {selectedLeads.length} Leads
                    </button>
                )}
            </div>

            {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 font-bold p-4 rounded-xl text-sm border border-emerald-100 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" /> {successMsg}
                </div>
            )}

            <div className="bg-white border text-sm border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <input type="checkbox" checked={selectedLeads.length === matches.length && matches.length > 0} onChange={toggleAll} className="w-4 h-4 rounded text-[#853953] focus:ring-[#853953] border-slate-300 cursor-pointer" />
                            </th>
                            <th className="p-4">Lead Name</th>
                            <th className="p-4">Budget Max</th>
                            <th className="p-4">Timeline</th>
                            <th className="p-4">Match %</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium pb-2 text-slate-700">
                        {matches.map(({ lead, percent }) => (
                            <tr key={lead.id} className={`hover:bg-slate-50 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-[#853953]/5' : ''}`}>
                                <td className="p-4 text-center">
                                    <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-4 h-4 rounded text-[#853953] focus:ring-[#853953] border-slate-300 cursor-pointer" />
                                </td>
                                <td className="p-4">
                                    <div className="font-extrabold text-slate-900">{lead.firstName} {lead.lastName}</div>
                                    <div className="text-xs text-slate-400 font-normal">{lead.email}</div>
                                </td>
                                <td className="p-4 font-bold text-slate-600">
                                    {lead.budgetMax ? `$${lead.budgetMax.toLocaleString()}` : <span className="text-slate-300 italic">Unspecified</span>}
                                </td>
                                <td className="p-4">
                                    {lead.moveTimeline ? <span className="flex items-center gap-1.5 opacity-80"><Calendar className="w-3.5 h-3.5" /> {lead.moveTimeline}</span> : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${percent >= 80 ? 'bg-emerald-100 text-emerald-700' : percent >= 60 ? 'bg-[#853953]/10 text-[#853953]' : 'bg-amber-100 text-amber-700'}`}>
                                        {percent}%
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href={`/leads?id=${lead.id}`} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-[#853953] rounded-lg group transition-colors" title="View Lead Profile">
                                            <Presentation className="w-4 h-4" />
                                        </a>
                                        <a href={`/engage?leadId=${lead.id}`} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-amber-600 rounded-lg group transition-colors" title="Draft Email in Engage">
                                            <Mail className="w-4 h-4" />
                                        </a>
                                        <button 
                                            onClick={async () => {
                                                const title = prompt("Enter task title:", `Follow up with ${lead.firstName} re: ${property.title}`);
                                                if (!title) return;
                                                const res = await fetch('/api/tasks', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        leadId: lead.id,
                                                        propertyId: property.id,
                                                        title: title,
                                                        taskType: 'Follow Up',
                                                        dueDate: new Date(Date.now() + 86400000).toISOString(),
                                                        status: 'pending'
                                                    })
                                                });
                                                if (res.ok) alert("Task created successfully!");
                                            }}
                                            title="Create Task" 
                                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-[#853953] rounded-lg group transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
