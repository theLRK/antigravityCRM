'use client';
import { useState, useEffect } from 'react';
import { Home, Send, TrendingUp, DollarSign, BedDouble, MapPin, ExternalLink, X, Loader2 } from 'lucide-react';

type Match = {
    property: { id: string; title: string; location: string; price: number; currency: string; bedrooms: number; bathrooms: number; propertyType: string; images: string };
    score: number;
    percent: number;
    matchReason: string;
};

function MatchBadge({ percent }: { percent: number }) {
    const cls = percent >= 80 ? 'bg-emerald-100 text-emerald-700' : percent >= 60 ? 'bg-blue-100 text-blue-700' : percent >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500';
    const label = percent >= 80 ? 'Strong' : percent >= 60 ? 'Good' : percent >= 40 ? 'Partial' : 'Low';
    return <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cls}`}>{percent}% {label}</span>;
}

export default function RecommendedPropertiesTab({ leadId, leadEmail, leadFirstName }: { leadId: string; leadEmail: string; leadFirstName: string }) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<string | null>(null);
    const [sent, setSent] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch(`/api/leads/${leadId}/recommended-properties`)
            .then(r => r.json())
            .then(d => { setMatches(d.matches || []); setLoading(false); });
    }, [leadId]);

    const sendProperty = async (match: Match) => {
        setSending(match.property.id);
        const subject = `Property recommendation: ${match.property.title}`;
        const body = `Hi ${leadFirstName},\n\nI found a property that matches your preferences.\n\n🏠 ${match.property.title}\n📍 ${match.property.location}\n💰 ${match.property.currency} ${match.property.price.toLocaleString()}\n🛏 ${match.property.bedrooms} bed / ${match.property.bathrooms} bath\n\nMatch Score: ${match.percent}% — ${match.matchReason}\n\nWould you like to schedule a viewing? Reply to this email or call me directly.\n\nBest regards,\nYour Agent`;

        await fetch(`/api/leads/${leadId}/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, templateUsed: 'property_recommendation' })
        });
        setSent(prev => new Set(prev).add(match.property.id));
        setSending(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Calculating matches...
        </div>
    );

    if (matches.length === 0) return (
        <div className="text-center py-12">
            <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No properties available to match</p>
            <p className="text-slate-400 text-sm mt-1">Add properties to the system to start matching</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 font-medium">Top property matches based on location, budget & bedrooms</p>
                <span className="text-xs font-bold text-slate-400">{matches.length} matches</span>
            </div>
            {matches.map(match => {
                const isSent = sent.has(match.property.id);
                const isSending = sending === match.property.id;
                let imgUrl = '';
                try { const imgs = JSON.parse(match.property.images); imgUrl = imgs[0] || ''; } catch {}
                return (
                    <div key={match.property.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-[#853953]/30 hover:shadow-sm transition-all">
                        {imgUrl ? (
                            <img src={imgUrl} alt={match.property.title} className="w-20 h-16 object-cover rounded-lg shrink-0" />
                        ) : (
                            <div className="w-20 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Home className="w-6 h-6 text-slate-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="font-bold text-slate-900 text-sm truncate">{match.property.title}</p>
                                <MatchBadge percent={match.percent} />
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium mb-2">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.property.location}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{match.property.currency} {match.property.price.toLocaleString()}</span>
                                <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{match.property.bedrooms} bed</span>
                            </div>
                            <p className="text-xs text-slate-400 italic mb-3 leading-relaxed">{match.matchReason}</p>
                            <button
                                onClick={() => sendProperty(match)}
                                disabled={isSent || isSending}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isSent ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-[#853953] hover:bg-[#853953]/90 text-white'}`}
                            >
                                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : isSent ? '✓ Sent' : <><Send className="w-3 h-3" /> Send to Lead</>}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
