// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (
          user &&
          bcrypt.compareSync(credentials.password as string, user.password)
        ) {
          // The authorize function now returns the role directly on the user object.
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The user object here is what's returned from the authorize function.
      if (user) {
        token.id = user.id;
        // Make sure to correctly assign the role from the user object.
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // The session object is updated with the data from the token.
      if (token) {
        session.user.id = token.id as string;
        // The role is now correctly taken from the token.
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
