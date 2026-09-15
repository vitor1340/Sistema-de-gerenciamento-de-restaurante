'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Clock, PackageX } from 'lucide-react';
import type { PedidoStatusPublicoDTO, StatusPedido } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { formatCentavos, formatHorario } from '@/lib/format';
import { STATUS_LABEL, STATUS_PAGAMENTO_LABEL } from '@/lib/labels';

const INTERVALO_POLLING_MS = 5000;

const PASSOS_DELIVERY: StatusPedido[] = [
  'NOVO',
  'CONFIRMADO',
  'EM_PREPARO',
  'PRONTO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
];
const PASSOS_RETIRADA: StatusPedido[] = ['NOVO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'];

export function PedidoStatusView({
  pedido: pedidoInicial,
  slug,
}: {
  pedido: PedidoStatusPublicoDTO;
  slug: string;
}) {
  const [pedido, setPedido] = useState(pedidoInicial);

  useEffect(() => {
    if (pedido.pagamento?.status !== 'PENDENTE') return;

    const intervalo = setInterval(() => {
      apiFetch<PedidoStatusPublicoDTO>(`/loja/${slug}/pedidos/${pedido.id}`, undefined)
        .then(setPedido)
        .catch(() => {});
    }, INTERVALO_POLLING_MS);

    return () => clearInterval(intervalo);
  }, [pedido.pagamento?.status, pedido.id, slug]);

  const passos = pedido.tipoEntrega === 'DELIVERY' ? PASSOS_DELIVERY : PASSOS_RETIRADA;
  const indiceAtual = passos.indexOf(pedido.status);
  const cancelado = pedido.status === 'CANCELADO';

  return (
    <div className="loja-publica min-h-dvh bg-[var(--lp-char)] px-4 py-12 text-[var(--lp-paper)]">
      <div className="mx-auto max-w-md">
        <Link
          href={`/loja/${slug}`}
          className="lp-mono text-xs text-[var(--lp-paper-dim)] transition hover:text-[var(--lp-paper)]"
        >
          ← Voltar para a loja
        </Link>

        <div className="mt-4 rounded-sm border-2 border-[var(--lp-paper)] bg-[var(--lp-paper)] p-6 text-[var(--lp-char)]">
          <p className="lp-mono text-xs uppercase tracking-widest text-[var(--lp-char)]/60">
            Pedido
          </p>
          <h1 className="lp-display text-3xl">#{pedido.numero}</h1>
          <p className="mt-1 text-sm text-[var(--lp-char)]/70">
            {pedido.clienteNome} · {formatHorario(pedido.createdAt)}
          </p>

          {pedido.pagamento && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-sm border-2 p-3 text-sm font-semibold ${
                pedido.pagamento.status === 'APROVADO'
                  ? 'border-[var(--lp-chili)] bg-[var(--lp-chili)]/10 text-[var(--lp-chili)]'
                  : pedido.pagamento.status === 'PENDENTE'
                    ? 'border-[var(--lp-char)]/30 text-[var(--lp-char)]/70'
                    : 'border-[var(--lp-char)]/30 text-[var(--lp-char)]/50'
              }`}
            >
              {pedido.pagamento.status === 'APROVADO' ? (
                <CheckCircle2 size={18} className="shrink-0" />
              ) : (
                <Clock size={18} className="shrink-0" />
              )}
              {STATUS_PAGAMENTO_LABEL[pedido.pagamento.status]}
            </div>
          )}

          {cancelado ? (
            <div className="mt-6 flex items-center gap-3 rounded-sm border-2 border-[var(--lp-chili)] bg-[var(--lp-chili)]/10 p-4">
              <PackageX className="shrink-0 text-[var(--lp-chili)]" size={22} />
              <p className="text-sm font-semibold text-[var(--lp-chili)]">
                Este pedido foi cancelado.
              </p>
            </div>
          ) : (
            <ol className="mt-6 space-y-4">
              {passos.map((passo, index) => {
                const concluido = index <= indiceAtual;
                return (
                  <li key={passo} className="flex items-center gap-3">
                    {concluido ? (
                      <CheckCircle2 className="shrink-0 text-[var(--lp-chili)]" size={20} />
                    ) : (
                      <Circle className="shrink-0 text-[var(--lp-char)]/25" size={20} />
                    )}
                    <span
                      className={`text-sm ${
                        concluido ? 'font-semibold text-[var(--lp-char)]' : 'text-[var(--lp-char)]/45'
                      }`}
                    >
                      {STATUS_LABEL[passo]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-6 space-y-2 border-t-2 border-dashed border-[var(--lp-line)] pt-4">
            {pedido.itens.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-[var(--lp-char)]/80">
                  {item.quantidade}x {item.produtoNome}
                </span>
                <span className="lp-mono font-semibold">
                  {formatCentavos(item.precoUnitarioCentavos * item.quantidade)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t-2 border-[var(--lp-line)] pt-4">
            <span className="text-sm font-medium text-[var(--lp-char)]/70">Total</span>
            <span className="lp-mono text-lg font-bold text-[var(--lp-chili)]">
              {formatCentavos(pedido.valorTotalCentavos)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
