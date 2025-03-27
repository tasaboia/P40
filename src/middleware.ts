import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "../auth";

const intlMiddleware = createMiddleware(routing);
const publicPages = ["/", "/login", "/leaders-onboarding", "/check-in/login"];

const availableLocales = routing?.locales || ["en", "pt", "es"];

export default async function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^/(${availableLocales.join("|")})?(${publicPages.join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("⚠ Erro ao obter a sessão:", error);
  }

  const localeMatch = req.nextUrl.pathname.match(/^\/(en|pt|es)/);
  const locale = localeMatch ? localeMatch[1] : "pt"; // Se não achar, assume "pt"

  if (!session && req.nextUrl.pathname === `/${locale}/login`) {
    return NextResponse.next();
  }

  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (
    session &&
    session.user.churchId &&
    req.nextUrl.pathname === `/${locale}/login`
  ) {
    return NextResponse.redirect(new URL(`/${locale}/schedule`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
