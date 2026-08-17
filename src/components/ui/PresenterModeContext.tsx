'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PresenterModeContextType {
    isPresenterMode: boolean;
    togglePresenterMode: () => void;
}

const PresenterModeContext = createContext<PresenterModeContextType>({
    isPresenterMode: false,
    togglePresenterMode: () => {},
});

export function PresenterModeProvider({ children }: { children: React.ReactNode }) {
    const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem('formative_presenter_mode');
        if (saved === 'true') {
            setIsPresenterMode(true);
        }
    }, []);

    const togglePresenterMode = () => {
        setIsPresenterMode(prev => {
            const next = !prev;
            localStorage.setItem('formative_presenter_mode', String(next));
            return next;
        });
    };

    return (
        <PresenterModeContext.Provider value={{ isPresenterMode, togglePresenterMode }}>
            {children}
        </PresenterModeContext.Provider>
    );
}

export function usePresenterMode() {
    return useContext(PresenterModeContext);
}
