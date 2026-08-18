import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from './lib/auth-cookie';

const ROTAS_PUBLICAS = ['/login', '/registrar'];
const PREFIXO_LOJA_PUBLICA = '/loja/';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(PREFIXO_LOJA_PUBLICA)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const rotaPublica = ROTAS_PUBLICAS.includes(pathname);

  if (!hasSession && !rotaPublica) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && rotaPublica) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
