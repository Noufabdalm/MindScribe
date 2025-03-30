import { sql } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

    const journalId = params.id;


    //Fetch the journal and its images
    const journal = await sql(`
      SELECT j.*, 
        COALESCE(
          json_agg(ji.image_url) FILTER (WHERE ji.image_url IS NOT NULL), 
          '[]'
        ) AS images
      FROM journals j
      LEFT JOIN journal_images ji ON j.id = ji.journal_id
      WHERE j.id = $1
      GROUP BY j.id
    `, [journalId]);

    if (!journal || journal.length === 0) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json(journal[0], { status: 200 });
  
}
