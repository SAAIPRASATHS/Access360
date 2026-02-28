import * as admin from 'firebase-admin';

const getPrivateKey = () => {
    let key = process.env.FIREBASE_PRIVATE_KEY || '';
    key = key.trim();
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.substring(1, key.length - 1);
    }

    // Replace literal \n with real newlines
    key = key.replace(/\\n/g, '\n');

    // Ensure the key has the correct header/footer
    if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
        console.warn('[Firebase Admin] Warning: Private key header missing.');
    }

    return key;
};

/**
 * 🚨 CRITICAL WORKAROUND: SYSTEM CLOCK DRIFT
 * The user's machine has a significant clock drift (~3 hours) which causes 
 * Firebase Admin SDK to generate invalid JWTs. This monkey-patches Date 
 * to align with a remote reliable time source (google.com) if drift is detected.
 */
async function applyTimeDriftWorkaround() {
    if (typeof window !== 'undefined') return; // Server-side only

    try {
        const https = await import('https');
        const getRemoteTime = () => new Promise<number>((resolve, reject) => {
            const req = https.get('https://www.google.com', (res) => {
                const dateStr = res.headers.date;
                if (dateStr) resolve(new Date(dateStr).getTime());
                else reject(new Error('No date header'));
            });
            req.on('error', reject);
            req.setTimeout(2000, () => req.destroy());
        });

        const localNow = Date.now();
        const remoteNow = await getRemoteTime();
        const drift = remoteNow - localNow;

        if (Math.abs(drift) > 30000) { // > 30 seconds
            console.log(`[Firebase Drift] Significant drift detected: ${Math.round(drift / 1000)}s. Applying patch...`);
            const OriginalDate = global.Date;
            const PatchedDate: any = function (...args: any[]) {
                if (args.length === 0) return new (OriginalDate as any)(OriginalDate.now() + drift);
                return new (OriginalDate as any)(...args);
            };
            PatchedDate.prototype = OriginalDate.prototype;
            PatchedDate.now = () => OriginalDate.now() + drift;
            PatchedDate.UTC = OriginalDate.UTC;
            PatchedDate.parse = OriginalDate.parse;
            global.Date = PatchedDate as DateConstructor;
            console.log(`[Firebase Drift] Patched time: ${new Date().toISOString()}`);
        }
    } catch (e) {
        console.error('[Firebase Drift] Failed to apply workaround:', e);
    }
}

// Global invocation to ensure all subsequent admin calls use patched time
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
    // We use top-level await to ensure the monkey-patch is applied 
    // BEFORE the services below (db, auth) are initialized and used.
    await applyTimeDriftWorkaround();
}

const firebaseConfig = {
    projectId: (process.env.FIREBASE_PROJECT_ID || '').trim(),
    clientEmail: (process.env.FIREBASE_CLIENT_EMAIL || '').trim(),
    privateKey: getPrivateKey(),
};

let firebaseInitialized = false;

if (!admin.apps.length) {
    try {
        console.log('[Firebase Admin] Initializing for project:', firebaseConfig.projectId);

        if (!firebaseConfig.projectId) throw new Error('Missing FIREBASE_PROJECT_ID');
        if (!firebaseConfig.clientEmail) throw new Error('Missing FIREBASE_CLIENT_EMAIL');
        if (!firebaseConfig.privateKey || firebaseConfig.privateKey.length < 100) {
            throw new Error('Invalid or missing FIREBASE_PRIVATE_KEY');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firebaseConfig.projectId,
                clientEmail: firebaseConfig.clientEmail,
                privateKey: firebaseConfig.privateKey,
            }),
        });
        firebaseInitialized = true;
        console.log('[Firebase Admin] SUCCESS: SDK initialized.');
    } catch (error: any) {
        console.error('[Firebase Admin] FAIL:', error.message);
    }
} else {
    firebaseInitialized = true;
}

export const db = admin.firestore();
export const auth = admin.auth();
export { firebaseInitialized };

