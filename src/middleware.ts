import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "../auth";

const intlMiddleware = createMiddleware(routing);

const publicPages = [
  "/",
  "/login",
  "/leaders-onboarding",
  "/check-in/login",
  "/daily-topic",
];

const availableLocales = routing?.locales || ["en", "pt", "es"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const publicPathnameRegex = RegExp(
    `^/(${availableLocales.join("|")})?(${publicPages.join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(pathname);

  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Erro ao obter a sessão:", error);
  }

  const localeMatch = pathname.match(/^\/(en|pt|es)/);
  const locale = localeMatch ? localeMatch[1] : "pt";

  if (!session && pathname === `/${locale}/login`) {
    return NextResponse.next();
  }

  if (!session && !isPublicPage) {
    const isCheckInPath = pathname.includes("/check-in");
    if (isCheckInPath) {
      return NextResponse.redirect(
        new URL(`/${locale}/check-in/login`, req.url)
      );
    }
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (session && session.user.churchId && pathname === `/${locale}/login`) {
    return NextResponse.redirect(new URL(`/${locale}/schedule`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
