import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "paperboy-network-secret-change-in-production"
);

const publicPaths = ["/", "/login", "/signup", "/agent/signup", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (including auth API) without auth
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For API routes, return 401 instead of redirecting
  if (pathname.startsWith("/api")) {
    const token = request.cookies.get("pb_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return jwtVerify(token, secret)
      .then(() => NextResponse.next())
      .catch(() => {
        const res = new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
        return res;
      });
  }

  // For pages, redirect to login if not authenticated
  const token = request.cookies.get("pb_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return jwtVerify(token, secret)
    .then(() => NextResponse.next())
    .catch(() => {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("pb_session");
      return res;
    });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
