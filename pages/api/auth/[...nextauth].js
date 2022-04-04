import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { Client as FaunaClient } from 'faunadb'
import { FaunaAdapter } from '@next-auth/fauna-adapter'

const client = new FaunaClient({
  secret: process.env.FAUNADB_SECRET,
  scheme: 'https',
  domain: 'db.eu.fauna.com',
})

export default NextAuth({
  adapter: FaunaAdapter(client),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const { username, password } = user.loansApiCredentials
        // token.user.scope = user.scope // should return claim called "scope" with value "read:decisions" etc.
        token.x_username = username
        token.x_password = password
        token.x_role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.username = token.x_username
      session.user.password = token.x_password
      session.user.role = token.x_role
      // session.user.scope = user.scope // should return claim called "scope" with value "read:decisions" etc.
      return session
    },
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST, // TODO setup in Vercel
        port: Number(process.env.SMTP_PORT), // TODO setup in Vercel
        auth: {
          user: process.env.SMTP_USER, // TODO setup in vercel
          pass: process.env.SMTP_PASSWORD, // TODO setup in vercel
        },
      },
      from: process.env.SMTP_FROM, // TODO setup in vercel.
    }),
  ],
  session: {
    strategy: 'jwt',
    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },
})