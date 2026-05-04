import dbConnect from '../mongodb';
import SOSAlert from '../models/SOSAlert';

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
        await dbConnect();
        const alert = await SOSAlert.create({
            userId,
            location,
            status: 'active',
            timestamp: Date.now(),
        });
        return { ...alert.toObject(), id: alert._id.toString() } as SOSAlertDoc;
    },

    async getActiveAlerts(): Promise<SOSAlertDoc[]> {
        await dbConnect();
        const alerts = await SOSAlert.find({ status: 'active' })
            .sort({ timestamp: -1 })
            .lean();

        return alerts.map(a => ({ ...a, id: (a as any)._id.toString() }) as SOSAlertDoc);
    }
};
