'use client';

import React, { useState, useTransition } from 'react';
import { AgentProfile } from '@prisma/client';
import { updateEmailSettings } from '../actions';
import { User, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmailSettingsForm({ profile }: { profile: any }) {
    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(false);

    async function handleSave(formData: FormData) {
        setIsSaved(false);
        startTransition(async () => {
            try {
                await updateEmailSettings(formData);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } catch (err) {
                console.error(err);
            }
        });
    }

    return (
        <form action={handleSave} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">
                    Default Sender Info
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Fake Profile Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200">
                            <span className="font-semibold text-lg">
                                {(profile.emailFromName || 'A')[0].toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Email From Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="emailFromName"
                                    defaultValue={profile.emailFromName || ''}
                                    placeholder="e.g. Sarah Agent"
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Connected Gmail Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={profile.gmailEmailAddress || ''}
                                    readOnly
                                    placeholder="Not connected yet"
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            {!profile.gmailEmailAddress && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Connect your Gmail in the Account Settings.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Primary Email Tone
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            This subtly influences AI generation if enabled, and dictates your brand voice.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Warm & Trust', 'Friendly', 'Professional'].map((tone) => (
                        <label
                            key={tone}
                            className={`
                                relative border p-4 flex flex-col cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-indigo-500
                                ${profile.emailTone === tone ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}
                            `}
                        >
                            <input
                                type="radio"
                                name="emailTone"
                                value={tone}
                                defaultChecked={profile.emailTone === tone}
                                className="sr-only"
                            />
                            <span className="block text-sm font-medium text-slate-900">{tone}</span>
                            <span className="block text-xs text-slate-500 mt-1">
                                {tone === 'Warm & Trust' && 'Focuses on mutual goals and empathy.'}
                                {tone === 'Friendly' && 'Casual, approachable, and enthusiastic.'}
                                {tone === 'Professional' && 'Direct, clear, and business-focused.'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
                {isSaved ? (
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-600 font-medium"
                    >
                        Saved successfully!
                    </motion.p>
                ) : <div />}

                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
}
