'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginResponseDTO } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { setSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';

function GoogleCallbackConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const codigo = searchParams.get('code');
  const [erro, setErro] = useState(false);
  // O código só pode ser trocado uma vez; em dev o React (Strict Mode) roda
  // o efeito duas vezes de propósito, então essa trava precisa sobreviver a
  // isso — um estado normal seria resetado entre as duas execuções.
  const jaTentou = useRef(false);

  useEffect(() => {
    if (!codigo || jaTentou.current) return;
    jaTentou.current = true;

    async function trocarCodigo() {
      try {
        const data = await apiFetch<LoginResponseDTO>('/auth/google/exchange', undefined, {
          method: 'POST',
          body: JSON.stringify({ codigo }),
        });
        setSessionCookie(data.accessToken);
        setSession(data.usuario, data.accessToken);
        router.replace('/dashboard');
        router.refresh();
      } catch {
        setErro(true);
      }
    }

    trocarCodigo();
  }, [codigo, router, setSession]);

  if (erro || !codigo) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page px-4 text-center">
        <p className="text-sm font-medium text-ink-primary">
          Não foi possível concluir o login com Google.
        </p>
        <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
          Voltar para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <p className="text-sm text-ink-secondary">Entrando com Google...</p>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-page px-4">
          <p className="text-sm text-ink-secondary">Entrando com Google...</p>
        </main>
      }
    >
      <GoogleCallbackConteudo />
    </Suspense>
  );
}
