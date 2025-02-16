import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "../auth";

const intlMiddleware = createMiddleware(routing);
const publicPages = ["/", "/welcome"];

export default async function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^/(${routing.locales.join("|")})?(${publicPages.join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
  const session = await auth();

  const localeMatch = req.nextUrl.pathname.match(/^\/(en|pt|es)/);
  const locale = localeMatch ? localeMatch[1] : "pt"; // Se não achar, assume "pt"

  if (!session && req.nextUrl.pathname === `/${locale}/welcome`) {
    return NextResponse.next();
  }

  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL(`/${locale}/welcome`, req.url));
  }

  if (session && req.nextUrl.pathname === `/${locale}/welcome`) {
    return NextResponse.redirect(new URL(`/${locale}/schedule`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
