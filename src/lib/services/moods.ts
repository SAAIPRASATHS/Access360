import { db } from '../db';
import { moods } from '../db/schema';
import { desc, eq, gte, sql } from 'drizzle-orm';

export interface MoodDoc {
    id?: string;
    userId: string;
    mood: 'happy' | 'neutral' | 'stressed' | 'sad';
    note?: string;
    timestamp: number;
}

export const moodService = {
    async logMood(userId: string, mood: MoodDoc['mood'], note?: string): Promise<MoodDoc> {
        const result = await db.insert(moods).values({
            userId: userId as any,
            mood: mood as any,
            note,
        }).returning();
        
        const doc = result[0];
        return { 
            ...doc, 
            id: doc.id,
            timestamp: doc.timestamp.getTime() 
        } as unknown as MoodDoc;
    },

    async getUserMoods(userId: string, limit: number = 7): Promise<MoodDoc[]> {
        const docs = await db.select()
            .from(moods)
            .where(eq(moods.userId, userId as any))
            .orderBy(desc(moods.timestamp))
            .limit(limit);

        return docs.map(d => ({ 
            ...d, 
            id: d.id,
            timestamp: d.timestamp.getTime() 
        }) as unknown as MoodDoc);
    },

    async getWeeklyStats(): Promise<any[]> {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const results = await db.select({
            date: sql<string>`TO_CHAR(timestamp, 'YYYY-MM-DD')`,
            avgMood: sql<number>`AVG(
                CASE 
                    WHEN mood = 'happy' THEN 5 
                    WHEN mood = 'neutral' THEN 3 
                    WHEN mood = 'stressed' THEN 2 
                    ELSE 1 
                END
            )`
        })
        .from(moods)
        .where(gte(moods.timestamp, sevenDaysAgo))
        .groupBy(sql`TO_CHAR(timestamp, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(timestamp, 'YYYY-MM-DD')`);

        return results.map(r => ({
            _id: r.date,
            avgMood: Number(r.avgMood).toFixed(1),
        }));
    }
};
