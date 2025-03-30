import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid journal ID" }, { status: 400 });
    }

    const journalId = parseInt(id, 10);

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
