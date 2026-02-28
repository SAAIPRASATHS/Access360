import { db } from '../firebase';

export interface MoodDoc {
    id?: string;
    userId: string;
    mood: 'happy' | 'neutral' | 'stressed' | 'sad';
    note?: string;
    timestamp: number;
}

const MOODS_COLLECTION = 'moods';

export const moodService = {
    async logMood(userId: string, mood: MoodDoc['mood'], note?: string): Promise<MoodDoc> {
        const docRef = await db.collection(MOODS_COLLECTION).add({
            userId,
            mood,
            note,
            timestamp: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as MoodDoc;
    },

    async getUserMoods(userId: string, limit: number = 7): Promise<MoodDoc[]> {
        const snapshot = await db.collection(MOODS_COLLECTION)
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MoodDoc);
    },

    async getWeeklyStats(): Promise<any[]> {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const snapshot = await db.collection(MOODS_COLLECTION)
            .where('timestamp', '>=', sevenDaysAgo)
            .get();

        const stats: Record<string, { total: number, count: number }> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp).toISOString().split('T')[0];
            const moodValue = data.mood === 'happy' ? 5 : data.mood === 'neutral' ? 3 : data.mood === 'stressed' ? 2 : 1;

            if (!stats[date]) stats[date] = { total: 0, count: 0 };
            stats[date].total += moodValue;
            stats[date].count += 1;
        });

        return Object.entries(stats).map(([date, s]) => ({
            _id: date,
            avgMood: (s.total / s.count).toFixed(1)
        })).sort((a, b) => a._id.localeCompare(b._id));
    }
};
