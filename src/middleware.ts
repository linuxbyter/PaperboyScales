import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "paperboy-network-secret-change-in-production"
);

const publicPaths = ["/login", "/signup", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("pb_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT edge-compatible
  return jwtVerify(token, secret)
    .then(() => NextResponse.next())
    .catch(() => {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("pb_session");
      return response;
    });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
