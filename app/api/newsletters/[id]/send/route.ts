import { sql } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const newsletterId = id;

  const [newsletter] = await sql`
    SELECT * FROM newsletters WHERE id = ${newsletterId}
  `;
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  if (newsletter.status === "Sent") {
    return NextResponse.json({ message: "Already sent" }, { status: 200 });
  }

  const entries = await sql`
    SELECT e.id, e.title, e.content, e.created_at,
      COALESCE(json_agg(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
    FROM newsletter_entries e
    LEFT JOIN newsletter_images i ON i.newsletter_entry_id = e.id
    WHERE e.newsletter_id = ${newsletterId}
    GROUP BY e.id
    ORDER BY e.created_at ASC
  `;

  const mailingList = await sql`
    SELECT email FROM mailing_list
  `;
  const emails = mailingList.map((m) => m.email);

  if (emails.length === 0) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  // Stub for email logic
  console.log(entries);

  for (const email of emails) {
    console.log(`Sending newsletter to ${email}`);
    // await sendEmail(email, html);
  }

  await sql`
    UPDATE newsletters SET status = 'Sent' WHERE id = ${newsletterId}
  `;

  return NextResponse.json({ message: "Newsletter sent" }, { status: 200 });
}
