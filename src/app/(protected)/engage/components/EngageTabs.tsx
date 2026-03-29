'use client'

import React, { useState } from 'react';
import { 
    Clock, 
    Mail, 
    History, 
    Calendar, 
    Settings, 
    Send,
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
}

const tabs: Tab[] = [
    { id: 'follow-ups', label: 'Follow Ups', icon: Clock },
    { id: 'manual', label: 'Manual Email', icon: Send },
    { id: 'history', label: 'Email History', icon: History },
    { id: 'scheduled', label: 'Scheduled', icon: MousePointer2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
];

interface Props {
    content: Record<string, React.ReactNode>;
    initialTab?: string;
}

export function EngageTabs({ content, initialTab = 'follow-ups' }: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap",
                                isActive 
                                    ? "bg-[#853953] text-white shadow-lg shadow-[#853953]/20 ring-1 ring-[#853953]" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[500px]">
                {content[activeTab]}
            </div>
        </div>
    );
}
