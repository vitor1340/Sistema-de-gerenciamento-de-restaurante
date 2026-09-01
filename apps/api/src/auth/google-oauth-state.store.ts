import { randomBytes } from 'crypto';
import type { Request } from 'express';
import type OAuth2Strategy from 'passport-oauth2';

const STATE_COOKIE = 'google_oauth_state';
const STATE_TTL_MS = 5 * 60 * 1000;
// Cobre tanto /api/auth/google quanto /api/auth/google/callback.
const STATE_COOKIE_PATH = '/api/auth/google';

function parseCookieHeader(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const parte of header.split(';')) {
    const indice = parte.indexOf('=');
    if (indice === -1) continue;
    const nome = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();
    if (nome) cookies[nome] = decodeURIComponent(valor);
  }
  return cookies;
}

type StoreCallback = (err: Error | null, state?: string) => void;
type VerifyCallback = (err: Error | null, ok: boolean, info?: unknown) => void;

/**
 * Substitui o SessionStore padrão do passport-oauth2 (que exige
 * express-session, ausente neste app — a autenticação é stateless via JWT)
 * por um state store baseado num cookie HttpOnly de curta duração: mesma
 * garantia de proteção contra CSRF de login (o valor só existe no navegador
 * de quem de fato iniciou o fluxo), sem precisar de sessão no servidor.
 */
export class GoogleOAuthStateStore implements OAuth2Strategy.StateStore {
  store(req: Request, callback: StoreCallback): void;
  store(
    req: Request,
    meta: OAuth2Strategy.Metadata,
    callback: StoreCallback,
  ): void;
  store(
    req: Request,
    metaOrCallback: OAuth2Strategy.Metadata | StoreCallback,
    callback?: StoreCallback,
  ): void {
    const cb = (callback ?? metaOrCallback) as StoreCallback;
    const res = req.res;
    if (!res) {
      cb(new Error('Resposta HTTP indisponível para gravar o state do OAuth'));
      return;
    }

    const state = randomBytes(24).toString('hex');
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: STATE_TTL_MS,
      path: STATE_COOKIE_PATH,
    });
    cb(null, state);
  }

  verify(req: Request, providedState: string, callback: VerifyCallback): void;
  verify(
    req: Request,
    providedState: string,
    meta: OAuth2Strategy.Metadata,
    callback: VerifyCallback,
  ): void;
  verify(
    req: Request,
    providedState: string,
    metaOrCallback: OAuth2Strategy.Metadata | VerifyCallback,
    callback?: VerifyCallback,
  ): void {
    const cb = (callback ?? metaOrCallback) as VerifyCallback;
    const cookieState = parseCookieHeader(req.headers.cookie)[STATE_COOKIE];
    req.res?.clearCookie(STATE_COOKIE, { path: STATE_COOKIE_PATH });

    if (!cookieState || cookieState !== providedState) {
      cb(null, false, {
        message: 'Parâmetro state inválido, ausente ou expirado',
      });
      return;
    }
    cb(null, true);
  }
}
