import type { RefreshResponseDTO } from '@comandai/shared-types';
import { clearSessionCookie, setSessionCookie } from './auth-cookie';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Evita que múltiplas requisições que expiram ao mesmo tempo disparem
// refreshes concorrentes: como o refresh token roda em rotação (cada uso
// invalida o anterior), duas chamadas simultâneas fariam a segunda ser
// tratada como reuso de token revogado e derrubaria a sessão inteira.
let refreshEmAndamento: Promise<string | null> | null = null;

function renovarAccessToken(): Promise<string | null> {
  if (!refreshEmAndamento) {
    refreshEmAndamento = (async () => {
      try {
        const resposta = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!resposta.ok) return null;
        const dados: RefreshResponseDTO & { accessToken: string } = await resposta.json();
        useAuthStore.getState().setAccessToken(dados.accessToken);
        setSessionCookie(dados.accessToken);
        return dados.accessToken;
      } catch {
        return null;
      } finally {
        refreshEmAndamento = null;
      }
    })();
  }
  return refreshEmAndamento;
}

function encerrarSessaoExpirada() {
  useAuthStore.getState().clearSession();
  clearSessionCookie();
}

export async function apiFetch<T>(
  path: string,
  token: string | undefined,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (response.status === 401 && typeof window !== 'undefined' && token) {
    const novoToken = await renovarAccessToken();
    if (novoToken) {
      return apiFetch<T>(path, novoToken, init);
    }
    encerrarSessaoExpirada();
  }

  if (!response.ok) {
    throw new ApiError(`Falha ao chamar ${path} (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  token: string | undefined,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    cache: 'no-store',
  });

  if (response.status === 401 && typeof window !== 'undefined' && token) {
    const novoToken = await renovarAccessToken();
    if (novoToken) {
      return apiUpload<T>(path, novoToken, formData);
    }
    encerrarSessaoExpirada();
  }

  if (!response.ok) {
    throw new ApiError(`Falha ao chamar ${path} (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}
