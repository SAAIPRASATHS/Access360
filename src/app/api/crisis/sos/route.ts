import { sosService } from '@/lib/services/sos';
import { userService } from '@/lib/services/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

async function getSOSUrgencyScore(userId: string, location: any, existingAlerts: any[]): Promise<number> {
    const now = new Date();
    const hour = now.getHours();
    const isNighttime = hour >= 22 || hour <= 6;
    const repeatCount = existingAlerts.filter(a => a.userId === userId && a.status === 'active').length;

    const prompt = `
        An SOS emergency alert has been triggered on a university campus. Determine the urgency score (1-10, where 10 is maximum emergency).
        
        Factors:
        - Time: ${now.toLocaleTimeString()} (Is nighttime: ${isNighttime})
        - Repeat alerts from same user: ${repeatCount}
        - Has GPS location: ${location ? 'Yes' : 'No'}
        
        Return ONLY a single number between 1 and 10.
    `;

    try {
        const result = await getChatCompletion(prompt, {
            systemPrompt: "You are a campus safety AI. Return only a single integer urgency score.",
            provider: 'groq'
        });
        const score = parseInt(result.trim(), 10);
        return isNaN(score) ? (isNighttime ? 8 : 6) : Math.max(1, Math.min(10, score));
    } catch {
        let score = 5;
        if (isNighttime) score += 3;
        if (repeatCount > 1) score += 1;
        if (!location) score -= 1;
        return Math.max(1, Math.min(10, score));
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { location } = await req.json();
        const userId = (session.user as any).id || session.user.email || 'unknown';

        let existingAlerts: any[] = [];
        try {
            existingAlerts = await sosService.getActiveAlerts();
        } catch (e) {
            console.error('[SOS POST] Could not fetch existing alerts:', e);
        }

        const urgencyScore = await getSOSUrgencyScore(userId, location, existingAlerts);
        const alert = await sosService.triggerSOS(userId, location);

        if (alert?.id) {
            await sosService.updateUrgencyScore(alert.id, urgencyScore);
        }

        return NextResponse.json({ success: true, alert, urgencyScore });
    } catch (error: any) {
        console.error('[SOS POST] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const alerts = await sosService.getAllAlerts();
        const userProfiles = await userService.getUserProfiles();

        const enrichedAlerts = alerts.map((alert: any) => ({
            ...alert,
            userName: userProfiles[alert.userId]?.name || 'Unknown User',
            userEmail: userProfiles[alert.userId]?.email || 'No email'
        }));

        const sorted = [...enrichedAlerts].sort((a: any, b: any) => {
            const urgencyDiff = (b.urgencyScore ?? 5) - (a.urgencyScore ?? 5);
            if (urgencyDiff !== 0) return urgencyDiff;
            return (b.timestamp ?? 0) - (a.timestamp ?? 0);
        });
        return NextResponse.json({ alerts: sorted });
    } catch (error: any) {
        console.error('[SOS GET] Error:', error?.message || error);
        return NextResponse.json({ alerts: [], error: error?.message });
    }
}
