'use client';
import { useState, useEffect } from 'react';
import { 
    Users, Phone, Mail, TrendingUp, DollarSign, Calendar, Loader2, Send, 
    CheckSquare, Presentation, Plus, Sparkles, ChevronDown, ChevronUp, 
    MapPin, BedDouble, FileText, CheckCircle2, MessageSquare
} from 'lucide-react';

type LeadMatch = {
    lead: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        phone: string; 
        email: string; 
        budgetMax: number | null; 
        moveTimeline: string | null; 
        pipelineStage: string;
        motivation?: string;
    };
    score: number;
    percent: number;
    matchReason: string;
    breakdown?: {
        budgetFit?: string;
        locationFit?: string;
        specsFit?: string;
        notesFit?: string;
    };
    pitchHook?: string;
};

export default function MatchingLeadsSection({ property }: { property: any }) {
    const [matches, setMatches] = useState<LeadMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [isSending, setIsSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetch(`/api/properties/${property.id}/matching-leads`)
            .then(r => r.json())
            .then(d => { 
                setMatches(d.matches || []); 
                setLoading(false); 
            })
            .catch(() => setLoading(false));
    }, [property.id]);

    const toggleSelect = (id: string) => {
        if (selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(l => l !== id));
        else setSelectedLeads([...selectedLeads, id]);
    };

    const toggleAll = () => {
        if (selectedLeads.length === matches.length) setSelectedLeads([]);
        else setSelectedLeads(matches.map(m => m.lead.id));
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#853953]/10 flex items-center justify-center text-[#853953] animate-pulse">
                    <Sparkles className="w-5 h-5 animate-spin" />
                </div>
                <p className="font-semibold text-slate-700">Analyzing Lead Notes & Multi-Factor Compatibility...</p>
                <p className="text-xs text-slate-400">Powered by Formative AI Engine</p>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Verified Matching Leads Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Only leads with a validated compatibility score of 50% or higher are displayed. Try adjusting property criteria or adding new buyers.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-extrabold text-slate-900">Matching Buyers</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#853953]/10 text-[#853953] border border-[#853953]/20">
                            {matches.length} Verified {matches.length === 1 ? 'Match' : 'Matches'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Ranked by budget fit, geographic proximity, bedroom specs, and AI notes alignment.
                    </p>
                </div>
                {selectedLeads.length > 0 && (
                    <button 
                        onClick={handleSendPitch} 
                        disabled={isSending} 
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all text-xs active:scale-95 disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Pitch to {selectedLeads.length} Selected {selectedLeads.length === 1 ? 'Lead' : 'Leads'}
                    </button>
                )}
            </div>

            {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 font-bold p-4 rounded-2xl text-sm border border-emerald-200 flex items-center gap-3 shadow-sm animate-fade-in">
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Matching Leads List */}
            <div className="space-y-3">
                {matches.map(({ lead, percent, matchReason, breakdown, pitchHook }) => {
                    const isExpanded = !!expandedIds[lead.id];
                    const isSelected = selectedLeads.includes(lead.id);

                    return (
                        <div 
                            key={lead.id} 
                            className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                                isSelected ? 'border-[#853953] ring-1 ring-[#853953]/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {/* Main Row */}
                            <div className="p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        onChange={() => toggleSelect(lead.id)} 
                                        className="w-4 h-4 rounded text-[#853953] focus:ring-[#853953] border-slate-300 cursor-pointer" 
                                    />
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#853953] to-[#612D53] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                        {lead.firstName?.[0] || 'L'}{lead.lastName?.[0] || ''}
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-900 text-sm truncate">
                                            {lead.firstName} {lead.lastName}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">
                                            {lead.pipelineStage || 'Active'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mt-0.5">
                                        {lead.email} {lead.phone ? `• ${lead.phone}` : ''}
                                    </div>
                                </div>

                                {/* Budget & Specs Pills */}
                                <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Budget Max</div>
                                        <div className="text-slate-900 font-extrabold">
                                            {lead.budgetMax ? `$${lead.budgetMax.toLocaleString()}` : 'Flexible'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Timeline</div>
                                        <div className="text-slate-700">
                                            {lead.moveTimeline || 'Standard'}
                                        </div>
                                    </div>
                                </div>

                                {/* Match Score & Expand Button */}
                                <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                                    <button 
                                        type="button"
                                        onClick={() => toggleExpand(lead.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                                            percent >= 80 
                                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' 
                                                : percent >= 60 
                                                ? 'bg-[#853953]/5 hover:bg-[#853953]/10 border-[#853953]/20 text-[#853953]' 
                                                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                                        }`}
                                        title="Click to view full scoring reasons and AI analysis"
                                    >
                                        <div className="flex items-center gap-1.5 font-black text-xs">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{percent}% Match</span>
                                        </div>
                                        <span className="text-[10px] font-bold underline opacity-80">
                                            {isExpanded ? 'Hide Reasons' : 'Reasons for scoring'}
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Action Links */}
                                    <div className="flex items-center gap-1">
                                        <a 
                                            href={`/engage?leadId=${lead.id}`} 
                                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-[#853953] rounded-lg transition-colors" 
                                            title="Draft Pitch in Engage"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </a>
                                        <a 
                                            href={`/leads?id=${lead.id}`} 
                                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors" 
                                            title="View Full Lead Profile"
                                        >
                                            <Presentation className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Reasons for this scoring Accordion */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/80 p-5 space-y-4 animate-fade-in">
                                    {/* AI Match Analysis Banner */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#853953]/10 via-[#612D53]/5 to-transparent border border-[#853953]/20">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Sparkles className="w-4 h-4 text-[#853953]" />
                                            <span className="text-xs font-black text-[#853953] uppercase tracking-wider">
                                                Formative AI Match Rationale
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                            "{matchReason}"
                                        </p>
                                    </div>

                                    {/* 4-Factor Breakdown Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">Budget Alignment</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium">
                                                {breakdown?.budgetFit || 'Fits buyer budget specification'}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                                <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">Location & Area</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium">
                                                {breakdown?.locationFit || 'Matches target geographical region'}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                                                <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">Bedrooms & Specs</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium">
                                                {breakdown?.specsFit || 'Matches requested bedroom count'}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="w-3.5 h-3.5 text-[#853953]" />
                                                <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">Notes & Amenities Analysis</span>
                                            </div>
                                            <p className="text-xs text-[#853953] font-semibold">
                                                {breakdown?.notesFit || '+0 pts - Neutral notes profile'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Pitch Hook Preview */}
                                    {pitchHook && (
                                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                    Suggested Outbound Pitch Hook (Auto-included in email)
                                                </span>
                                                <p className="text-xs text-slate-700 italic">
                                                    "{pitchHook}"
                                                </p>
                                            </div>
                                            <a 
                                                href={`/engage?leadId=${lead.id}`}
                                                className="px-3 py-1 bg-[#853953] hover:bg-[#612D53] text-white text-xs font-bold rounded-lg transition-all shrink-0"
                                            >
                                                Pitch Now
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
