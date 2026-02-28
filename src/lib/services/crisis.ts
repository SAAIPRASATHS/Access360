import { db } from '../firebase';

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

const REPORTS_COLLECTION = 'crisis_reports';

export const crisisService = {
    async createReport(report: Omit<CrisisReportDoc, 'timestamp' | 'verified'>): Promise<CrisisReportDoc> {
        const docRef = await db.collection(REPORTS_COLLECTION).add({
            ...report,
            verified: false,
            timestamp: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as CrisisReportDoc;
    },

    async getVerifiedReports(limit: number = 50): Promise<CrisisReportDoc[]> {
        const snapshot = await db.collection(REPORTS_COLLECTION)
            .where('verified', '==', true)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CrisisReportDoc);
    }
};
