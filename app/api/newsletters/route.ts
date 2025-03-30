import { sql } from "@/lib/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// GET all newsletters for logged-in user
export async function GET() {
 
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;

    const newsletters = await sql(`
      SELECT id, user_id, month, status, created_at
      FROM newsletters
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user_id]);

    return NextResponse.json(newsletters, { status: 200 });
}


export async function POST() {
  
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const month = new Date().toLocaleString("default", { month: "long" });

    // 1. Check if newsletter already exists for this user/month
    const existing = await sql(`
      SELECT * FROM newsletters
      WHERE user_id = $1 AND month = $2
      LIMIT 1
    `, [user_id, month]);

    if (existing.length > 0) {
      return NextResponse.json(existing[0], { status: 200 }); 
    }

    // 2. Create new newsletter
    const result = await sql(`
      INSERT INTO newsletters (user_id, month, status)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, month, status, created_at
    `, [user_id, month, "Draft"]);

    return NextResponse.json(result[0], { status: 201 });
}
