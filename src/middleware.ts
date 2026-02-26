import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/questionnaire",
  "/plan",
  "/nutrition",
  "/mental-health",
];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r),
  );
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/questionnaire/:path*",
    "/plan/:path*",
    "/nutrition/:path*",
    "/mental-health/:path*",
    "/auth/:path*",
  ],
};
