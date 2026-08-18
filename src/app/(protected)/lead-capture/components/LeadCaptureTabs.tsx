'use client';

import { useState } from 'react';
import { FileText, Sliders, Zap, Shield, Sparkles, User, Building, Phone, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { CustomFieldsBuilder } from './CustomFieldsBuilder';
import { LeadCaptureEmailTemplates } from './LeadCaptureEmailTemplates';

interface LeadCaptureTabsProps {
    formConfig: any;
    agentProfile: any;
}

export function LeadCaptureTabs({ formConfig, agentProfile }: LeadCaptureTabsProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'fields' | 'emails'>('general');

    const tabs = [
        { id: 'general', label: '1. Form Basics & Currency', icon: FileText, desc: 'Title, currency (₦), and messages' },
        { id: 'fields', label: '2. Question & Field Builder', icon: Sliders, desc: 'Custom questions & locked scoring fields' },
        { id: 'emails', label: '3. AI Auto-Response & Email Templates', icon: Zap, desc: 'Auto-send toggle & Hot/Warm/Cold templates' }
    ];

    const agentName = agentProfile?.name || 'Your Name';
    const agentCompany = agentProfile?.company || 'Your Agency / Brokerage';
    const agentPhone = agentProfile?.phone || 'Your Phone';
    const agentImageUrl = agentProfile?.imageUrl || '';

    return (
        <div className="space-y-8">
            {/* Tab Navigation Buttons */}
            <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1.5 border border-slate-200">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                                isActive
                                    ? 'bg-white text-[#2C1E26] shadow-sm border border-black/5 scale-[1.01]'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#853953]' : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content 1: Form Basics & Currency */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    {/* Live Branding Preview Card */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-700 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black text-xl shrink-0 overflow-hidden border border-white/20">
                                    {agentImageUrl ? (
                                        <img src={agentImageUrl} alt={agentName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{agentName.slice(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#853953] text-white px-2 py-0.5 rounded-full">
                                            Live Form Header Branding
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-white truncate">{agentName}</h3>
                                    <p className="text-xs text-pink-200/80 font-medium truncate">{agentCompany} {agentPhone && `• ${agentPhone}`}</p>
                                </div>
                            </div>

                            <Link
                                href="/account"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition-colors shrink-0"
                            >
                                <span>Edit Profile Branding</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-3xl p-6 sm:p-8">
                        <div className="border-b border-slate-100 pb-5 mb-6">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#853953]" />
                                <span>Form Information & Currency Settings</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Set your form title, public currency denomination (including Nigerian Naira ₦), and greeting text.
                            </p>
                        </div>

                        <GeneralSettingsForm 
                            formId={formConfig.id}
                            title={formConfig.title}
                            description={formConfig.description || ''}
                            welcomeMessage={formConfig.welcomeMessage || ''}
                            successMessage={formConfig.successMessage || ''}
                            isActive={formConfig.isActive}
                            currencySymbol={formConfig.currencySymbol || '₦'}
                        />
                    </div>
                </div>
            )}

            {/* Tab Content 2: Field Schema Builder */}
            {activeTab === 'fields' && (
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-3xl overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-100">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-[#853953]" />
                            <span>Question & Field Configuration</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Core real estate scoring fields are automatically evaluated by AI. Add custom questions below.
                        </p>
                    </div>

                    {/* Core Locked Fields Notice */}
                    <div className="p-6 bg-slate-50/80 border-b border-slate-200">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                            <span className="flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-[#853953]" />
                                <span>Core AI Scoring Fields (Always Active)</span>
                            </span>
                            <span className="text-[10px] bg-[#853953]/10 text-[#853953] px-2.5 py-0.5 rounded-full font-black uppercase">
                                System Evaluated
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            These fields power the Formative sub-3s scoring algorithm (Intent, Readiness, Budget alignment):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['First & Last Name', 'Email Address', 'Phone / WhatsApp', 'Property Category', 'Budget Range (₦)', 'Move Timeline', 'Purchasing Readiness', 'Neighborhood Preferences'].map(f => (
                                <span key={f} className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 shadow-xs">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Custom Dynamic Fields */}
                    <div className="p-6 sm:p-8">
                        <CustomFieldsBuilder
                            formId={formConfig.id}
                            initialFieldsJson={formConfig.customFields || '[]'}
                        />
                    </div>
                </div>
            )}

            {/* Tab Content 3: AI Auto-Response & Email Templates */}
            {activeTab === 'emails' && (
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-3xl p-6 sm:p-8">
                    <div className="border-b border-slate-100 pb-5 mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#853953]" />
                            <span>Automated AI Email Response & Templates</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Configure automatic email dispatch and personalize what Hot, Warm, and Cold leads receive when they submit your form.
                        </p>
                    </div>

                    <LeadCaptureEmailTemplates
                        formId={formConfig.id}
                        autoSendFirstMessage={formConfig.autoSendFirstMessage}
                        initialAgentProfile={agentProfile}
                    />
                </div>
            )}
        </div>
    );
}
