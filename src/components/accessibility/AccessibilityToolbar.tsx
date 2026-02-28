'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, Type, Contrast, Layout, Languages, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function AccessibilityToolbar() {
    const {
        highContrast,
        fontSize,
        dyslexiaFont,
        focusMode,
        speechEnabled,
        updatePreferences
    } = useAccessibility();

    useEffect(() => {
        const handleHover = (e: MouseEvent) => {
            if (!speechEnabled) return;
            const target = e.target as HTMLElement;
            const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('placeholder');
            if (text && text.length < 200) {
                window.speechSynthesis.cancel();
                const utterance = new window.SpeechSynthesisUtterance(text);
                utterance.rate = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        };

        if (speechEnabled) {
            document.addEventListener('mouseover', handleHover);
        }

        return () => {
            document.removeEventListener('mouseover', handleHover);
            window.speechSynthesis.cancel();
        };
    }, [speechEnabled]);

    const handleSpeech = () => {
        if (!speechEnabled) {
            const utterance = new window.SpeechSynthesisUtterance("Speech support enabled. Hover over elements to hear them.");
            window.speechSynthesis.speak(utterance);
        }
        updatePreferences({ speechEnabled: !speechEnabled });
    };

    return (
        <div className="fixed bottom-6 right-24 flex flex-col items-end gap-3 group z-50">
            <div className="flex flex-col gap-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-bottom bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/20 mb-2 w-64 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center justify-between px-4 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Accessibility</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>

                <button
                    onClick={() => updatePreferences({ highContrast: !highContrast })}
                    className={cn(
                        "p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent",
                        highContrast
                            ? "bg-slate-900 text-yellow-400 border-yellow-400 shadow-lg shadow-yellow-400/10"
                            : "hover:bg-slate-50 text-slate-600"
                    )}
                >
                    <Contrast className={cn("w-5 h-5", highContrast && "animate-pulse")} />
                    <span className="text-sm font-bold tracking-tight">High Contrast</span>
                </button>

                <button
                    onClick={() => updatePreferences({ fontSize: fontSize === 'xl' ? 'medium' : fontSize === 'large' ? 'xl' : 'large' })}
                    className={cn(
                        "p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent",
                        (fontSize === 'large' || fontSize === 'xl')
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "hover:bg-slate-50 text-slate-600"
                    )}
                >
                    <Type className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">FontSize: {fontSize.toUpperCase()}</span>
                </button>

                <button
                    onClick={() => updatePreferences({ dyslexiaFont: !dyslexiaFont })}
                    className={cn(
                        "p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent",
                        dyslexiaFont
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "hover:bg-slate-50 text-slate-600"
                    )}
                >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight font-sans">Dyslexia Font</span>
                </button>

                <button
                    onClick={() => updatePreferences({ focusMode: !focusMode })}
                    className={cn(
                        "p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent",
                        focusMode
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                            : "hover:bg-slate-50 text-slate-600"
                    )}
                >
                    <Layout className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">Focus Mode</span>
                </button>

                <button
                    onClick={handleSpeech}
                    className={cn(
                        "p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent",
                        speechEnabled
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                            : "hover:bg-slate-50 text-slate-600"
                    )}
                >
                    <Volume2 className={cn("w-5 h-5", speechEnabled && "animate-bounce")} />
                    <span className="text-sm font-bold tracking-tight">Speech (TTS)</span>
                </button>
            </div>

            <button className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-[2rem] shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95 group-hover:rotate-12">
                <Settings className="w-7 h-7" />
            </button>
        </div>
    );
}
