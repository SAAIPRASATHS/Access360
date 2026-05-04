import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICrisisReport extends Document {
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

const CrisisReportSchema = new Schema<ICrisisReport>({
    userId: { type: String, required: true, index: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    verified: { type: Boolean, default: false, index: true },
    photoUrl: { type: String },
    timestamp: { type: Number, default: () => Date.now(), index: true },
});

const CrisisReport: Model<ICrisisReport> = mongoose.models.CrisisReport || mongoose.model<ICrisisReport>('CrisisReport', CrisisReportSchema);
export default CrisisReport;
