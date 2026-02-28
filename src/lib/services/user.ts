import { db } from '../firebase';

export interface UserPreferences {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    dyslexiaFont: boolean;
    focusMode: boolean;
    speechEnabled: boolean;
    language: 'en' | 'ta' | 'hi';
}

export interface UserDoc {
    id?: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'student' | 'admin' | 'volunteer';
    accessibilityPreferences: UserPreferences;
    createdAt: number;
}

const USERS_COLLECTION = 'users';

export const userService = {
    async getUserByEmail(email: string): Promise<UserDoc | null> {
        const snapshot = await db.collection(USERS_COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserDoc;
    },

    async createUser(userData: Omit<UserDoc, 'createdAt'>): Promise<UserDoc> {
        const docRef = await db.collection(USERS_COLLECTION).add({
            ...userData,
            createdAt: Date.now(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as UserDoc;
    },

    async updateUser(id: string, updates: Partial<UserDoc>): Promise<void> {
        await db.collection(USERS_COLLECTION).doc(id).update(updates);
    }
};
