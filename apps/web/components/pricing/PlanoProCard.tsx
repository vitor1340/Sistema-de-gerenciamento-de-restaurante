'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IniciarAssinaturaResponseDTO } from '@comandai/shared-types';
import { ApiError, apiFetch } from '@/lib/api-client';
import { obterTokenValido } from '@/lib/client-token';
import { FAIXA_ID_PARA_ENUM, planoPro } from '@/lib/pricing-data';
import { useAuthStore } from '@/store/auth-store';
import { PricingCard } from './PricingCard';

export function PlanoProCard() {
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);
  const [faixaId, setFaixaId] = useState(planoPro.faixas[0]?.id);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function assinar() {
    if (carregando) return;
    const faixa = faixaId ? FAIXA_ID_PARA_ENUM[faixaId] : undefined;
    if (!faixa) return;

    setErro(null);
    setCarregando(true);
    try {
      const token = await obterTokenValido();
      if (!token) {
        router.push('/login');
        return;
      }
      const resultado = await apiFetch<IniciarAssinaturaResponseDTO>(
        '/assinaturas',
        token,
        { method: 'POST', body: JSON.stringify({ faixa }) },
      );
      window.location.href = resultado.initPoint;
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof ApiError && erroRequisicao.status === 409
          ? 'Você já tem uma assinatura em andamento — veja em Configurações.'
          : 'Não foi possível iniciar a assinatura agora. Tente novamente em instantes.',
      );
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <PricingCard
        titulo="Pro"
        badge="Recomendado"
        destaque
        descricao={planoPro.descricao}
        faixas={planoPro.faixas}
        ctaLabel={carregando ? 'Redirecionando…' : planoPro.cta}
        ctaVariante="solido"
        rodape={planoPro.rodape}
        onSelectTier={setFaixaId}
        {...(usuario ? { onCtaClick: assinar } : { ctaHref: '/registrar' })}
      />
      {erro && <p className="text-center text-sm text-terracotta">{erro}</p>}
    </div>
  );
}
