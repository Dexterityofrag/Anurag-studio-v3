import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                // Verify against env vars
                if (email !== process.env.ADMIN_EMAIL) return null

                const isValid = await bcrypt.compare(
                    password,
                    process.env.ADMIN_PASSWORD_HASH!
                )
                if (!isValid) return null

                return {
                    id: '1',
                    name: 'Admin',
                    email: process.env.ADMIN_EMAIL,
                    role: 'admin',
                }
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 86400, // 24 hours
        updateAge: 3600, // 1 hour
    },

    pages: {
        signIn: '/x/admin/login',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                ; (session.user as { role?: string }).role = token.role as string
            }
            return session
        },
    },
})
