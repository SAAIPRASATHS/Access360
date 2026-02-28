import { db } from '../firebase';

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

const INCIDENTS_COLLECTION = 'incidents';

export const incidentService = {
    async createIncident(incident: Omit<IncidentDoc, 'timestamp' | 'status'>): Promise<IncidentDoc> {
        const docRef = await db.collection(INCIDENTS_COLLECTION).add({
            ...incident,
            status: 'pending',
            timestamp: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as IncidentDoc;
    },

    async getAllIncidents(limit: number = 50): Promise<IncidentDoc[]> {
        // No orderBy — avoids composite index requirement; sort in-memory
        const snapshot = await db.collection(INCIDENTS_COLLECTION)
            .limit(limit)
            .get();

        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as IncidentDoc);
        return docs.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    },

    async updateStatus(id: string, status: IncidentDoc['status']): Promise<void> {
        await db.collection(INCIDENTS_COLLECTION).doc(id).update({ status });
    }
};
