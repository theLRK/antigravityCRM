import React from 'react';
import { Logo } from '../Logo';

export function FormativeLogo({ className = "", lightText = false }: { className?: string; lightText?: boolean }) {
    // We now use the canonical Parametric Isometric Logo for consistency across the entire app
    return <Logo className={className} lightText={lightText} />;
}
