import type { RefreshResponseDTO } from '@comandai/shared-types';
import { getSessionCookie, setSessionCookie } from './auth-cookie';
import { useAuthStore } from '@/store/auth-store';

// Usado por componentes client que precisam de um access token fora do
// fluxo normal de apiFetch (ex.: antes de redirecionar pro checkout do
// Mercado Pago) — mesma cadeia de fallback do AuthBootstrap: memória ->
// cookie de sessão -> refresh silencioso.
export async function obterTokenValido(): Promise<string | null> {
  const tokenEmMemoria = useAuthStore.getState().accessToken;
  if (tokenEmMemoria) return tokenEmMemoria;

  const tokenDoCookie = getSessionCookie();
  if (tokenDoCookie) return tokenDoCookie;

  const resposta = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!resposta.ok) return null;
  const dados: RefreshResponseDTO = await resposta.json();
  useAuthStore.getState().setAccessToken(dados.accessToken);
  setSessionCookie(dados.accessToken);
  return dados.accessToken;
}
