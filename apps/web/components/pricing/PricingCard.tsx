'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FaixaPreco } from '@/lib/pricing-data';
import { FeatureListItem } from './FeatureListItem';

interface PricingCardProps {
  titulo: string;
  badge?: string;
  destaque?: boolean;
  descricao?: string;
  preco?: string;
  nota?: string;
  faixas?: FaixaPreco[];
  features?: string[];
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  ctaVariante?: 'solido' | 'contorno';
  rodape?: string;
  onSelectTier?: (faixaId: string) => void;
}

export function PricingCard({
  titulo,
  badge,
  destaque = false,
  descricao,
  preco,
  nota,
  faixas,
  features,
  ctaLabel,
  ctaHref,
  onCtaClick,
  ctaVariante = 'contorno',
  rodape,
  onSelectTier,
}: PricingCardProps) {
  const nomeGrupo = useId();
  const [faixaSelecionadaId, setFaixaSelecionadaId] = useState(faixas?.[0]?.id);
  const faixaSelecionada = faixas?.find((f) => f.id === faixaSelecionadaId);

  function selecionarFaixa(id: string) {
    setFaixaSelecionadaId(id);
    onSelectTier?.(id);
  }

  const textoCta = faixaSelecionada ? `${ctaLabel} — ${faixaSelecionada.preco}` : ctaLabel;

  const classesBotao = cn(
    'w-full rounded-xl py-3 text-sm font-semibold transition-colors',
    ctaVariante === 'solido'
      ? 'bg-terracotta text-white hover:bg-terracotta/90'
      : 'border border-(--pp-ink)/20 text-(--pp-ink) hover:bg-(--pp-ink)/5',
  );

  return (
    <div
      className={cn(
        'relative flex h-full flex-col gap-5 rounded-2xl border bg-white p-7',
        destaque
          ? 'border-terracotta shadow-[0_8px_30px_rgba(193,57,43,0.15)]'
          : 'border-(--pp-ink)/10 shadow-sm',
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold text-(--pp-ink)">{titulo}</h3>
        {descricao && <p className="mt-1.5 text-sm text-(--pp-ink)/70">{descricao}</p>}
      </div>

      {preco && (
        <div>
          <p className="text-3xl font-extrabold text-(--pp-ink)">{preco}</p>
          {nota && <p className="mt-1 text-xs text-(--pp-ink)/60">{nota}</p>}
        </div>
      )}

      {faixas && (
        <div role="radiogroup" aria-label={`Faixas de preço — ${titulo}`} className="flex flex-col gap-2">
          {faixas.map((faixa) => {
            const inputId = `${nomeGrupo}-${faixa.id}`;
            const selecionada = faixa.id === faixaSelecionadaId;

            return (
              <label
                key={faixa.id}
                htmlFor={inputId}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors',
                  selecionada
                    ? 'border-terracotta bg-terracotta/5'
                    : 'border-(--pp-ink)/12 hover:border-(--pp-ink)/25',
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={inputId}
                    name={nomeGrupo}
                    value={faixa.id}
                    checked={selecionada}
                    onChange={() => selecionarFaixa(faixa.id)}
                    className="h-4 w-4 shrink-0 accent-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-(--pp-ink)">
                      {faixa.faixaPedidos}
                    </span>
                    {faixa.rotulo && (
                      <span className="text-xs text-terracotta">{faixa.rotulo}</span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-(--pp-ink)">
                  {faixa.preco}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {features && (
        <ul className="flex flex-col gap-2.5">
          {features.map((texto) => (
            <FeatureListItem key={texto} texto={texto} />
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {ctaHref ? (
          <Link href={ctaHref} className={cn(classesBotao, 'flex items-center justify-center')}>
            {textoCta}
          </Link>
        ) : (
          <button type="button" onClick={onCtaClick} className={classesBotao}>
            {textoCta}
          </button>
        )}
        {rodape && <p className="text-xs text-(--pp-ink)/60">{rodape}</p>}
      </div>
    </div>
  );
}
