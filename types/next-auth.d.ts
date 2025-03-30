import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      google_id: string;
    };
  }

  interface User extends DefaultUser {
    google_id: string;
  }
}
