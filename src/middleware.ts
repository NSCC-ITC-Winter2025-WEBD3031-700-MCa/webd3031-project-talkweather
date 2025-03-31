import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;
  
  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    
    if (!sessionId) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const { user } = await lucia.validateSession(sessionId);
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};