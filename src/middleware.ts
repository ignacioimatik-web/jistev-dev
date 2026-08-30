import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidCookie } from "@/lib/gate";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and its auth/logout endpoints through.
  if (
    pathname === "/correo/login" ||
    pathname === "/api/correo/auth" ||
    pathname === "/api/correo/logout"
  ) {
    return NextResponse.next();
  }

  const isProtected =
    pathname === "/correo" || pathname.startsWith("/api/correo/");

  if (isProtected) {
    const ok = await isValidCookie(req.cookies.get(COOKIE_NAME)?.value);
    if (!ok) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/correo/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/correo", "/correo/login", "/api/correo/:path*"],
};