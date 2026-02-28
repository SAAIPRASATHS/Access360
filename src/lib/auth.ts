import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { userService } from '@/lib/services/user';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                const user = await userService.getUserByEmail(credentials.email);

                if (!user || !user.password) {
                    throw new Error('No user found with this email');
                }

                const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordMatch) {
                    throw new Error('Incorrect password');
                }

                return {
                    id: user.id!,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                // Fetch and store extra user data in the token on first sign-in
                try {
                    const dbUser = await userService.getUserByEmail(user.email!);
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.accessibilityPreferences = dbUser.accessibilityPreferences;
                    }
                } catch (e) {
                    console.error('[JWT callback] Firestore lookup failed:', e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Read from token — avoids a Firestore call on every session check
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).accessibilityPreferences = token.accessibilityPreferences;
            }
            return session;
        },
        async signIn({ user }) {
            // Only auto-create users for OAuth providers (not Credentials, which uses authorize())
            // For credentials, the user is already validated in authorize()
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
