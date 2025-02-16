import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "../auth";

const intlMiddleware = createMiddleware(routing);
const publicPages = ["/", "/welcome"];

export default async function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
  const session = await auth();

  console.log(
    "🔹 Sessão recuperada no middleware:",
    JSON.stringify(session, null, 2)
  ); // 🔹 Log da sessão

  if (!session && !isPublicPage) {
    console.log("❌ Usuário não autenticado. Redirecionando para /welcome");
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  if (
    session &&
    (req.nextUrl.pathname === "/welcome" || req.nextUrl.pathname === "/")
  ) {
    console.log("✅ Usuário autenticado. Redirecionando para /schedule");
    return NextResponse.redirect(new URL("/schedule", req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
