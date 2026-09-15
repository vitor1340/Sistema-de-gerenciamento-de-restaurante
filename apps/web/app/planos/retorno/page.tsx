'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import type { AssinaturaAtualDTO } from '@comandai/shared-types';
import { Logo } from '@/components/shared/Logo';
import { apiFetch } from '@/lib/api-client';
import { obterTokenValido } from '@/lib/client-token';

const INTERVALO_POLLING_MS = 2000;
const TIMEOUT_MS = 30_000;

type Fase = 'processando' | 'confirmado' | 'demorando' | 'erro';

// O back_url do Mercado Pago só devolve o usuário aqui — não confirma nada
// por si só. Quem confirma de verdade é o webhook de assinatura, então esta
// página faz um polling curto em /assinaturas/atual até ver ACTIVE.
export default function RetornoAssinaturaPage() {
  const [fase, setFase] = useState<Fase>('processando');

  useEffect(() => {
    let cancelado = false;
    const inicio = Date.now();

    async function verificar() {
      const token = await obterTokenValido();
      if (!token) {
        if (!cancelado) setFase('erro');
        return;
      }

      try {
        const assinatura = await apiFetch<AssinaturaAtualDTO>('/assinaturas/atual', token);
        if (cancelado) return;

        if (assinatura.statusAssinatura === 'ACTIVE') {
          setFase('confirmado');
          return;
        }

        if (Date.now() - inicio > TIMEOUT_MS) {
          setFase('demorando');
          return;
        }

        setTimeout(() => void verificar(), INTERVALO_POLLING_MS);
      } catch {
        if (!cancelado) setFase('erro');
      }
    }

    void verificar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="pricing-page flex min-h-screen flex-col items-center justify-center bg-(--pp-bg) px-4 py-16 text-center">
      <div className="mb-6 flex items-center gap-2.5">
        <Logo className="h-10 w-10" />
        <span className="text-xl font-bold text-(--pp-ink)">Comandaí</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-(--pp-ink)/10 bg-white p-8">
        {fase === 'processando' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-terracotta" size={32} />
            <h1 className="text-lg font-bold text-(--pp-ink)">Confirmando sua assinatura…</h1>
            <p className="mt-2 text-sm text-(--pp-ink)/70">
              Isso costuma levar só alguns segundos.
            </p>
          </>
        )}

        {fase === 'confirmado' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-terracotta" size={32} />
            <h1 className="text-lg font-bold text-(--pp-ink)">Assinatura confirmada!</h1>
            <p className="mt-2 text-sm text-(--pp-ink)/70">
              Seu plano Pro já está ativo. Bom trabalho por aí!
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white hover:bg-terracotta/90"
            >
              Ir para o painel
            </Link>
          </>
        )}

        {fase === 'demorando' && (
          <>
            <Clock className="mx-auto mb-4 text-(--pp-ink)/50" size={32} />
            <h1 className="text-lg font-bold text-(--pp-ink)">Ainda processando</h1>
            <p className="mt-2 text-sm text-(--pp-ink)/70">
              O Mercado Pago pode levar mais alguns minutos pra confirmar. Confira novamente em
              instantes.
            </p>
            <Link
              href="/configuracoes"
              className="mt-6 inline-block w-full rounded-xl border border-(--pp-ink)/20 py-3 text-sm font-semibold text-(--pp-ink) hover:bg-(--pp-ink)/5"
            >
              Ver em Configurações
            </Link>
          </>
        )}

        {fase === 'erro' && (
          <>
            <h1 className="text-lg font-bold text-(--pp-ink)">Não foi possível confirmar</h1>
            <p className="mt-2 text-sm text-(--pp-ink)/70">
              Faça login novamente para ver o status da sua assinatura.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white hover:bg-terracotta/90"
            >
              Ir para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
