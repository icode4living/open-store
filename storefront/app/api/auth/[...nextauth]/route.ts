import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";
import { Customer } from "@/types/customer";



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
           // const apolloClient = createApolloClient();
            const result  = await api.login(credentials.email, credentials.password)
              console.log("login: ", result)
          
          if (!result?.id) return null;

          return {
            id: result.id,
            first_name: result.first_name,
            last_name: result.last_name,
            phone: result.phone,
            is_guest: result.is_guest,
            cart_id: result.cart_id,
           // accessToken: result.token,
          };
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
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone = user.phone;
        token.is_guest = user.is_guest
        token.cart_id = user.cart_id
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.first_name= token.first_name as string;
      session.user.last_name = token.last_name as string;
      session.user.is_guest = token.is_guest as boolean;
      session.user.cart_id = token.cart_id as string;
      session.user.phone = token.phone as string;
      session.user.email = token.email as string;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: '/auth/error'
  },

  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
