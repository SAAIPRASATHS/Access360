import dbConnect from '../mongodb';
import Incident from '../models/Incident';

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
        await dbConnect();
        const doc = await Incident.create({
            ...incident,
            status: 'pending',
            timestamp: Date.now(),
        });
        return { ...doc.toObject(), id: doc._id.toString() } as IncidentDoc;
    },

    async getAllIncidents(limit: number = 50): Promise<IncidentDoc[]> {
        await dbConnect();
        const docs = await Incident.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return docs.map(d => ({ ...d, id: (d as any)._id.toString() }) as IncidentDoc);
    },

    async updateStatus(id: string, status: IncidentDoc['status']): Promise<void> {
        await dbConnect();
        await Incident.findByIdAndUpdate(id, { status });
    }
};
