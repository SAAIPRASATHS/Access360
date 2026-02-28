import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { userService } from '@/lib/services/user';

export async function GET() {
    try {
        console.log('[Health Check] Testing Firebase...');
        const collections = await db.listCollections();
        const testUser = await userService.getUserByEmail('test@test.com');

        return NextResponse.json({
            status: 'ok',
            firebase: 'connected',
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
