import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        console.log('[Health Check] Testing PostgreSQL...');
        await db.execute(sql`SELECT 1`);

        return NextResponse.json({
            status: 'ok',
            database: 'PostgreSQL (Neon)',
            canQuery: true
        });
    } catch (error: any) {
        console.error('[Health Check] FAIL:', error.message);
        return NextResponse.json({
            status: 'error',
            message: error.message,
        }, { status: 500 });
    }
}
