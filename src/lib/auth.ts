import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          branch: user.branch,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: auto-create user in DB if they don't exist
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                name: user.name ?? 'User',
                email: user.email!,
                image: user.image ?? null,
                role: 'STUDENT',
              },
            })
            user.id = newUser.id
            ;(user as any).role = 'STUDENT'
            ;(user as any).branch = null
          } else {
            user.id = existingUser.id
            ;(user as any).role = existingUser.role
            ;(user as any).branch = existingUser.branch
          }
        } catch (e) {
          // Log the actual error — do NOT block login
          console.error('[CampusHub] Google signIn DB error:', JSON.stringify(e, Object.getOwnPropertyNames(e as object)))
          // Still allow login even if DB sync fails (user gets basic session)
          ;(user as any).role = 'STUDENT'
          ;(user as any).branch = null
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role ?? 'STUDENT'
        token.branch = (user as any).branch ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.branch = token.branch as string
      }
      return session
    },
  },
})

// Keep our existing getSession and requireAuth wrappers but wire them to real auth()
export async function getSession() {
  const session = await auth()
  return session
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}
