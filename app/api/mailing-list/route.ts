import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";
import { auth } from "@/auth"; 

// Get all emails for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT email FROM mailing_list WHERE user_id = ${session.user.id}
    `;

    const emails = result.map((row) => row.email);
    return NextResponse.json(emails, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mailing list" }, { status: 500 });
  }
}

// Add an email
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sql`
      INSERT INTO mailing_list (user_id, email)
      VALUES (${session.user.id}, ${email})
      ON CONFLICT (email) DO NOTHING
    `;

    return NextResponse.json({ message: "Email added" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 });
  }
}

// Remove an email
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sql`
      DELETE FROM mailing_list
      WHERE user_id = ${session.user.id} AND email = ${email}
    `;

    return NextResponse.json({ message: "Email removed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove email" }, { status: 500 });
  }
}
