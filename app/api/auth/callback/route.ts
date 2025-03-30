import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Function to wait before retrying
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET() {
  try {
    let session = null;
    let attempts = 3; // Retry 3 times
    let delayTime = 500; // Start with 500ms delay

    // Retry fetching the session a few times
    while (attempts > 0) {
      session = await auth();
      if (session?.user?.email && session?.user?.name) break; 
      attempts--;
      await delay(delayTime); // Wait before retrying
      delayTime *= 2; 
    }

    if (!session || !session.user?.email || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized - No active session" }, { status: 401 });
    }

    const { email, name } = session.user;
    const googleId = session.user.google_id || session.user.id;

    if (!googleId) {
      return NextResponse.json({ error: "Google ID missing" }, { status: 400 });
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE google_id = ${googleId}
    `;

    let userId;
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const newUser = await sql`
        INSERT INTO users (google_id, email, name)
        VALUES (${googleId}, ${email}, ${name})
        ON CONFLICT (google_id) DO NOTHING
        RETURNING id;
      `;

      if (newUser.length === 0) {
        const fetchedUser = await sql`
          SELECT id FROM users WHERE google_id = ${googleId}
        `;
        userId = fetchedUser[0]?.id;
      } else {
        userId = newUser[0].id;
      }
    }

    return NextResponse.json({ message: "User authenticated", userId }, { status: 200 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user"},
      { status: 500 }
    );
  }
}
