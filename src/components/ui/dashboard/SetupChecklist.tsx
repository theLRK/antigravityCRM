'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SetupStep {
    id: string;
    title: string;
    description: string;
    done: boolean;
    href: string;
    cta: string;
}

export default function SetupChecklist({ steps }: { steps: SetupStep[] }) {
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const completedCount = steps.filter(s => s.done).length;
    const allDone = completedCount === steps.length;

    // Don't render if all items are done and checklist was dismissed
    if (dismissed || allDone) return null;

    const progressPct = Math.round((completedCount / steps.length) * 100);

    return (
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-purple-900">
                                {completedCount === 0
                                    ? '🚀 Get started with Formative CRM'
                                    : `${completedCount} of ${steps.length} setup steps complete`}
                            </span>
                            {completedCount > 0 && (
                                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                    {progressPct}%
                                </span>
                            )}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1.5 w-64 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); setDismissed(true); }}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
                </div>
            </div>

            {/* Steps list */}
            {expanded && (
                <div className="border-t border-purple-200 divide-y divide-purple-100">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-4 px-6 py-4 ${step.done ? 'opacity-60' : ''}`}
                        >
                            {step.done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <Circle className="w-5 h-5 text-purple-300 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${step.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                            </div>
                            {!step.done && (
                                <Link
                                    href={step.href}
                                    className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                                >
                                    {step.cta} <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
