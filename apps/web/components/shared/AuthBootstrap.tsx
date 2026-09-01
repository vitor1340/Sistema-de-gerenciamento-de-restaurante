'use client';

import { useEffect } from 'react';
import type { RefreshResponseDTO } from '@comandai/shared-types';
import { getSessionCookie, setSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';

/**
 * O accessToken não é mais persistido no localStorage (ver auth-store.ts) —
 * ao recarregar a página ele começa null em memória. Este componente
 * reidrata a partir do cookie de sessão (que o middleware já deixa fresco
 * via refresh silencioso) e, se por algum motivo ele não existir, cai para
 * chamar /api/auth/refresh diretamente.
 */
export function AuthBootstrap() {
  const usuario = useAuthStore((state) => state.usuario);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (!usuario || accessToken) return;

    const tokenDoCookie = getSessionCookie();
    if (tokenDoCookie) {
      setAccessToken(tokenDoCookie);
      return;
    }

    let cancelado = false;
    fetch('/api/auth/refresh', { method: 'POST' })
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((dados: RefreshResponseDTO | null) => {
        if (cancelado || !dados?.accessToken) return;
        setAccessToken(dados.accessToken);
        setSessionCookie(dados.accessToken);
      })
      .catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [usuario, accessToken, setAccessToken]);

  return null;
}
