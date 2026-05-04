import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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

export const userService = {
    async getUserByEmail(email: string): Promise<UserDoc | null> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = result[0];
        if (!user) return null;
        return { 
            ...user, 
            id: user.id,
            createdAt: user.createdAt.getTime() 
        } as UserDoc;
    },

    async createUser(userData: Omit<UserDoc, 'createdAt'>): Promise<UserDoc> {
        const result = await db.insert(users).values({
            ...userData,
            accessibilityPreferences: userData.accessibilityPreferences as any,
        }).returning();
        
        const user = result[0];
        return { 
            ...user, 
            id: user.id,
            createdAt: user.createdAt.getTime() 
        } as UserDoc;
    },

    async updateUser(id: string, updates: Partial<UserDoc>): Promise<void> {
        await db.update(users)
            .set(updates as any)
            .where(eq(users.id, id as any));
    },

    async getAllUsers(): Promise<UserDoc[]> {
        const result = await db.select().from(users).limit(100);
        return result.map(user => ({ 
            ...user, 
            id: user.id,
            createdAt: user.createdAt.getTime() 
        })) as UserDoc[];
    },

    async deleteUser(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id as any));
    },

    async getUserProfiles(): Promise<Record<string, { name: string, email: string }>> {
        const result = await db.select({
            id: users.id,
            name: users.name,
            email: users.email
        }).from(users);
        
        const profiles: Record<string, { name: string, email: string }> = {};
        result.forEach(u => {
            profiles[u.id] = { name: u.name, email: u.email };
        });
        return profiles;
    }
};
