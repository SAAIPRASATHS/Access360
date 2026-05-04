import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/janaccess';
if (!process.env.MONGODB_URI) {
    console.warn('[seed] WARNING: MONGODB_URI not set in environment, using localhost fallback.');
    console.warn('[seed] For Atlas, run: $env:MONGODB_URI="mongodb+srv://..." ; node seed-db.mjs');
}

async function seed() {
    try {
        console.log('Connecting to local MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        // Define a simple User schema for seeding
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: { type: String, required: false },
            role: String,
            accessibilityPreferences: Object,
            createdAt: Number
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Check if user already exists
        const email = 's@gmail.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(`User ${email} already exists. Updating password...`);
            const hashedPassword = await bcrypt.hash('saai2005', 12);
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log('User updated successfully.');
        } else {
            console.log(`Creating user ${email}...`);
            const hashedPassword = await bcrypt.hash('saai2005', 12);
            await User.create({
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
                createdAt: Date.now()
            });
            console.log('User created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
