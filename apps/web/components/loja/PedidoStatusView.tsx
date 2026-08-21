import Link from 'next/link';
import { CheckCircle2, Circle, PackageX } from 'lucide-react';
import type { PedidoStatusPublicoDTO, StatusPedido } from '@comandai/shared-types';
import { formatCentavos, formatHorario } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/labels';

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
  pedido,
  slug,
}: {
  pedido: PedidoStatusPublicoDTO;
  slug: string;
}) {
  const passos = pedido.tipoEntrega === 'DELIVERY' ? PASSOS_DELIVERY : PASSOS_RETIRADA;
  const indiceAtual = passos.indexOf(pedido.status);
  const cancelado = pedido.status === 'CANCELADO';

  return (
    <div className="loja-publica min-h-screen bg-[var(--lp-char)] px-4 py-12 text-[var(--lp-paper)]">
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
