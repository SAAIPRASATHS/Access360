import { db } from '../firebase';

export interface HealthLogDoc {
    id?: string;
    userId: string;
    moodScore: number;
    note?: string;
    timestamp: number;
}

const HEALTH_LOGS_COLLECTION = 'health_logs';

export const healthService = {
    async createLog(log: Omit<HealthLogDoc, 'timestamp'>): Promise<HealthLogDoc> {
        const docRef = await db.collection(HEALTH_LOGS_COLLECTION).add({
            ...log,
            timestamp: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as HealthLogDoc;
    },

    async getUserLogs(userId: string, limit: number = 10): Promise<HealthLogDoc[]> {
        const snapshot = await db.collection(HEALTH_LOGS_COLLECTION)
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as HealthLogDoc);
    },

    async getRecentLogs(days: number = 7): Promise<HealthLogDoc[]> {
        const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const snapshot = await db.collection(HEALTH_LOGS_COLLECTION)
            .where('timestamp', '>=', startTime)
            .orderBy('timestamp', 'asc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as HealthLogDoc);
    }
};
