import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { api } from "@/lib/api";
import type { Customer } from "@/types/customer";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_guest: boolean;
  cart_id: string;
};

const buildName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = (await api.login(
            credentials.email,
            credentials.password
          )) as Customer;

          if (!result?.id || !result?.email) {
            return null;
          }

          return {
            id: result.id,
            email: result.email,
            name: buildName(result.first_name, result.last_name),
            first_name: result.first_name ?? "",
            last_name: result.last_name ?? "",
            phone: result.phone ?? "",
            is_guest: Boolean(result.is_guest),
            cart_id: result.cart_id ?? "",
          } satisfies AuthUser;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;

        token.sub = authUser.id;
        token.id = authUser.id;
        token.email = authUser.email;
        token.name = authUser.name;
        token.first_name = authUser.first_name;
        token.last_name = authUser.last_name;
        token.phone = authUser.phone;
        token.is_guest = authUser.is_guest;
        token.cart_id = authUser.cart_id;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token.id as string) ?? token.sub ?? "",
        email: (token.email as string | null | undefined) ?? null,
        name:
          (token.name as string | undefined) ??
          buildName(
            token.first_name as string | undefined,
            token.last_name as string | undefined
          ),
        first_name: (token.first_name as string | undefined) ?? "",
        last_name: (token.last_name as string | undefined) ?? "",
        phone: (token.phone as string | undefined) ?? "",
        is_guest: Boolean(token.is_guest),
        cart_id: (token.cart_id as string | undefined) ?? "",
      };

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
