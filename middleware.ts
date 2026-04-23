import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeSession(cookie: string | undefined) {
  if (!cookie) return null;
  try {
    return JSON.parse(Buffer.from(cookie, "base64url").toString()) as {
      userId: string;
      username: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get("cs_session")?.value);

  if (!session) return NextResponse.next();

  const { role } = session;

  if (role === "CASHIER") {
    if (
      pathname.startsWith("/inventory") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/pos", request.url));
    }
  }

  if (role === "MANAGER") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/pos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|api/).*)"],
};
