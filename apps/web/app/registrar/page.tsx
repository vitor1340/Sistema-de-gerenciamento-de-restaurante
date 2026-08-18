'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LoginResponseDTO } from '@comandai/shared-types';
import { setSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function RegistrarPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [nomeRestaurante, setNomeRestaurante] = useState('');
  const [nomeDono, setNomeDono] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeRestaurante, nomeDono, email, senha }),
      });

      if (response.status === 409) {
        setErro('Já existe uma conta com este e-mail.');
        return;
      }
      if (!response.ok) {
        setErro('Não foi possível criar sua conta. Confira os dados e tente novamente.');
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            C
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-ink-primary">Comandaí</p>
            <p className="text-xs text-ink-muted">Parceiros</p>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-semibold text-ink-primary">Criar seu restaurante</h1>
        <p className="mb-6 text-sm text-ink-secondary">
          Leva menos de um minuto. Você já entra direto no painel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nomeRestaurante"
              className="mb-1 block text-sm font-medium text-ink-primary"
            >
              Nome do restaurante
            </label>
            <input
              id="nomeRestaurante"
              type="text"
              required
              value={nomeRestaurante}
              onChange={(e) => setNomeRestaurante(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="nomeDono" className="mb-1 block text-sm font-medium text-ink-primary">
              Seu nome
            </label>
            <input
              id="nomeDono"
              type="text"
              required
              value={nomeDono}
              onChange={(e) => setNomeDono(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-primary">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-ink-primary">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
