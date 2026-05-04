import { db } from '@/lib/db';
import { incidents, sosAlerts } from '@/lib/db/schema';
import { gte, count, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch recent incident counts
        const [incidentCount] = await db.select({ value: count() }).from(incidents).where(gte(incidents.timestamp, oneDayAgo));
        const [sosCount] = await db.select({ value: count() }).from(sosAlerts).where(gte(sosAlerts.timestamp, oneDayAgo));

        const weeklyIncidents = await db.select().from(incidents).where(gte(incidents.timestamp, oneWeekAgo));

        const todayIncidents = incidentCount.value;
        const todaySOS = sosCount.value;

        // Summarise incident types
        const incidentTypes: Record<string, number> = {};
        weeklyIncidents.forEach((doc: any) => {
            const type = doc.type || 'Unknown';
            incidentTypes[type] = (incidentTypes[type] || 0) + 1;
        });

        const prompt = `
            Analyze the following recent campus activity data and identify any UNUSUAL patterns or anomalies.
            
            Today's Activity (last 24 hours):
            - Incident reports: ${todayIncidents}
            - SOS alerts: ${todaySOS}
            
            Weekly incident breakdown by type:
            ${JSON.stringify(incidentTypes, null, 2)}
            
            Average baseline for this campus: ~3 incidents/day, ~1 SOS/day.
            
            Return a valid JSON object (no markdown) with this structure:
            {
              "status": "normal" | "elevated" | "critical",
              "summary": "<one-sentence summary of campus safety right now>",
              "highlights": [
                {
                  "title": "<short title>",
                  "detail": "<specific unusual observation>",
                  "level": "info" | "warning" | "danger"
                }
              ]
            }
            
            Only list highlights where something is genuinely notable. Max 3 highlights.
        `;

        const raw = await getChatCompletion(prompt, {
            systemPrompt: "You are a campus safety AI monitoring system. Return only valid JSON.",
            provider: 'groq'
        });

        let result: any = { status: 'normal', summary: 'Campus activity appears normal.', highlights: [] };
        try {
            const cleaned = raw.replace(/```json|```/g, '').trim();
            result = JSON.parse(cleaned);
        } catch {
            result.summary = raw;
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Activity Monitor Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
