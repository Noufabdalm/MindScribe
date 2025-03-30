import { sql } from "@/lib/database";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
 
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, images } = await req.json();
    const user_id = session.user.id;

    const journal = await sql(
      `INSERT INTO journals (user_id, title, content) VALUES ($1, $2, $3) RETURNING id`,
      [user_id, title, content]
    );

    if (!journal || journal.length === 0) {
      throw new Error("Failed to insert journal");
    }

    const journalId = journal[0].id;

    if (Array.isArray(images) && images.length > 0) {
      const values = images.map((url) => `(${journalId}, '${url}')`).join(", ");
      const query = `INSERT INTO journal_images (journal_id, image_url) VALUES ${values}`;

      await sql(query);
    }

    return NextResponse.json({ message: "Journal saved successfully", journalId }, { status: 201 });
  
}

export async function GET() {
  
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = session.user.id;

    // Fetch journals with their images grouped as an array
    const journals = await sql(`
      SELECT j.*, 
        COALESCE(
          json_agg(ji.image_url) FILTER (WHERE ji.image_url IS NOT NULL), 
          '[]'
        ) AS images
      FROM journals j
      LEFT JOIN journal_images ji ON j.id = ji.journal_id
      WHERE j.user_id = $1
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `, [user_id]);

    return NextResponse.json(journals, { status: 200 });
    
}