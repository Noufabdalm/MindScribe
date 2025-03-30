import { sql } from "@/lib/database";
import { NextResponse } from "next/server";

// Get all users
export async function GET() {
  try {
    const users = await sql(`SELECT * FROM users`);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}
