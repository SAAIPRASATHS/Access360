import { db } from '../db';
import { sosAlerts } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export interface SOSAlertDoc {
    id?: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    timestamp: number;
    status: 'active' | 'responded' | 'handled';
}

export const sosService = {
    async triggerSOS(userId: string, location: SOSAlertDoc['location']): Promise<SOSAlertDoc> {
        const result = await db.insert(sosAlerts).values({
            userId: userId as any,
            lat: location.lat,
            lng: location.lng,
            status: 'active',
        }).returning();
        
        const doc = result[0];
        return { 
            ...doc, 
            id: doc.id,
            location: { lat: doc.lat, lng: doc.lng },
            timestamp: doc.timestamp.getTime() 
        } as unknown as SOSAlertDoc;
    },

    async getActiveAlerts(): Promise<SOSAlertDoc[]> {
        const alerts = await db.select()
            .from(sosAlerts)
            .where(eq(sosAlerts.status, 'active'))
            .orderBy(desc(sosAlerts.timestamp));

        return alerts.map(a => ({ 
            ...a, 
            id: a.id,
            location: { lat: a.lat, lng: a.lng },
            timestamp: a.timestamp.getTime() 
        }) as unknown as SOSAlertDoc);
    },

    async getAllAlerts(): Promise<SOSAlertDoc[]> {
        const alerts = await db.select()
            .from(sosAlerts)
            .orderBy(desc(sosAlerts.timestamp))
            .limit(100);

        return alerts.map(a => ({ 
            ...a, 
            id: a.id,
            location: { lat: a.lat, lng: a.lng },
            timestamp: a.timestamp.getTime() 
        }) as unknown as SOSAlertDoc);
    },

    async updateUrgencyScore(id: string, urgencyScore: number): Promise<void> {
        await db.update(sosAlerts)
            .set({ urgencyScore })
            .where(eq(sosAlerts.id, id as any));
    },

    async updateStatus(id: string, status: SOSAlertDoc['status']): Promise<void> {
        await db.update(sosAlerts)
            .set({ status: status as any })
            .where(eq(sosAlerts.id, id as any));
    }
};
