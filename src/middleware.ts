import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Se o usuário estiver acessando apenas a raiz do locale (ex: /pt ou /en)
  if (pathname.match(/^\/[a-z]{2}$/)) {
    if (!token) {
      // Não está logado, redireciona para welcome
      const url = new URL(`${pathname}/welcome`, request.url);
      return NextResponse.redirect(url);
    }

    // Está logado, verifica o role
    const isAdmin = token.role === "admin";
    const redirectPath = isAdmin ? "schedule" : "dashboard";
    const url = new URL(`${pathname}/${redirectPath}`, request.url);
    return NextResponse.redirect(url);
  }

  // Para outras rotas, usa o middleware do next-intl
  return intlMiddleware(request);
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)", "/:locale(pt|en|es)"],
};
