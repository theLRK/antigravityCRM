import React from 'react';

export function FormativeLogo({ className = "" }: { className?: string }) {
    // Constructed from the provided visual: three interlocking geometric rounded squares
    // Colors: indigo/purple (#4f46e5 / #7e22ce), cyan (#06b6d4), and slate grey (#64748b)
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width="48"
                height="48"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 drop-shadow-sm"
            >
                {/* Secondary Deep Maroon interlocking square */}
                <path
                    d="M60 40 L80 60 C85 65, 85 75, 80 80 L70 90 C65 95, 55 95, 50 90 L30 70"
                    stroke="#612D53"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />
                {/* Subtle Slate interlocking square */}
                <path
                    d="M40 30 L60 10 C65 5, 75 5, 80 10 L90 20 C95 25, 95 35, 90 40 L70 60"
                    stroke="#853953"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                />
                {/* Primary Maroon Main interlocking square */}
                <path
                    d="M10 50 L30 30 C35 25, 45 25, 50 30 L70 50 C75 55, 75 65, 70 70 L50 90 C45 95, 35 95, 30 90 L10 70 C5 65, 5 55, 10 50 Z"
                    stroke="url(#maroonGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <defs>
                    <linearGradient id="maroonGradient" x1="10" y1="30" x2="70" y2="90" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#853953" />
                        <stop offset="1" stopColor="#612D53" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="text-2xl tracking-tight font-extrabold text-slate-900">
                Formative<span className="text-slate-500 font-medium tracking-normal text-xl ml-1">CRM</span>
            </span>
        </div>
    );
}
