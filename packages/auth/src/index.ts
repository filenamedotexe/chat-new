import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUser, createSession, getSession, deleteSession, getUserById, sql } from '@chat/database';
import type { User, UserRole } from '@chat/shared-types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUser(credentials.email);
        if (!user) {
          return null;
        }

        const result = await sql`
          SELECT password_hash FROM users WHERE email = ${credentials.email}
        `;
        
        if (result.length === 0) return null;
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          result[0].password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAdmin(user: Pick<User, 'role'> | null): boolean {
  return user?.role === 'admin';
}

export function hasRole(user: Pick<User, 'role'> | null, role: UserRole): boolean {
  return user?.role === role;
}

export function canAccessAdminPanel(user: Pick<User, 'role'> | null): boolean {
  return isAdmin(user);
}

export function canAccessUserData(user: Pick<User, 'id' | 'role'> | null, targetUserId: string): boolean {
  if (!user) return false;
  return isAdmin(user) || user.id === targetUserId;
}

export { getSession as getServerSession } from 'next-auth/react';