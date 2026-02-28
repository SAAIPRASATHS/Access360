'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface AccessibilityContextType {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    dyslexiaFont: boolean;
    language: string;
    updatePreferences: (prefs: any) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [prefs, setPrefs] = useState<{
        fontSize: 'small' | 'medium' | 'large';
        highContrast: boolean;
        dyslexiaFont: boolean;
        language: string;
    }>({
        fontSize: 'medium',
        highContrast: false,
        dyslexiaFont: false,
        language: 'en'
    });

    useEffect(() => {
        if (session?.user) {
            const userPrefs = (session.user as any).accessibilityPreferences;
            if (userPrefs) {
                setPrefs({
                    fontSize: userPrefs.largeFont ? 'large' : 'medium',
                    highContrast: userPrefs.highContrast || false,
                    dyslexiaFont: userPrefs.dyslexiaFont || false,
                    language: userPrefs.language || 'en'
                });
            }
        } else {
            // Check local storage for guests
            const saved = localStorage.getItem('access360_prefs');
            if (saved) {
                try { setPrefs(JSON.parse(saved)); } catch (e) { }
            }
        }
    }, [session]);

    const updatePreferences = async (newPrefs: any) => {
        const updated = { ...prefs, ...newPrefs };
        setPrefs(updated);
        localStorage.setItem('access360_prefs', JSON.stringify(updated));

        if (session?.user) {
            try {
                await fetch('/api/user/preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPrefs),
                });
            } catch (err) {
                console.error('Failed to persist preferences:', err);
            }
        }
    };

    return (
        <AccessibilityContext.Provider value={{ ...prefs, updatePreferences }}>
            <div className={`
                min-h-screen
                ${prefs.highContrast ? 'high-contrast' : ''} 
                ${prefs.dyslexiaFont ? 'dyslexia-mode' : ''}
                ${prefs.fontSize === 'large' ? 'text-lg' : prefs.fontSize === 'small' ? 'text-sm' : 'text-base'}
            `}>
                {children}
            </div>
        </AccessibilityContext.Provider>
    );
}

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
};
