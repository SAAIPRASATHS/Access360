import AIAssistant from '@/components/accessibility/AIAssistant';

export default function AIDashboardPage() {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-outfit mb-2">AI Hub</h2>
                <p className="text-slate-500">Simplify complex information and get instant campus support.</p>
            </div>
            <AIAssistant />
        </div>
    );
}
