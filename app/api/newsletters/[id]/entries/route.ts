import { sql } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const newsletterId = parseInt(id, 10);

  if (isNaN(newsletterId)) {
    return NextResponse.json({ error: "Invalid newsletter ID" }, { status: 400 });
  }

  const { title, content, images } = await req.json();

  // 1. Insert entry
  const entryResult = await sql(
    `
    INSERT INTO newsletter_entries (newsletter_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING id, title, content, created_at
  `,
    [newsletterId, title, content]
  );

  const entry = entryResult[0];

  // 2. Insert images (if any)
  if (images && Array.isArray(images)) {
    for (const imageUrl of images) {
      await sql(
        `
        INSERT INTO newsletter_images (newsletter_entry_id, image_url)
        VALUES ($1, $2)
      `,
        [entry.id, imageUrl]
      );
    }
  }

  return NextResponse.json({ ...entry, images }, { status: 201 });
}

// Fetch all entries for a newsletter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const newsletterId = parseInt(id, 10);

  if (isNaN(newsletterId)) {
    return NextResponse.json({ error: "Invalid newsletter ID" }, { status: 400 });
  }

  const entries = await sql(
    `
    SELECT 
      e.id, e.title, e.content, e.created_at,
      COALESCE(json_agg(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
    FROM newsletter_entries e
    LEFT JOIN newsletter_images i ON e.id = i.newsletter_entry_id
    WHERE e.newsletter_id = $1
    GROUP BY e.id
    ORDER BY e.created_at ASC
  `,
    [newsletterId]
  );

  return NextResponse.json(entries, { status: 200 });
}