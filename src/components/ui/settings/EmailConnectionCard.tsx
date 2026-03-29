'use client';

import { useState } from 'react';
import {
    Mail, Eye, EyeOff, CheckCircle, AlertCircle,
    Loader2, Save, Send, Trash2, Info
} from 'lucide-react';
import { saveEmailCredentials, disconnectGmail } from '@/app/(protected)/settings/actions';

interface Props {
    userId: string;
    initialEmail: string;
    initialFromName: string;
    initialConnected: boolean;
    emailsSentToday: number;
    lastEmailSent: string | null;
}

export default function EmailConnectionCard({
    userId,
    initialEmail,
    initialFromName,
    initialConnected,
    emailsSentToday,
    lastEmailSent
}: Props) {
    const [email, setEmail] = useState(initialEmail);
    const [fromName, setFromName] = useState(initialFromName);
    const [appPassword, setAppPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isConnected, setIsConnected] = useState(initialConnected);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async () => {
        if (!email || !appPassword) {
            showToast('Please enter both your Gmail address and App Password.', 'error');
            return;
        }
        if (!email.toLowerCase().endsWith('@gmail.com') && !email.includes('@googlemail.com')) {
            showToast('Please enter a valid Gmail address.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveEmailCredentials({ email, appPassword, fromName });
            if (result.success) {
                setIsConnected(true);
                setAppPassword(''); // Clear password from UI after saving
                showToast(`✓ Email account saved. Emails will send from ${email}`, 'success');
            } else {
                showToast('Failed to save: ' + result.error, 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestEmail = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await fetch('http://localhost:4000/api/auth/gmail/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: userId })
            });
            const data = await res.json();
            setTestResult(data);
        } catch {
            setTestResult({ success: false, message: 'Could not reach the backend. Make sure the server is running.' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect your email account? Automated lead emails will stop until you reconnect.')) return;
        setIsDisconnecting(true);
        try {
            const result = await disconnectGmail();
            if (result.success) {
                setIsConnected(false);
                setEmail('');
                setFromName('');
                showToast('Email account disconnected.', 'success');
            } else {
                showToast('Failed to disconnect: ' + result.error, 'error');
            }
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="relative space-y-5">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Status Banner */}
            {!isConnected && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">No email account connected</p>
                        <p className="text-xs text-amber-700 mt-0.5">Fill in your Gmail details below to enable automated lead emails.</p>
                    </div>
                </div>
            )}

            {/* Connection Status Card */}
            {isConnected && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)]" />
                        <div>
                            <p className="text-sm font-bold text-emerald-900">{initialEmail || email}</p>
                            <p className="text-xs text-emerald-700">Connected — automated lead emails are active</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300">
                        Active
                    </span>
                </div>
            )}

            {/* Credential Form */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Email Sending Account</h3>
                        <p className="text-xs text-slate-500">Enter your Gmail address and App Password. You can change this at any time.</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Sender Display Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Sender Display Name
                        </label>
                        <input
                            type="text"
                            value={fromName}
                            onChange={e => setFromName(e.target.value)}
                            placeholder="e.g. John Smith — Formative Realty"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">This is what leads will see as the "From" name in their inbox.</p>
                    </div>

                    {/* Gmail Address */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Gmail Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@gmail.com"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* App Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Gmail App Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={appPassword}
                                onChange={e => setAppPassword(e.target.value)}
                                placeholder={isConnected ? '••••••••••••••••  (leave blank to keep current)' : 'xxxx xxxx xxxx xxxx'}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* How-to guide */}
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-700 space-y-0.5">
                                <p className="font-semibold">How to get your Gmail App Password:</p>
                                <ol className="list-decimal ml-3 space-y-0.5">
                                    <li>Go to <a href="https://myaccount.google.com/security" target="_blank" className="underline font-medium">myaccount.google.com/security</a></li>
                                    <li>Enable <strong>2-Step Verification</strong> if not already on</li>
                                    <li>Search for <strong>"App Passwords"</strong> in the search bar</li>
                                    <li>Create a new app password → select "Mail"</li>
                                    <li>Copy the 16-character code and paste it above</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !email}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save & Connect</>}
                        </button>

                        {isConnected && (
                            <>
                                <button
                                    onClick={handleTestEmail}
                                    disabled={isTesting}
                                    className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ring-1 ring-emerald-200"
                                >
                                    {isTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Test Email</>}
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={isDisconnecting}
                                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Disconnect
                                </button>
                            </>
                        )}
                    </div>

                    {/* Test Email Result */}
                    {testResult && (
                        <div className={`text-xs px-4 py-3 rounded-xl ${testResult.success ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                            {testResult.success ? '✓ ' : '✗ '}{testResult.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Emails Sent Today</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{emailsSentToday}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Last Email Sent</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                        {lastEmailSent
                            ? new Date(lastEmailSent).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
