import { sql } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid journal ID" }, { status: 400 });
    }

    const journal = await sql(`
      SELECT j.*, 
        COALESCE(json_agg(ji.image_url) FILTER (WHERE ji.image_url IS NOT NULL), '[]') AS images
      FROM journals j
      LEFT JOIN journal_images ji ON j.id = ji.journal_id
      WHERE j.id = $1
      GROUP BY j.id
      LIMIT 1
    `, [id]);

    if (!journal.length) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json(journal[0]);
  } catch (err) {
    console.error("Failed to fetch journal:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}