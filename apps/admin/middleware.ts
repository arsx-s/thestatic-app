import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("thestatic:admin:session")?.value;

  // Public auth routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protect all admin routes
  if (!token) {
    const url = new URL("/auth/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
