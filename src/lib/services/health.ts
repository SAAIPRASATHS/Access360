import { db } from '../db';
import { healthLogs } from '../db/schema';
import { desc, eq, gte } from 'drizzle-orm';

export interface HealthLogDoc {
    id?: string;
    userId: string;
    type: string;
    value: string;
    note?: string;
    timestamp: number;
}

export const healthService = {
    async createLog(log: Omit<HealthLogDoc, 'timestamp'>): Promise<HealthLogDoc> {
        const result = await db.insert(healthLogs).values({
            userId: log.userId as any,
            type: log.type,
            value: log.value,
            note: log.note,
        }).returning();
        
        const doc = result[0];
        return { 
            ...doc, 
            id: doc.id,
            timestamp: doc.timestamp.getTime() 
        } as unknown as HealthLogDoc;
    },

    async getUserLogs(userId: string, limit: number = 10): Promise<HealthLogDoc[]> {
        const docs = await db.select()
            .from(healthLogs)
            .where(eq(healthLogs.userId, userId as any))
            .orderBy(desc(healthLogs.timestamp))
            .limit(limit);

        return docs.map(d => ({ 
            ...d, 
            id: d.id,
            timestamp: d.timestamp.getTime() 
        }) as unknown as HealthLogDoc);
    },

    async getRecentLogs(days: number = 7): Promise<HealthLogDoc[]> {
        const startTime = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        const docs = await db.select()
            .from(healthLogs)
            .where(gte(healthLogs.timestamp, startTime))
            .orderBy(desc(healthLogs.timestamp));

        return docs.map(d => ({ 
            ...d, 
            id: d.id,
            timestamp: d.timestamp.getTime() 
        }) as unknown as HealthLogDoc);
    }
};
