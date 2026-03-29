'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, X } from 'lucide-react';
import Link from 'next/link';

export function ShareLinkBox({ publicId }: { publicId: string }) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    // Get the base domain (using localhost for dev, production URL if available)
    const baseUrl = origin || 'https://formative.app';

    const fullUrl = `${baseUrl}/f/${publicId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text", err);
        }
    };

    return (
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6 relative">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Public URL Link</h3>

            <div className="mt-2 flex rounded-md shadow-sm">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <input
                        type="text"
                        readOnly
                        value={fullUrl}
                        className="block w-full rounded-none rounded-l-md border-0 py-1.5 text-slate-500 bg-slate-50 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 bg-white shadow-sm transition-colors w-[110px] justify-center"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 text-slate-400" />
                            <span>Copy Link</span>
                        </>
                    )}
                </button>
            </div>

            <button
                onClick={() => setShowQr(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
                <QrCode className="w-4 h-4" />
                Generate QR Code
            </button>

            {/* QR Code Modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Scan to Open Form</h3>
                            <button
                                onClick={() => setShowQr(false)}
                                className="text-slate-400 hover:text-slate-500 focus:outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center bg-slate-50">
                            <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-slate-200">
                                <QRCodeSVG
                                    value={fullUrl}
                                    size={200}
                                    bgColor={"#ffffff"}
                                    fgColor={"#0f172a"}
                                    level={"Q"}
                                    includeMargin={false}
                                />
                            </div>
                            <p className="mt-6 text-sm text-center text-slate-500">
                                Point your camera at this code to load the Lead Capture form on mobile.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowQr(false)}
                                className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
