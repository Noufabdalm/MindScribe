import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

const sql = neon(process.env.DATABASE_URL!);


export async function POST(req: Request) {
 
    const session = await auth(); //authenticated user session
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { thought, reflection, emotion } = await req.json();
    const userId = session.user.id; //logged-in user's ID

    if (!reflection || !emotion) {
      return NextResponse.json({ error: "Reflection and emotion are required" }, { status: 400 });
    }

    //Insert into the database
    await sql`
      INSERT INTO reflections (user_id, thought, reflection, emotion, created_at)
      VALUES (${userId}, ${thought || null}, ${reflection}, ${emotion}, NOW())
    `;

    return NextResponse.json({ message: "Reflection saved successfully" }, { status: 201 });

}

export async function GET() {
 
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const reflections = await sql`
      SELECT 
        id, 
        thought AS title, 
        reflection AS description, 
        emotion, 
        to_char(created_at, 'Month DD, YYYY') AS date, 
        to_char(created_at, 'YYYY-MM-DD') AS datetime 
      FROM reflections 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ reflections }, { status: 200 });
 
}
