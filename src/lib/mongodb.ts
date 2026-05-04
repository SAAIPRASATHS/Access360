import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global caching to maintain a single connection across hot reloads in
 * Next.js dev mode and across API Route invocations in production.
 */
declare global {
    var _mongooseCache: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null };
}

if (!global._mongooseCache) {
    global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Mongoose> {
    // If we have a live, open connection — reuse it
    if (global._mongooseCache.conn && mongoose.connection.readyState === 1) {
        return global._mongooseCache.conn;
    }

    // Reset stale connection state before retrying
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
        global._mongooseCache.conn = null;
        global._mongooseCache.promise = null;
    }

    if (!global._mongooseCache.promise) {
        console.log('[MongoDB] Creating new connection...');
        global._mongooseCache.promise = mongoose.connect(MONGODB_URI as string, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then((m) => {
            console.log('[MongoDB] Connected successfully to Atlas');
            return m;
        }).catch((err) => {
            console.error('[MongoDB] Connection failed:', err.message);
            // Reset both so the next request gets a fresh attempt
            global._mongooseCache.conn = null;
            global._mongooseCache.promise = null;
            throw err;
        });
    }

    try {
        global._mongooseCache.conn = await global._mongooseCache.promise;
    } catch (err) {
        // Promise already reset in the catch above; just rethrow
        throw err;
    }

    return global._mongooseCache.conn;
}

export default dbConnect;
