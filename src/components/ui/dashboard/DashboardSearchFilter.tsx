'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, MapPin, Sparkles, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SearchResult {
    id: string;
    type: 'lead' | 'property';
    title: string;
    subtitle?: string;
    tag?: string;
    href: string;
}

export default function DashboardSearchFilter() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 300ms Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    // Fetch matching data on debounced query change
    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/leads?query=${encodeURIComponent(debouncedQuery)}&take=5`);
                const data = await res.json();
                
                if (isMounted) {
                    const formattedLeads: SearchResult[] = (data.leads || []).map((l: any) => ({
                        id: l.id,
                        type: 'lead' as const,
                        title: `${l.firstName} ${l.lastName}`,
                        subtitle: l.email || l.phone || l.preferredAreas || 'Lead Profile',
                        tag: `${l.scores?.[0]?.finalScore || 50} pts`,
                        href: `/leads`
                    }));

                    setResults(formattedLeads);
                }
            } catch (err) {
                console.error('Search error:', err);
                if (isMounted) setResults([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchResults();

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClear = () => {
        setQuery('');
        setDebouncedQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-lg">
            {/* Search Input Box */}
            <div className="relative flex items-center group">
                <Search className="w-4 h-4 absolute left-4 text-slate-400 group-focus-within:text-[#853953] transition-colors pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search leads, locations, or properties..."
                    className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953] outline-none shadow-2xs transition-all"
                />

                {/* Right Indicator (Loading / Clear) */}
                <div className="absolute right-3.5 flex items-center">
                    {isLoading ? (
                        <LoadingSpinner size={18} color="#853953" />
                    ) : query ? (
                        <button
                            onClick={handleClear}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                            title="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Results Dropdown Overlay */}
            {isOpen && query.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Search Results for &ldquo;{query}&rdquo;
                        </span>
                        {!isLoading && (
                            <span className="text-[10px] font-bold text-slate-400">
                                {results.length} found
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2">
                            <LoadingSpinner size={32} color="#853953" />
                            <p className="text-xs font-bold text-slate-500">Searching records...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {results.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-[#853953]/10 text-[#853953] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {item.type === 'lead' ? <User className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#853953] transition-colors">
                                                    {item.title}
                                                </h4>
                                                {item.tag && (
                                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                        {item.tag}
                                                    </span>
                                                )}
                                            </div>
                                            {item.subtitle && (
                                                <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#853953] group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                            <div className="p-2.5 bg-slate-50/50 text-center border-t border-slate-100">
                                <Link
                                    href="/leads"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-bold text-[#853953] hover:underline"
                                >
                                    View all matching in Leads table →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 px-4 text-center">
                            <p className="text-xs font-bold text-slate-700 mb-1">No matching records found</p>
                            <p className="text-[11px] text-slate-400">
                                Try searching by a different name, email, or target area.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
