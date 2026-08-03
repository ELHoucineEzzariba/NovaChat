import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "novachat-session";
const PROTECTED_PREFIX = "/chat";
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(PROTECTED_PREFIX) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (AUTH_PATHS.includes(pathname) && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register", "/forgot-password"],
};
