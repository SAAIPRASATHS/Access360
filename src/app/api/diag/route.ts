import { NextResponse } from 'next/server';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;
    const mongoUri = process.env.MONGODB_URI;

    return NextResponse.json({
        status: 'Access360 Diagnostic Report',
        timestamp: new Date().toISOString(),
        env: {
            DATABASE_URL: {
                present: !!dbUrl,
                length: dbUrl?.length || 0,
                prefix: dbUrl ? dbUrl.substring(0, 15) + '...' : null,
                isPostgres: dbUrl?.startsWith('postgres') || false,
            },
            MONGODB_URI: {
                present: !!mongoUri,
                length: mongoUri?.length || 0,
                prefix: mongoUri ? mongoUri.substring(0, 15) + '...' : null,
                isMongo: mongoUri?.startsWith('mongodb') || false,
            },
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: !!process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV || 'local',
        },
        checks: {
            readyForPostgres: !!dbUrl && (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')),
            hasConflict: !!dbUrl && !!mongoUri,
            hasChannelBinding: dbUrl?.includes('channel_binding'),
        },
        instructions: "If 'DATABASE_URL' is missing, go to Vercel Dashboard > Settings > Environment Variables. Ensure 'channel_binding' is NOT in the connection string if you still see errors."
    });
}
