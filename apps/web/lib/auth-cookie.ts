export const SESSION_COOKIE = 'comandai_session';

export function setSessionCookie(token: string) {
  const maxAgeSeconds = 60 * 60 * 8; // 8h, alinhado ao JWT_EXPIRES_IN do backend
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
