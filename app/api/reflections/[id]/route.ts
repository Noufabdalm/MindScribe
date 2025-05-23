import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
 
    const { id } = await params;

    //Fetch from DB
    const reflection = await sql`
      SELECT id, thought AS title, created_at AS date, reflection AS content, emotion
      FROM reflections
      WHERE id = ${id}
    `;

    if (reflection.length === 0) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 });
    }

    return NextResponse.json(reflection[0], { status: 200 });
  
}
