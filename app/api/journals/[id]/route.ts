import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";

// ✅ This is the correct typing format for App Router route handlers
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const journalId = parseInt(params.id, 10);
    if (isNaN(journalId)) {
      return NextResponse.json({ error: "Invalid journal ID" }, { status: 400 });
    }

    const result = await sql(`
      SELECT j.*, 
        COALESCE(json_agg(ji.image_url) FILTER (WHERE ji.image_url IS NOT NULL), '[]') AS images
      FROM journals j
      LEFT JOIN journal_images ji ON j.id = ji.journal_id
      WHERE j.id = $1
      GROUP BY j.id
      LIMIT 1
    `, [journalId]);

    if (!result.length) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
