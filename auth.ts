import { neon } from "@neondatabase/serverless";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const sql = neon(process.env.DATABASE_URL!);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email, name, id: googleId } = user; // Google ID

      try {

        // Check EMAIL 
        const existingUser = await sql`
          SELECT id, google_id FROM users WHERE email = ${email}
        `;

        let userId;
        if (existingUser.length > 0) {
          userId = existingUser[0].id;

          // If the stored Google ID is different, update it
          if (!existingUser[0].google_id || existingUser[0].google_id !== googleId) {
            console.log("🔄 Updating Google ID in DB...");
            await sql`
              UPDATE users SET google_id = ${googleId} WHERE id = ${userId}
            `;
          }
        } else {
          // Insert new user if they don’t exist
          const newUser = await sql`
            INSERT INTO users (id, google_id, email, name)
            VALUES (gen_random_uuid(), ${googleId}, ${email}, ${name})
            RETURNING id;
          `;
          userId = newUser[0].id;
        }

        return true;
      } catch (error) {
        return false;
      }
    },

    async session({ session}) {
      if (session.user) {

        const dbUser = await sql`
          SELECT id, google_id, name, email FROM users WHERE email = ${session.user.email}
        `;

        if (dbUser.length > 0) {
          const user = dbUser[0];
          session.user = {
            ...session.user,
            id: user.id,
            google_id: user.google_id,
          };

        } 
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.google_id = user.id as string; 
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
