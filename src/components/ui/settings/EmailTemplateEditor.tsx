"use client";

import { useState } from 'react';
import { Mail, KeyRound, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { saveGmailCredentials } from '@/app/(protected)/settings/actions';

export default function EmailTemplateEditor({ initialConnected = false, initialCredentials = null }: any) {
    const [isConnected, setIsConnected] = useState(initialConnected);
    const [showConfig, setShowConfig] = useState(false);
    // Credentials state
    const [credentials, setCredentials] = useState({
        email: initialCredentials?.email || '',
        clientId: initialCredentials?.clientId || '',
        clientSecret: initialCredentials?.clientSecret || '',
        refreshToken: initialCredentials?.refreshToken || ''
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleConnect = async () => {
        setIsSaving(true);
        try {
            const res = await saveGmailCredentials(credentials);
            if (res.success) {
                setIsConnected(true);
                setShowConfig(false);
            } else {
                alert("Failed to save: " + res.error);
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-8 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl sm:rounded-2xl border-t-4 border-t-[#853953]">
            <div className="px-4 py-6 sm:p-8">
                <div>
                    <h2 className="text-xl font-semibold leading-7 text-slate-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#853953]" />
                        Automated Welcome Email
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Send an immediate, personalized email directly from your own Gmail account as soon as a lead is scored.
                    </p>

                    {/* Google Auth Status & Config */}
                    <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowConfig(!showConfig)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${isConnected ? 'bg-[#853953]/10 text-[#853953]' : 'bg-slate-200 text-slate-500'}`}>
                                    G
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        Gmail Integration
                                        {isConnected && <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Active</span>}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {isConnected ? "Connected successfully. Emails send from your address." : "Requires OAuth 2.0 Credentials to send on your behalf."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsConnected(false); setShowConfig(true); }}
                                        className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <div className="text-[#853953] font-semibold text-sm flex items-center gap-1">
                                        Configure {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expandable Configuration Form */}
                        {showConfig && !isConnected && (
                            <div className="mt-6 pt-6 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2 mb-4 text-slate-800">
                                    <KeyRound className="w-4 h-4 text-slate-500" />
                                    <h4 className="font-semibold text-sm">OAuth 2.0 Credentials</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold tracking-wide text-slate-600 uppercase mb-1.5">Gmail Address</label>
                                        <input
                                            type="email"
                                            placeholder="agent@example.com"
                                            value={credentials.email}
                                            onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                            className="w-full rounded-lg border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-[#853953]/20 sm:text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold tracking-wide text-slate-600 uppercase mb-1.5">Client ID</label>
                                        <input
                                            type="text"
                                            placeholder="xxx-yyy.apps.googleusercontent.com"
                                            value={credentials.clientId}
                                            onChange={e => setCredentials({ ...credentials, clientId: e.target.value })}
                                            className="w-full rounded-lg border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-[#853953]/50 sm:text-sm font-mono text-xs"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold tracking-wide text-slate-600 uppercase mb-1.5">Client Secret</label>
                                        <input
                                            type="password"
                                            placeholder="GOCSPX-xxxx"
                                            value={credentials.clientSecret}
                                            onChange={e => setCredentials({ ...credentials, clientSecret: e.target.value })}
                                            className="w-full rounded-lg border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-[#853953]/50 sm:text-sm font-mono text-xs"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold tracking-wide text-slate-600 uppercase mb-1.5">Refresh Token</label>
                                        <input
                                            type="password"
                                            placeholder="1//0eX..."
                                            value={credentials.refreshToken}
                                            onChange={e => setCredentials({ ...credentials, refreshToken: e.target.value })}
                                            className="w-full rounded-lg border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-[#853953]/50 sm:text-sm font-mono text-xs"
                                        />
                                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                            To obtain these keys, create a project in the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-[#853953] hover:underline">Google Cloud Console</a>, enable the Gmail API, and authorize it using the <code>https://mail.google.com/</code> scope.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleConnect(); }}
                                        disabled={isSaving}
                                        className="px-5 py-2.5 bg-[#853953] text-white rounded-lg shadow-sm text-sm font-bold hover:bg-[#853953]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Save Credentials & Connect
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
