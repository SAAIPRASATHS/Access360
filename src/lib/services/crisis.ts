import { db } from '../db';
import { crisisReports } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export interface CrisisReportDoc {
    id?: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    verified: boolean;
    photoUrl?: string;
    timestamp: number;
}

export const crisisService = {
    async createReport(report: Omit<CrisisReportDoc, 'timestamp' | 'verified'>): Promise<CrisisReportDoc> {
        const result = await db.insert(crisisReports).values({
            userId: report.userId as any,
            lat: report.location.lat,
            lng: report.location.lng,
            description: report.description,
            severity: report.severity as any,
            verified: false,
            photoUrl: report.photoUrl,
        }).returning();
        
        const doc = result[0];
        return { 
            ...doc, 
            id: doc.id,
            location: { lat: doc.lat, lng: doc.lng },
            timestamp: doc.timestamp.getTime() 
        } as unknown as CrisisReportDoc;
    },

    async getVerifiedReports(limit: number = 50): Promise<CrisisReportDoc[]> {
        const docs = await db.select()
            .from(crisisReports)
            .where(eq(crisisReports.verified, true))
            .orderBy(desc(crisisReports.timestamp))
            .limit(limit);

        return docs.map(d => ({ 
            ...d, 
            id: d.id,
            location: { lat: d.lat, lng: d.lng },
            timestamp: d.timestamp.getTime() 
        }) as unknown as CrisisReportDoc);
    }
};
