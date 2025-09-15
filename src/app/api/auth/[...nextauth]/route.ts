import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Attempting login for username:', credentials?.username);
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing username or password');
          return null
        }

        const admin = await prisma.admin.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ],
            status: 'ACTIVE'
          }
        })

        console.log('Admin found:', admin);

        if (!admin) {
          console.log('Admin not found or not active');
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        )

        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
          console.log('Password does not match');
          return null
        }

        // Update login tracking
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: admin.loginCount + 1
          }
        })

        return {
          id: admin.id,
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.permissions = token.permissions
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
