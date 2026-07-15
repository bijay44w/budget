import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/edit(.*)",
  "/diff(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match edit and diff routes
    '/edit/:path*',
    '/diff/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include Clerk's auto-proxy path
    '/__clerk/:path*',
  ],
};
