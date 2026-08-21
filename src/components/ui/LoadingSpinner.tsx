'use client';

import React from 'react';
import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
    size?: number | string;
    color?: string;
    speed?: string;
    className?: string;
}

/**
 * Newton's Cradle animated loading indicator
 */
export function LoadingSpinner({
    size = 48,
    color = '#853953',
    speed = '1.2s',
    className = ''
}: LoadingSpinnerProps) {
    const sizeStr = typeof size === 'number' ? `${size}px` : size;

    const styleVariables: React.CSSProperties = {
        ['--uib-size' as any]: sizeStr,
        ['--uib-color' as any]: color,
        ['--uib-speed' as any]: speed,
    };

    return (
        <div 
            className={`${styles.newtonsCradle} ${className}`}
            style={styleVariables}
            role="status"
            aria-label="Loading"
        >
            <div className={styles.newtonsCradleDot} />
            <div className={styles.newtonsCradleDot} />
            <div className={styles.newtonsCradleDot} />
            <div className={styles.newtonsCradleDot} />
        </div>
    );
}

/**
 * Full-screen loading overlay with backdrop blur
 */
export function FullScreenLoader({
    message = 'Loading Formative CRM...',
    subtext = 'Syncing data & intelligence...',
    color = '#853953',
    size = 64
}: {
    message?: string;
    subtext?: string;
    color?: string;
    size?: number | string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all">
            <div className="flex flex-col items-center p-8 rounded-3xl bg-white/90 border border-slate-200/80 shadow-2xl max-w-sm w-full mx-4 text-center">
                <LoadingSpinner size={size} color={color} className="mb-6" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">{message}</h3>
                {subtext && (
                    <p className="text-xs font-medium text-slate-500 mt-1">{subtext}</p>
                )}
            </div>
        </div>
    );
}

/**
 * Inline section / card loading fallback
 */
export function InlineLoader({
    message = 'Loading data...',
    size = 36,
    color = '#853953',
    className = ''
}: {
    message?: string;
    size?: number | string;
    color?: string;
    className?: string;
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 gap-3 text-center ${className}`}>
            <LoadingSpinner size={size} color={color} />
            {message && (
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{message}</p>
            )}
        </div>
    );
}

export default LoadingSpinner;
