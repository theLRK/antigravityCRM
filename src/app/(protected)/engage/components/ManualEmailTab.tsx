'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Send, 
    Search, 
    Building2, 
    User, 
    FileText,
    Eye,
    Sparkles,
    Variable,
    Calendar,
    Save,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadOption {
    lead_id: string;
    lead_name: string;
    lead_email: string;
    lead_score: number;
    preferred_location: string;
}

interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
}

interface Props {
    properties: any[];
    onSend: (data: any) => Promise<void>;
}

const PREDEFINED_TEMPLATES = [
    { name: 'General follow up', subject: 'Checking in on your property search', body: 'Hello {{lead_name}},\n\nI wanted to follow up and see how your search is going. Are there any new requirements or specific areas you are focusing on?\n\nBest regards,\n{{agent_name}}' },
    { name: 'Property suggestion', subject: 'Property in {{property_location}} you may like', body: 'Hello {{lead_name}},\n\nI thought you might be interested in this listing:\n\n{{property_title}}\n{{property_location}}\n{{property_price}}\n{{bedrooms}} Bed, {{bathrooms}} Bath\n\nLet me know if you would like to schedule a viewing.\n\nBest,\n{{agent_name}}' },
    { name: 'Checking in', subject: 'Quick check-in', body: 'Hi {{lead_name}},\n\nHope you are having a great week! Just wanted to see if you had any questions about the current market trends.\n\n{{agent_name}}' },
    { name: 'Viewing reminder', subject: 'Reminder: Viewing scheduled for tomorrow', body: 'Hello {{lead_name}},\n\nJust a friendly reminder about our viewing for {{property_title}} scheduled for tomorrow.\n\nSee you there!\n{{agent_name}}' },
    { name: 'Cold lead re-engagement', subject: 'Are you still looking for a home?', body: 'Hello {{lead_name}},\n\nIt has been a while since we last spoke. Are you still in the market for a property? We have some fresh listings that might interest you.\n\nBest,\n{{agent_name}}' },
];

import { 
    sendManualEmailAction, 
    scheduleManualEmailAction 
} from '../actions';

