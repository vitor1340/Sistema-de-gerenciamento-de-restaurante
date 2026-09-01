export const SESSION_COOKIE = 'comandai_session';

export function setSessionCookie(token: string) {
  const maxAgeSeconds = 60 * 15; // 15min, alinhado ao JWT_EXPIRES_IN do backend
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function getSessionCookie(): string | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}
