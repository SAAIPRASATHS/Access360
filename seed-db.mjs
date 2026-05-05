import { db } from './src/lib/db.js';
import { users } from './src/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('Connecting to PostgreSQL (Neon) for seeding...');
        
        const email = 's@gmail.com';
        const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const existingUser = existingUsers[0];

        const hashedPassword = await bcrypt.hash('saai2005', 12);

        if (existingUser) {
            console.log(`User ${email} already exists. Updating password...`);
            await db.update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, existingUser.id));
            console.log('User updated successfully.');
        } else {
            console.log(`Creating user ${email}...`);
            await db.insert(users).values({
                name: 'Saai Prasath',
                email: email,
                password: hashedPassword,
                role: 'admin',
                accessibilityPreferences: {
                    highContrast: false,
                    fontSize: 'medium',
                    dyslexiaFont: false,
                    focusMode: false,
                    speechEnabled: false,
                    language: 'en',
                },
            });
            console.log('User created successfully.');
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
