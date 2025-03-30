import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Define protected routes
const protectedRoutes = ["/today", "/journals", "/reflections", "/friends-newsletter"];

export async function middleware(req: Request) {
  const session = await auth();
  const { pathname } = new URL(req.url);

  // Redirect authenticated users trying to access "/sign-in" to "/today"
  if (session && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/today", req.url));
  }

  // Redirect unauthenticated users from protected routes to "/sign-in"
  if (!session && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Exclude API, static files
};
