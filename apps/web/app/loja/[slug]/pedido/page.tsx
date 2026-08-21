'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import type { PedidoStatusPublicoDTO } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { obterPedidosLocais } from '@/lib/pedidos-locais';
import { formatCentavos, formatHorario } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/labels';

export default function MeusPedidosPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [pedidos, setPedidos] = useState<PedidoStatusPublicoDTO[] | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const ids = obterPedidosLocais(slug);
      const resultados = await Promise.all(
        ids.map((id) =>
          apiFetch<PedidoStatusPublicoDTO>(`/loja/${slug}/pedidos/${id}`, undefined).catch(
            () => null,
          ),
        ),
      );
      if (!cancelado) {
        setPedidos(resultados.filter((p): p is PedidoStatusPublicoDTO => p !== null));
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  return (
    <div className="loja-publica min-h-screen bg-[var(--lp-char)] px-4 py-12 text-[var(--lp-paper)]">
      <div className="mx-auto max-w-md">
        <Link
          href={`/loja/${slug}`}
          className="lp-mono text-xs text-[var(--lp-paper-dim)] transition hover:text-[var(--lp-paper)]"
        >
          ← Voltar para a loja
        </Link>

        <h1 className="lp-display mt-4 text-2xl">Meus pedidos</h1>
        <p className="mt-1 text-sm text-[var(--lp-paper-dim)]">Pedidos feitos neste navegador.</p>

        {pedidos === null ? (
          <p className="mt-8 text-sm text-[var(--lp-paper-dim)]">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-sm border-2 border-dashed border-[var(--lp-paper-dim)] p-8 text-center">
            <ClipboardList className="mb-2 text-[var(--lp-paper-dim)]" size={24} />
            <p className="text-sm text-[var(--lp-paper-dim)]">
              Nenhum pedido encontrado neste navegador ainda.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {pedidos.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/loja/${slug}/pedido/${pedido.id}`}
                className="block rounded-sm border-2 border-[var(--lp-paper)] bg-[var(--lp-paper)] p-4 text-[var(--lp-char)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="lp-display text-lg">#{pedido.numero}</span>
                  <span className="lp-mono text-sm font-bold text-[var(--lp-chili)]">
                    {formatCentavos(pedido.valorTotalCentavos)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-[var(--lp-char)]/60">
                  <span>{formatHorario(pedido.createdAt)}</span>
                  <span className="font-semibold">{STATUS_LABEL[pedido.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
