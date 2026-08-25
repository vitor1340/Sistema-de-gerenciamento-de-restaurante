'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthBrandHeader } from '@/components/shared/AuthBrandHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function RedefinirSenhaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page px-4 text-center">
        <p className="text-sm font-medium text-ink-primary">Link de redefinição inválido.</p>
        <Link href="/esqueci-senha" className="text-sm font-semibold text-brand hover:underline">
          Pedir um novo link
        </Link>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      if (!response.ok) {
        setErro('Este link é inválido ou já expirou. Peça um novo.');
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <AuthBrandHeader />

        {sucesso ? (
          <>
            <h1 className="mb-1 text-xl font-semibold text-ink-primary">Senha redefinida!</h1>
            <p className="mb-6 text-sm text-ink-secondary">
              Já pode entrar com sua nova senha. Vamos te levar pro login em instantes.
            </p>
            <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
              Ir para o login agora
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-ink-primary">Defina uma nova senha</h1>
            <p className="mb-6 text-sm text-ink-secondary">
              Escolha uma senha nova para sua conta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="novaSenha"
                  className="mb-1 block text-sm font-medium text-ink-primary"
                >
                  Nova senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  required
                  minLength={6}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-1 block text-sm font-medium text-ink-primary"
                >
                  Confirmar nova senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  required
                  minLength={6}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {erro && <p className="text-sm text-danger">{erro}</p>}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {carregando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-page px-4">
          <p className="text-sm text-ink-secondary">Carregando...</p>
        </main>
      }
    >
      <RedefinirSenhaConteudo />
    </Suspense>
  );
}
