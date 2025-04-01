import { NextResponse } from "next/server";
import { edgeValidateRequest } from "@/auth/edge";

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;
  
  if (pathname.startsWith("/admin")) {
    const { user } = await edgeValidateRequest();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};