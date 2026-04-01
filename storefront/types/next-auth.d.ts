 import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      phone: string;
      is_guest: boolean;
      cart_id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_guest: boolean;
    cart_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    is_guest?: boolean;
    cart_id?: string;
  }
}
