import { db } from '../firebase';

export interface SOSAlertDoc {
    id?: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    timestamp: number;
    status: 'active' | 'responded';
}

const SOS_COLLECTION = 'sosAlerts';

export const sosService = {
    async triggerSOS(userId: string, location: SOSAlertDoc['location']): Promise<SOSAlertDoc> {
        const docRef = await db.collection(SOS_COLLECTION).add({
            userId,
            location,
            status: 'active',
            timestamp: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as SOSAlertDoc;
    },

    async getActiveAlerts(): Promise<SOSAlertDoc[]> {
        // No orderBy — avoids composite index requirement; sort in-memory
        const snapshot = await db.collection(SOS_COLLECTION)
            .where('status', '==', 'active')
            .get();

        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SOSAlertDoc);
        return docs.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    }
};
