import 'server-only';

export const REFRESH_COOKIE = 'comandai_refresh';
// Precisa ser '/', não '/api/auth': o middleware (`proxy.ts`) checa a
// PRESENÇA desse cookie em toda navegação do site (/dashboard, /pedidos...)
// pra saber se o usuário tem sessão. Um cookie com Path=/api/auth só é
// enviado pelo navegador em requisições pra esse path — o middleware nunca
// o veria fora dali, e todo login pareceria "não funcionar" (redireciona de
// volta pro /login assim que a navegação sai de /api/auth). O cookie
// continua HttpOnly, então o valor em si segue inacessível a JS/XSS.
const REFRESH_COOKIE_PATH = '/';
// Deve acompanhar REFRESH_TOKEN_TTL_DIAS do backend (apps/api/.env) — só
// controla quando o navegador descarta o cookie sozinho, a expiração real é
// sempre validada pelo backend.
const REFRESH_TOKEN_TTL_DIAS = 30;

// Estrutura mínima compartilhada por `cookies()` (Route Handlers) e
// `NextResponse.cookies` (Middleware) — os dois aceitam essa mesma chamada.
export interface CookieWriter {
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      path?: string;
      maxAge?: number;
    },
  ): void;
}

export function setRefreshCookie(cookieStore: CookieWriter, refreshToken: string) {
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: 60 * 60 * 24 * REFRESH_TOKEN_TTL_DIAS,
  });
}

export function clearRefreshCookie(cookieStore: CookieWriter) {
  cookieStore.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
}
