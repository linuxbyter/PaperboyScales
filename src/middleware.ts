import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Pass through all requests - auth is handled in server components via auth()
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