export function ManualEmailTab({ properties, onSend }: Props) {
    const [leads, setLeads] = useState<LeadOption[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedTemplateName, setSelectedTemplateName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showVariables, setShowVariables] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lRes, tRes] = await Promise.all([
                    fetch('/api/leads'),
                    fetch('/api/email-templates')
                ]);
                const lData = await lRes.json();
                const tData = await tRes.json();
                setLeads(lData);
                setTemplates(tData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const selectedLead = useMemo(() => leads.find(l => l.lead_id === selectedLeadId), [leads, selectedLeadId]);
    const selectedProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId), [properties, selectedPropertyId]);

    // Auto-suggest subject
    useEffect(() => {
        if (!subject && selectedLead) {
            if (selectedProperty) {
                setSubject(`Property in ${selectedProperty.location} you may like`);
            } else {
                setSubject(`Following up on your property search`);
            }
        }
    }, [selectedLead, selectedProperty, subject]);

    const handleTemplateChange = (name: string) => {
        setSelectedTemplateName(name);
        if (name === 'Write by yourself') {
            setSubject('');
            setMessage('');
            return;
        }
        const template = PREDEFINED_TEMPLATES.find(t => t.name === name) || templates.find(t => t.name === name);
        if (template) {
            setSubject(template.subject);
            setMessage(template.body);
        }
    };

    const insertVariable = (variable: string) => {
        setMessage(prev => prev + ` {{${variable}}}`);
        setShowVariables(false);
    };

    const renderResolvedText = (text: string) => {
        if (!text) return text;
        let resolved = text;
        resolved = resolved.replace(/{{lead_name}}/g, selectedLead?.lead_name || '[Lead Name]');
        resolved = resolved.replace(/{{lead_email}}/g, selectedLead?.lead_email || '[Lead Email]');
        resolved = resolved.replace(/{{lead_score}}/g, selectedLead?.lead_score?.toString() || '[Score]');
        resolved = resolved.replace(/{{property_title}}/g, selectedProperty?.title || '[Property Title]');
        resolved = resolved.replace(/{{property_location}}/g, selectedProperty?.location || '[Location]');
        resolved = resolved.replace(/{{property_price}}/g, selectedProperty ? `$${selectedProperty.price.toLocaleString()}` : '[Price]');
        resolved = resolved.replace(/{{bedrooms}}/g, selectedProperty?.bedrooms?.toString() || '[Beds]');
        resolved = resolved.replace(/{{bathrooms}}/g, selectedProperty?.bathrooms?.toString() || '[Baths]');
        resolved = resolved.replace(/{{agent_name}}/g, 'Samuel'); // Fallback or fetch from session
        resolved = resolved.replace(/{{agent_phone}}/g, '+234 XXX XXX XXXX');
        return resolved;
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLeadId || !subject || !message) return;
        
        setIsSending(true);
        setStatusMessage(null);
        try {
            const resolvedSubject = renderResolvedText(subject);
            const resolvedMessage = renderResolvedText(message);

            if (scheduleDate) {
                await scheduleManualEmailAction(selectedLeadId, resolvedSubject, resolvedMessage, scheduleDate);
                setStatusMessage({ type: 'success', text: `Email scheduled for ${new Date(scheduleDate).toLocaleString()}` });
            } else {
                await sendManualEmailAction(selectedLeadId, resolvedSubject, resolvedMessage, selectedPropertyId);
                setStatusMessage({ type: 'success', text: 'Email sent successfully!' });
            }

            setSubject('');
            setMessage('');
            setSelectedPropertyId('');
            setScheduleDate('');
            setSelectedTemplateName('');
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to process request. Please try again.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!subject || !message) return;
        const name = prompt('Enter a name for this template:');
        if (!name) return;

        try {
            const res = await fetch('/api/email-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject, body: message })
            });
            if (res.ok) {
                const newTemplate = await res.json();
                setTemplates(prev => [...prev, newTemplate]);
                alert('Template saved!');
            }
        } catch (error) {
            alert('Error saving template');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#853953]" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleSend} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Select Lead
                                </label>
                                <select 
                                    className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#853953]/20 outline-none"
                                    value={selectedLeadId}
                                    onChange={(e) => setSelectedLeadId(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a lead...</option>
                                    {leads.map(l => (
                                        <option key={l.lead_id} value={l.lead_id}>{l.lead_name} ({l.lead_email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Select Property (Optional)
                                </label>
                                <select 
                                    className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#853953]/20 outline-none"
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                >
                                    <option value="">No specific property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Email Type
                            </label>
                            <select 
                                className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#853953]/20 outline-none"
                                value={selectedTemplateName}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                            >
                                <option value="">Select a template...</option>
                                <optgroup label="System Templates">
                                    {PREDEFINED_TEMPLATES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </optgroup>
                                {templates.length > 0 && (
                                    <optgroup label="My Templates">
                                        {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </optgroup>
                                )}
                                <option value="Write by yourself">Write by yourself</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Subject
                            </label>
                            <input 
                                type="text"
                                className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#853953]/20 outline-none"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject..."
                                required
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Message
                                </label>
                                <div className="relative">
                                    <button 
                                        type="button"
                                        onClick={() => setShowVariables(!showVariables)}
                                        className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 transition-colors"
                                    >
                                        <Variable className="w-3 h-3" /> Insert Variable <ChevronDown className="w-3 h-3" />
                                    </button>
                                    {showVariables && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-48 overflow-hidden py-1">
                                            {['lead_name', 'lead_email', 'lead_score', 'property_title', 'property_price', 'bedrooms', 'bathrooms', 'agent_name', 'agent_phone'].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => insertVariable(v)}
                                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-600"
                                                >
                                                    {`{{${v}}}`}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <textarea 
                                className="w-full h-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#853953] outline-none resize-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                required
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    <input 
                                        type="datetime-local" 
                                        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveAsTemplate}
                                    className="flex items-center gap-1 text-slate-500 hover:text-[#853953] text-xs transition-colors"
                                >
                                    <Save className="w-3.5 h-3.5" /> Save as Template
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSending || !selectedLeadId}
                                    className="flex items-center gap-2 bg-[#853953] hover:bg-[#702f45] disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-sm"
                                >
                                    {scheduleDate ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    {isSending ? (scheduleDate ? 'Scheduling...' : 'Sending...') : (scheduleDate ? 'Schedule Email' : 'Send Message')}
                                </button>
                            </div>
                        </div>

                        {statusMessage && (
                            <div className={cn(
                                "p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300",
                                statusMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                            )}>
                                {statusMessage.text}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl shadow-[#853953]/10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6 text-[#853953]">
                        <Eye className="w-5 h-5" />
                        <h3 className="font-semibold text-white">Live Preview</h3>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        <div className="text-xs text-slate-500">Subject: <span className="text-slate-200">{renderResolvedText(subject) || '(No subject)'}</span></div>
                        <div className="h-px bg-slate-800" />
                        <div className="text-sm font-light text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {renderResolvedText(message) || 'Your email content will appear here...'}
                        </div>
                    </div>

                    {selectedLead && (
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 font-semibold">Selected Lead Info</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-slate-500">Name</div>
                                    <div className="text-xs">{selectedLead.lead_name}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500">Lead Score</div>
                                    <div className="text-xs text-[#612D53] font-bold">{selectedLead.lead_score}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-[10px] text-slate-500">Preferred Location</div>
                                    <div className="text-xs">{selectedLead.preferred_location}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
