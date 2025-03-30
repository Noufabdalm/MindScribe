import { sql } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const newsletterId = params.id;

  try {
    // 1. Check if newsletter exists
    const [newsletter] = await sql`
      SELECT * FROM newsletters WHERE id = ${newsletterId}
    `;
    if (!newsletter) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }

    if (newsletter.status === "Sent") {
      return NextResponse.json({ message: "Already sent" }, { status: 200 });
    }

    // 2. Get entries
    const entries = await sql`
      SELECT e.id, e.title, e.content, e.created_at,
        COALESCE(json_agg(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
      FROM newsletter_entries e
      LEFT JOIN newsletter_images i ON i.newsletter_entry_id = e.id
      WHERE e.newsletter_id = ${newsletterId}
      GROUP BY e.id
      ORDER BY e.created_at ASC
    `;

    // 3. Get mailing list
    const mailingList = await sql`
      SELECT email FROM mailing_list
    `;
    const emails = mailingList.map((m) => m.email);

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // 4. Email
    const html = `
      <h1>${newsletter.month} Newsletter</h1>
      <p>Here's what happened this month !</p>
      ${entries
        .map(
          (e) => `
        <hr />
        <h2>${e.title}</h2>
        <p>${e.content}</p>
        ${
          e.images.length > 0
            ? e.images.map((img: string) => `<img src="${img}" style="max-width: 100%; border-radius: 8px;" />`).join("")
            : ""
        }
      `
        )
        .join("")}
    `;

    // 5. Send Emails (not implemented)
    for (const email of emails) {
      console.log(` Sending newsletter to ${email}`);
      // await sendEmail(email, html);
    }

    // 6. Update newsletter status
    await sql`
      UPDATE newsletters SET status = 'Sent' WHERE id = ${newsletterId}
    `;

    return NextResponse.json({ message: "Newsletter sent" }, { status: 200 });
  } 
  catch (err) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
