import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;
  const pathname = req.nextUrl.pathname;

  const protectedPaths = {
    ADMIN: ["/admin"],
    TEACHER: ["/teacher"],
    STUDENT: ["/student"],
  };

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/api/register",
  ];

  // Redirect unauthenticated users trying to access protected routes
  if (!token && !publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access control
  if (token) {
    // Admin-only paths
    if (
      protectedPaths.ADMIN.some((p) => pathname.startsWith(p)) &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Teacher-only paths (admins can also access)
    if (
      protectedPaths.TEACHER.some((p) => pathname.startsWith(p)) &&
      !["ADMIN", "TEACHER"].includes(role || "")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Student-only paths
    if (
      protectedPaths.STUDENT.some((p) => pathname.startsWith(p)) &&
      role !== "STUDENT"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|register|login).*)"],
};
