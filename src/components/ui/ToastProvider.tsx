'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster 
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                },
                success: {
                    style: {
                        background: '#047857',
                        color: '#fff',
                    },
                },
                error: {
                    style: {
                        background: '#b91c1c',
                        color: '#fff',
                    },
                },
            }}
        />
    );
}
