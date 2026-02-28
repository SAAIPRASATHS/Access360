'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, Type, Contrast, Layout, Languages, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AccessibilityToolbar() {
    const [pref, setPref] = useState({
        highContrast: false,
        largeFont: false,
        dyslexiaFont: false,
        focusMode: false,
        speechEnabled: false,
        language: 'en'
    });

    useEffect(() => {
        const body = document.body;
        body.classList.toggle('high-contrast', pref.highContrast);
        body.classList.toggle('large-font', pref.largeFont);
        body.classList.toggle('dyslexia-font', pref.dyslexiaFont);
        body.classList.toggle('focus-mode', pref.focusMode);

        const handleHover = (e: MouseEvent) => {
            if (!pref.speechEnabled) return;
            const target = e.target as HTMLElement;
            const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('placeholder');
            if (text && text.length < 200) {
                window.speechSynthesis.cancel();
                const utterance = new window.SpeechSynthesisUtterance(text);
                utterance.rate = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        };

        if (pref.speechEnabled) {
            document.addEventListener('mouseover', handleHover);
        }

        return () => {
            document.removeEventListener('mouseover', handleHover);
            window.speechSynthesis.cancel();
        };
    }, [pref]);

    const toggle = (key: keyof typeof pref) => {
        setPref(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSpeech = () => {
        if (!pref.speechEnabled) {
            const utterance = new window.SpeechSynthesisUtterance("Speech support enabled. Hover over elements to hear them.");
            window.speechSynthesis.speak(utterance);
        }
        toggle('speechEnabled');
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 group z-50">
            <div className="flex flex-col gap-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-bottom bg-white p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 mb-2 w-56">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Accessibility Tools</p>
                <button
                    onClick={() => toggle('highContrast')}
                    className={cn("p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-slate-50", pref.highContrast && "bg-indigo-50 text-indigo-600 font-bold")}
                >
                    <Contrast className="w-5 h-5" />
                    <span className="text-sm">High Contrast</span>
                </button>
                <button
                    onClick={() => toggle('largeFont')}
                    className={cn("p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-slate-50", pref.largeFont && "bg-indigo-50 text-indigo-600 font-bold")}
                >
                    <Type className="w-5 h-5" />
                    <span className="text-sm">Large Font</span>
                </button>
                <button
                    onClick={() => toggle('dyslexiaFont')}
                    className={cn("p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-slate-50", pref.dyslexiaFont && "bg-indigo-50 text-indigo-600 font-bold")}
                >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">Dyslexia Font</span>
                </button>
                <button
                    onClick={() => toggle('focusMode')}
                    className={cn("p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-slate-50", pref.focusMode && "bg-emerald-50 text-emerald-600 font-bold")}
                >
                    <Layout className="w-5 h-5" />
                    <span className="text-sm">Focus Mode</span>
                </button>
                <button
                    onClick={handleSpeech}
                    className={cn("p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-slate-50", pref.speechEnabled && "bg-rose-50 text-rose-600 font-bold")}
                >
                    <Volume2 className="w-5 h-5" />
                    <span className="text-sm">Speech (TTS)</span>
                </button>
            </div>
            <button className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition active:scale-95">
                <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
            </button>
        </div>
    );
}
