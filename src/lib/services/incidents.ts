import { db } from '../db';
import { incidents } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export interface IncidentDoc {
    id?: string;
    userId: string;
    type: 'Flood' | 'Heat' | 'Safety' | 'Other';
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'resolved' | 'approved';
    imageUrl?: string;
    timestamp: number;
}

export const incidentService = {
    async createIncident(incident: Omit<IncidentDoc, 'timestamp' | 'status'>): Promise<IncidentDoc> {
        const result = await db.insert(incidents).values({
            userId: incident.userId as any,
            type: incident.type as any,
            description: incident.description,
            lat: incident.location.lat,
            lng: incident.location.lng,
            severity: incident.severity as any,
            status: 'pending',
            imageUrl: incident.imageUrl,
        }).returning();
        
        const doc = result[0];
        return { 
            ...doc, 
            id: doc.id,
            location: { lat: doc.lat, lng: doc.lng },
            timestamp: doc.timestamp.getTime() 
        } as unknown as IncidentDoc;
    },

    async getAllIncidents(limit: number = 50): Promise<IncidentDoc[]> {
        const docs = await db.select()
            .from(incidents)
            .orderBy(desc(incidents.timestamp))
            .limit(limit);

        return docs.map(d => ({ 
            ...d, 
            id: d.id,
            location: { lat: d.lat, lng: d.lng },
            timestamp: d.timestamp.getTime() 
        }) as unknown as IncidentDoc);
    },

    async updateStatus(id: string, status: IncidentDoc['status']): Promise<void> {
        await db.update(incidents)
            .set({ status: status as any })
            .where(eq(incidents.id, id as any));
    },

    async deleteIncident(id: string): Promise<void> {
        await db.delete(incidents).where(eq(incidents.id, id as any));
    }
};
