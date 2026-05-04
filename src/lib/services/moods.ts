import dbConnect from '../mongodb';
import Mood from '../models/Mood';

export interface MoodDoc {
    id?: string;
    userId: string;
    mood: 'happy' | 'neutral' | 'stressed' | 'sad';
    note?: string;
    timestamp: number;
}

export const moodService = {
    async logMood(userId: string, mood: MoodDoc['mood'], note?: string): Promise<MoodDoc> {
        await dbConnect();
        const doc = await Mood.create({
            userId,
            mood,
            note,
            timestamp: Date.now(),
        });
        return { ...doc.toObject(), id: doc._id.toString() } as MoodDoc;
    },

    async getUserMoods(userId: string, limit: number = 7): Promise<MoodDoc[]> {
        await dbConnect();
        const docs = await Mood.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return docs.map(d => ({ ...d, id: (d as any)._id.toString() }) as MoodDoc);
    },

    async getWeeklyStats(): Promise<any[]> {
        await dbConnect();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const results = await Mood.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: { $toDate: '$timestamp' },
                        },
                    },
                    moodValue: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$mood', 'happy'] }, then: 5 },
                                { case: { $eq: ['$mood', 'neutral'] }, then: 3 },
                                { case: { $eq: ['$mood', 'stressed'] }, then: 2 },
                            ],
                            default: 1,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$date',
                    avgMood: { $avg: '$moodValue' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return results.map(r => ({
            _id: r._id,
            avgMood: r.avgMood.toFixed(1),
        }));
    }
};
