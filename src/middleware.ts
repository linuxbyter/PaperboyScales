import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/login", "/signup"]);
const isAgentRoute = createRouteMatcher(["/agent(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isPublicRoute(req)) {
    if (userId) {
      const url = new URL("/", req.url);
      return Response.redirect(url);
    }
    return;
  }

  if (!userId) {
    const url = new URL("/login", req.url);
    return Response.redirect(url);
  }

  // For agent/admin routes, we check role via DB in server components
  // Middleware just ensures auth exists
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
