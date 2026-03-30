'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackButton({ className, href, label = "Back" }: { className?: string, href?: string, label?: string }) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-lg transition-colors border border-transparent hover:border-slate-200 active:scale-95 shadow-sm bg-white/50 backdrop-blur-sm mb-4 inline-flex",
                className
            )}
        >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
