import { NextResponse } from 'next/server';

export async function GET() {
    // Block in production to avoid leaking env details
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const uri = process.env.DATABASE_URL;
    return NextResponse.json({
        hasUri: !!uri,
        uriLength: uri?.length,
        uriStart: uri?.substring(0, 30),
        databaseType: 'PostgreSQL (Neon)',
        nodeVersion: process.version,
    });
}
