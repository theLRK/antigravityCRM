"use client";

import { useState } from 'react';
import { syncWebsiteContent } from '@/app/(protected)/settings/actions';
import { Globe, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WebsiteIntegration({ initialUrl }: { initialUrl?: string }) {
    const [url, setUrl] = useState(initialUrl || '');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        if (!url) return;
        setIsLoading(true);
        setStatus('idle');

        try {
            const res = await syncWebsiteContent(url);
            if (res.success) {
                setStatus('success');
                setMessage(res.message || "Website synced!");
            } else {
                setStatus('error');
                setMessage(res.error || "Failed to sync.");
            }
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl sm:rounded-2xl border-t-4 border-t-[#853953]">
            <div className="px-4 py-6 sm:p-8">
                <div>
                    <h2 className="text-xl font-semibold leading-7 text-slate-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#853953]" />
                        Website Integration
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Connect your real estate website so Formative AI can ingest your existing listings, branding, and biography to deeply personalize your automated follow-ups.
                    </p>
                    <div className="mt-6 flex max-w-md gap-x-4">
                        <label htmlFor="website-url" className="sr-only">Website URL</label>
                        <input
                            id="website-url"
                            name="website"
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.your-real-estate-site.com"
                            className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#853953]/20 sm:text-sm sm:leading-6"
                        />
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={isLoading}
                            className="flex-none flex items-center gap-2 rounded-md bg-[#853953] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#853953]/90 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Sync Website"}
                        </button>
                    </div>
                    {status === 'success' && (
                        <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> {message}
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="mt-3 text-sm text-red-600 font-medium">
                            {message}
                        </p>
                    )}
                    {status === 'idle' && (
                        <p className="mt-3 text-xs text-slate-500">
                            Our AI will crawl your public pages to learn your tone of voice and active market areas.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
