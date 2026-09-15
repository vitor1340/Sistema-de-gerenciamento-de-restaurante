'use client';

import { useEffect, useRef, useState } from 'react';
import type { LojaCategoriaDTO } from '@comandai/shared-types';
import { Z_INDEX_LOJA } from '@/lib/loja-layout';
import { useAlturaMedida } from './use-altura-medida';

export function LojaChipsCategorias({
  categorias,
  alturaHeader,
}: {
  categorias: LojaCategoriaDTO[];
  alturaHeader: number;
}) {
  const { ref: barraRef, altura: alturaChips } = useAlturaMedida('--lp-chips-h');
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(categorias[0]?.id);
  const chipRefs = useRef(new Map<string, HTMLAnchorElement>());
  const visibilidadeRef = useRef(new Map<string, boolean>());

  useEffect(() => {
    if (categorias.length === 0) return;

    const secoes = categorias
      .map((categoria) => document.getElementById(`categoria-${categoria.id}`))
      .filter((elemento): elemento is HTMLElement => elemento !== null);
    if (secoes.length === 0) return;

    // rootMargin negativo no topo = compensa a área coberta pelo header +
    // barra de chips (sticky), senão a seção "conta" como visível ainda
    // escondida atrás deles. -60% no fim evita que a última seção, só por
    // aparecer uma fatia no rodapé da viewport, já vire a ativa.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace('categoria-', '');
          visibilidadeRef.current.set(id, entry.isIntersecting);
        }
        const primeiraVisivel = categorias.find((categoria) =>
          visibilidadeRef.current.get(categoria.id),
        );
        if (primeiraVisivel) {
          setCategoriaAtivaId(primeiraVisivel.id);
        }
      },
      { rootMargin: `-${alturaHeader + alturaChips}px 0px -60% 0px`, threshold: 0 },
    );

    secoes.forEach((secao) => observer.observe(secao));
    return () => observer.disconnect();
  }, [categorias, alturaHeader, alturaChips]);

  useEffect(() => {
    if (!categoriaAtivaId) return;
    chipRefs.current.get(categoriaAtivaId)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [categoriaAtivaId]);

  // Com 0 ou 1 categoria não há nada pra navegar entre — a barra só ocuparia
  // espaço à toa.
  if (categorias.length <= 1) return null;

  return (
    <div
      ref={barraRef as React.RefObject<HTMLDivElement>}
      className="sticky border-b-2 border-[var(--lp-char)]/10 bg-[var(--lp-paper)]"
      style={{ top: 'var(--lp-header-h, 70px)', zIndex: Z_INDEX_LOJA.chips }}
    >
      <nav
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 py-3 pr-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))]"
        aria-label="Categorias do cardápio"
      >
        {categorias.map((categoria) => (
          <a
            key={categoria.id}
            ref={(elemento) => {
              if (elemento) chipRefs.current.set(categoria.id, elemento);
              else chipRefs.current.delete(categoria.id);
            }}
            href={`#categoria-${categoria.id}`}
            onClick={(event) => {
              event.preventDefault();
              document
                .getElementById(`categoria-${categoria.id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`lp-mono shrink-0 snap-start rounded-full border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              categoriaAtivaId === categoria.id
                ? 'border-[var(--lp-accent)] bg-[var(--lp-accent)] text-[var(--lp-char)]'
                : 'border-[var(--lp-char)]/15 text-[var(--lp-char)]/70 hover:border-[var(--lp-char)]/30'
            }`}
          >
            {categoria.nome}
          </a>
        ))}
      </nav>
    </div>
  );
}
