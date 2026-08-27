'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginResponseDTO } from '@comandai/shared-types';
import { setSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';
import { AuthBrandHeader } from '@/components/shared/AuthBrandHeader';

function VerificarDoisFatoresConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const tempToken = searchParams.get('tempToken');
  const [codigo, setCodigo] = useState('');
  const [usarBackup, setUsarBackup] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tempToken) return;
    setErro(null);
    setCarregando(true);

    try {
      const response = await fetch('/api/auth/2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, codigo }),
      });

      if (!response.ok) {
        setErro('Código inválido ou expirado.');
        return;
      }

      const data: LoginResponseDTO = await response.json();
      setSessionCookie(data.accessToken);
      setSession(data.usuario, data.accessToken);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  if (!tempToken) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page px-4 text-center">
        <p className="text-sm font-medium text-ink-primary">
          Sessão de verificação inválida ou expirada.
        </p>
        <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
          Voltar para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <AuthBrandHeader />

        <h1 className="mb-1 text-xl font-semibold text-ink-primary">Verificação em duas etapas</h1>
        <p className="mb-6 text-sm text-ink-secondary">
          {usarBackup
            ? 'Informe um dos seus códigos de backup.'
            : 'Informe o código de 6 dígitos do seu aplicativo autenticador.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-ink-primary">
              {usarBackup ? 'Código de backup' : 'Código de verificação'}
            </label>
            <input
              id="codigo"
              type="text"
              inputMode={usarBackup ? 'text' : 'numeric'}
              autoFocus
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder={usarBackup ? 'xxxx-xxxx' : '000000'}
              className="w-full rounded-lg border border-border px-3 py-2 text-center text-lg tracking-widest text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setUsarBackup((atual) => !atual);
            setCodigo('');
            setErro(null);
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-brand hover:underline"
        >
          {usarBackup ? 'Usar código do aplicativo' : 'Usar um código de backup'}
        </button>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function VerificarDoisFatoresPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-page px-4">
          <p className="text-sm text-ink-secondary">Carregando...</p>
        </main>
      }
    >
      <VerificarDoisFatoresConteudo />
    </Suspense>
  );
}
