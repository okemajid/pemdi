import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only intercept /api/log routes
  if (request.nextUrl.pathname.startsWith("/api/log")) {
    const accept = request.headers.get("accept") || "";
    const referer = request.headers.get("referer") || "";
    const origin = request.headers.get("origin") || "";

    // Allow same-origin fetch requests (from the Next.js app itself)
    // Block direct browser navigation (Accept: text/html, no referer from the app)
    const isDirectBrowserAccess =
      accept.includes("text/html") &&
      !referer.includes(process.env.APP_URL || "") &&
      !referer.includes("localhost");

    if (isDirectBrowserAccess) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Inject server-side secret for route handler to validate
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-log-secret", process.env.LOG_INTERNAL_SECRET || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
}

export const config = {
  matcher: "/api/log/:path*",
};
