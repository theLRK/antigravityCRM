'use client';

import React, { useState, useTransition, useRef } from 'react';
import { AgentProfile } from '@prisma/client';
import { updateEmailTemplate } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Save, AlertCircle } from 'lucide-react';

const TABS = [
    { id: 'hot', label: 'Hot Lead', icon: '🔥', color: '#FF6F61', bg: 'bg-[#FF6F61]/10', border: 'border-[#FF6F61]' },
    { id: 'warm', label: 'Warm Lead', icon: '🌞', color: '#FFC107', bg: 'bg-[#FFC107]/10', border: 'border-[#FFC107]' },
    { id: 'cold', label: 'Cold Lead', icon: '❄️', color: '#4FC3F7', bg: 'bg-[#4FC3F7]/10', border: 'border-[#4FC3F7]' }
];

const VARIABLES = [
    { tag: '{{first_name}}', desc: "Lead's first name" },
    { tag: '{{timeline}}', desc: "Move timeline" },
    { tag: '{{budget_range}}', desc: "Declared budget" },
    { tag: '{{financing_status}}', desc: "Pre-approval status" },
    { tag: '{{suggested_action}}', desc: "AI recommended next step" },
    { tag: '{{agent_name}}', desc: "Your full name" },
    { tag: '{{agent_phone}}', desc: "Your phone number" },
    { tag: '{{agent_company}}', desc: "Your company/brokerage" },
    { tag: '{{agent_signature}}', desc: "Your configured signature" },
    { tag: '{{agent_website}}', desc: "Your listed website" }
];

export function EmailTemplatesForm({ profile }: { profile: any }) {
    const [activeTab, setActiveTab] = useState<'hot' | 'warm' | 'cold'>('hot');
    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Track localized edits before saving to DB
    const [templates, setTemplates] = useState({
        hot: { subject: profile.emailTemplateHotSubject || '', body: profile.emailTemplateHotBody || '' },
        warm: { subject: profile.emailTemplateWarmSubject || '', body: profile.emailTemplateWarmBody || '' },
        cold: { subject: profile.emailTemplateColdSubject || '', body: profile.emailTemplateColdBody || '' },
    });

    const [shake, setShake] = useState(false);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    function handleSave() {
        const currentData = templates[activeTab];
        if (!currentData.subject.trim() || !currentData.body.trim()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setIsSaved(false);
        startTransition(async () => {
            try {
                await updateEmailTemplate(activeTab, currentData.subject, currentData.body);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } catch (err) {
                console.error(err);
            }
        });
    }

    function insertVariable(tag: string) {
        if (!bodyRef.current) return;
        const cursor = bodyRef.current.selectionStart;
        const text = templates[activeTab].body;
        const newBody = text.slice(0, cursor) + tag + text.slice(cursor);

        setTemplates(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], body: newBody }
        }));

        setIsDropdownOpen(false);
        // refocus
        setTimeout(() => {
            bodyRef.current?.focus();
            bodyRef.current?.setSelectionRange(cursor + tag.length, cursor + tag.length);
        }, 10);
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setIsSaved(false); }}
                        style={{
                            color: activeTab === tab.id ? tab.color : '',
                        }}
                        className={`
                            px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors relative
                            ${activeTab === tab.id
                                ? `${tab.bg} border-t border-l border-r ${tab.border}`
                                : 'text-slate-500 hover:bg-slate-50'
                            }
                        `}
                    >
                        <span>{tab.icon}</span> {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute -bottom-[1px] left-0 right-0 h-[2px]"
                                style={{ backgroundColor: tab.color }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0, x: shake ? [-5, 5, -5, 5, 0] : 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col space-y-4"
                >
                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Subject Line</label>
                        <input
                            type="text"
                            value={templates[activeTab].subject}
                            onChange={(e) => setTemplates(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], subject: e.target.value } }))}
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        />
                    </div>

                    {/* Toolbar & Body */}
                    <div className="flex-1 flex flex-col border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 text-slate-700"
                                >
                                    <span className="text-indigo-600 font-bold">&#123;&#123;</span> Insert Variable <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-10 py-1"
                                        >
                                            {VARIABLES.map((v) => (
                                                <button
                                                    key={v.tag}
                                                    onClick={() => insertVariable(v.tag)}
                                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex flex-col group"
                                                >
                                                    <span className="font-mono text-indigo-600 text-xs">{v.tag}</span>
                                                    <span className="text-slate-500 text-xs">{v.desc}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <textarea
                            ref={bodyRef}
                            value={templates[activeTab].body}
                            onChange={(e) => setTemplates(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], body: e.target.value } }))}
                            className="flex-1 w-full p-4 text-sm bg-white resize-none outline-none"
                            placeholder="Write your email body here..."
                            rows={10}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            {isSaved ? (
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                    <Save className="w-4 h-4" /> Saved!
                                </span>
                            ) : shake ? (
                                <span className="text-sm font-medium text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> Fields cannot be empty.
                                </span>
                            ) : <div />}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
