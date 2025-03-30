import { sql } from "@/lib/database";
import { NextResponse } from "next/server";

// Get all users
export async function GET() {
 
    const users = await sql(`SELECT * FROM users`);
    return NextResponse.json(users, { status: 200 });
  
}
