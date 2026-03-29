'use client';

import React, { useState, useTransition } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TestEmailPanel({ sendAction, initialLead }: { sendAction: any, initialLead?: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    function handleSendTest() {
        setStatus('idle');
        startTransition(async () => {
            try {
                // If we have an initialLead, we use the sendAction with the lead ID mode
                const res = await sendAction('warm', initialLead?.id);
                if (res.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }

                setTimeout(() => setStatus('idle'), 4000);
            } catch (err) {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        });
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500">
                {initialLead 
                    ? `Drafting immediate follow-up for ${initialLead.firstName} ${initialLead.lastName} (${initialLead.email})`
                    : 'Send a sample email to your connected Gmail address to see how variables look when resolved.'
                }
            </p>

            <button
                onClick={handleSendTest}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-purple-200 text-sm font-medium rounded-lg shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
            >
                {isPending ? 'Sending...' : (
                    <>
                        <Send className="w-4 h-4" /> {initialLead ? `Send Property Details to ${initialLead.firstName}` : 'Send Test Email'}
                    </>
                )}
            </button>

            <AnimatePresence>
                {status !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`text-sm font-medium flex items-center gap-2 p-3 rounded-lg border ${status === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                    >
                        {status === 'success' ? (
                            <><CheckCircle2 className="w-4 h-4" /> Test email sent!</>
                        ) : (
                            <><AlertCircle className="w-4 h-4" /> Something went wrong</>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
