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
  "/daily-topic"
];

const availableLocales = routing?.locales || ["en", "pt", "es"];

const ALLOWED_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || "https://40dias.zionchurch.org.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization, Accept",
  "Access-Control-Allow-Credentials": "true",
};

export default async function middleware(req: NextRequest) {
  // Handle CORS preflight requests for API routes
  if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({}, { headers: corsHeaders });
  }

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
  matcher: ["/((?!_next|.*\\..*).*)"],
};
