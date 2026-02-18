import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export type Role = 'ADMIN' | 'COMMITTEE' | 'RESIDENT' | 'TENANT'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      flatId?: string | null
      flatNumber?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
    flatId?: string | null
    flatNumber?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    flatId?: string | null
    flatNumber?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { flat: true },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact admin.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          flatId: user.flatId,
          flatNumber: user.flat?.flatNumber ?? null,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.flatId = user.flatId
        token.flatNumber = user.flatNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.flatId = token.flatId
        session.user.flatNumber = token.flatNumber
      }
      return session
    },
  },
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN'
}

export function isCommittee(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageDocuments(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageExpenses(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canCreatePoll(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageTenders(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageAnnouncements(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}

export function canManageComplaints(role: Role): boolean {
  return role === 'ADMIN' || role === 'COMMITTEE'
}
