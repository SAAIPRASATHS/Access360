'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
    Mic,
    Volume2,
    FileText,
    Sparkles,
    Upload,
    Loader2,
    Type,
    Languages,
    Highlighter
} from 'lucide-react';
import { useSpeechToText, useTextToSpeech } from '@/hooks/useSpeech';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function AccessibilityLearningPage() {
    const { isListening, transcript, startListening, stopListening, setTranscript, isSupported } = useSpeechToText();
    const { speak, stop } = useTextToSpeech();
    const { fontSize, highContrast, dyslexiaFont, updatePreferences } = useAccessibility();

    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'learning' | 'settings'>('learning');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSummarize = async () => {
        if (!transcript) return;
        setLoading(true);
        try {
            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcript }),
            });
            const data = await res.json();
            setSummary(data.summary);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPdfJs = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            if ((window as any).pdfjsLib) {
                resolve((window as any).pdfjsLib);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs';
            script.type = 'module';
            // For module scripts, we need a different approach - use a inline module script
            script.remove();

            const moduleScript = document.createElement('script');
            moduleScript.type = 'module';
            moduleScript.textContent = `
                import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs';
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';
                window.pdfjsLib = pdfjsLib;
                window.dispatchEvent(new Event('pdfjsLoaded'));
            `;
            const handler = () => {
                window.removeEventListener('pdfjsLoaded', handler);
                resolve((window as any).pdfjsLib);
            };
            window.addEventListener('pdfjsLoaded', handler);
            document.head.appendChild(moduleScript);

            setTimeout(() => reject(new Error('PDF.js failed to load')), 10000);
        });
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large (max 5MB)');
            return;
        }

        setLoading(true);
        setSummary('');
        try {
            const pdfjsLib = await loadPdfJs();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                    .filter((item: any) => 'str' in item)
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n\n';
            }

            if (fullText.trim().length < 10) {
                throw new Error('Could not extract enough text from this PDF');
            }

            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText.substring(0, 12000) }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSummary(data.summary);
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to process PDF');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hidden file input */}
            <input
                type="file"
                id="pdf-upload"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
            />
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 font-outfit mb-3">Learning & Accessibility</h2>
                    <p className="text-slate-500 text-lg">Tools to help you learn and interact with campus content easily.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('learning')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'learning' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Learn
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'learning' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-base">
                    {/* Input Module */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Mic className="w-32 h-32 text-indigo-600" />
                            </div>

                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Mic className="w-5 h-5 text-indigo-600" />
                                Voice to Text & Notes
                            </h3>

                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                className="w-full h-48 bg-slate-50 border-none rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none mb-6"
                                placeholder="Start speaking or type notes here..."
                            />

                            <div className="flex items-center gap-4">
                                {!isSupported && (
                                    <p className="text-xs text-rose-500 font-bold mb-2 w-full text-center bg-rose-50 p-2 rounded-lg">
                                        Voice typing is only supported in Chrome/Edge browsers.
                                    </p>
                                )}
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={!isSupported}
                                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isListening ? <><div className="w-3 h-3 bg-white rounded-full animate-ping" /> Stop Recording</> : <><Mic className="w-5 h-5" /> Start Voice Typing</>}
                                </button>
                                <button
                                    onClick={handleSummarize}
                                    disabled={loading || !transcript}
                                    className="px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> AI Summary</>}
                                </button>
                            </div>
                        </div>

                        {summary && (
                            <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-5">
                                <div className="absolute top-0 right-0 p-10">
                                    <Sparkles className="w-10 h-10 text-indigo-300/30" />
                                </div>
                                <h4 className="text-2xl font-bold mb-6 font-outfit">AI Insights</h4>
                                <div className="prose prose-invert max-w-none text-indigo-100 leading-relaxed font-medium">
                                    {summary.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line}</p>
                                    ))}
                                </div>
                                <button
                                    onClick={() => speak(summary)}
                                    className="mt-8 flex items-center gap-2 text-indigo-200 hover:text-white font-bold transition-colors"
                                >
                                    <Volume2 className="w-5 h-5" /> Listen to Summary
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar tools */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-50">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-600" />
                                Study Materials
                            </h4>
                            <label
                                htmlFor="pdf-upload"
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors cursor-pointer"
                            >
                                <FileText className="w-10 h-10 text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {loading ? 'Processing...' : 'Upload PDF'}
                                </p>
                                <p className="text-[10px] text-slate-300">Max size 5MB</p>
                            </label>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-xl">
                            <h4 className="font-bold mb-4 font-outfit">Quick Tip</h4>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                                Use the Voice-to-Text feature during lectures. Our AI can automatically create study notes from the transcript!
                            </p>
                            <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 flex items-center gap-3">
                                <Highlighter className="w-5 h-5 text-indigo-200" />
                                <span className="text-xs font-bold">Auto-Highlighting Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Accessibility Settings */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                            <Type className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2 font-outfit">Text Size</h4>
                        <p className="text-slate-500 text-sm mb-6">Adjust the system-wide font size for readability.</p>
                        <div className="grid grid-cols-3 gap-4">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => updatePreferences({ fontSize: size })}
                                    className={`py-3 rounded-xl font-bold transition-all border ${fontSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                                >
                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                            <Highlighter className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2 font-outfit">Display Modes</h4>
                        <p className="text-slate-500 text-sm mb-6">Enhance visual contrast or optimize for reading.</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => updatePreferences({ highContrast: !highContrast })}
                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-between px-6 border ${highContrast ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-600 border-slate-50'}`}
                            >
                                <span>High Contrast</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${highContrast ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${highContrast ? 'left-6' : 'left-1'}`} />
                                </div>
                            </button>
                            <button
                                onClick={() => updatePreferences({ dyslexiaFont: !dyslexiaFont })}
                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-between px-6 border ${dyslexiaFont ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-600 border-slate-50'}`}
                            >
                                <span>Dyslexia Friendly</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${dyslexiaFont ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${dyslexiaFont ? 'left-6' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                            <Languages className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2 font-outfit">Language</h4>
                        <p className="text-slate-500 text-sm mb-6">Select your preferred system language.</p>
                        <select className="w-full py-4 bg-slate-50 border-none rounded-xl px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer">
                            <option>English (US)</option>
                            <option>Hindi (हिन्दी)</option>
                            <option>Spanish (Español)</option>
                            <option>French (Français)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
