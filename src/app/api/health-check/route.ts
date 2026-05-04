import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('[Health Check] Testing MongoDB...');
        await dbConnect();

        const state = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const stateMap: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        const collections = await mongoose.connection.db!.listCollections().toArray();

        return NextResponse.json({
            status: 'ok',
            mongodb: stateMap[state] || 'unknown',
            collections: collections.length,
            canQuery: true
        });
    } catch (error: any) {
        console.error('[Health Check] FAIL:', error.message);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
