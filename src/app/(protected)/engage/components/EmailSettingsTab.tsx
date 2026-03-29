'use client'

import React from 'react';
import { AgentProfile } from '@prisma/client';
import { 
    Mail, 
    ShieldCheck, 
    AtSign, 
    Type, 
    Check
} from 'lucide-react';

interface Props {
    profile: AgentProfile;
    onUpdate: (formData: FormData) => Promise<void>;
}

export function EmailSettingsTab({ profile, onUpdate }: Props) {
    return (
        <div className="max-w-2xl space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <AtSign className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Sender Identity</h3>
                </div>

                <form action={onUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Display Name</label>
                        <input 
                            name="emailFromName"
                            className="w-full h-11 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            defaultValue={profile.emailFromName || ''}
                            placeholder="e.g. Samuel from Formative"
                        />
                        <p className="text-xs text-slate-500 italic">This is the name recipients will see in their inbox.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Communication Tone</label>
                        <select 
                            name="emailTone"
                            className="w-full h-11 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            defaultValue={profile.emailTone || 'Warm & Trust'}
                        >
                            <option>Warm & Trust</option>
                            <option>Professional & Direct</option>
                            <option>Casual & Friendly</option>
                            <option>Urgent & Bold</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            Connected via Resend API
                        </div>
                        <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-stone-800 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Type className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Agent Signature</h3>
                </div>
                
                <textarea 
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Samuel\nFormative Properties\n+234 XXX XXX XXXX"
                    defaultValue={profile.signature || ''}
                />
                <p className="text-xs text-slate-500 mt-2">This signature will be appended to the bottom of your manual and automated emails.</p>
            </div>
        </div>
    );
}
