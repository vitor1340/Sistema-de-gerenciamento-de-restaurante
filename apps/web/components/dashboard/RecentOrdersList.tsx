import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import type { PedidoResumoDTO } from '@comandai/shared-types';
import { formatCentavos, formatHorario } from '@/lib/format';
import { TIPO_ENTREGA_LABEL } from '@/lib/labels';
import { OrderStatusBadge } from './OrderStatusBadge';

export function RecentOrdersList({ pedidos }: { pedidos: PedidoResumoDTO[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-primary">Pedidos recentes</p>
          <p className="text-xs text-ink-secondary">Atualizado em tempo real</p>
        </div>
        <Link href="/pedidos" className="text-xs font-semibold text-brand hover:underline">
          Ver todos →
        </Link>
      </div>

      <ul className="space-y-1">
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link
              href="/pedidos"
              className="flex items-center justify-between rounded-xl px-2 py-2.5 transition hover:bg-page"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-primary">
                    #{pedido.numero} · {pedido.clienteNome}
                  </p>
                  <p className="text-xs text-ink-secondary">
                    {pedido.itensCount} {pedido.itensCount === 1 ? 'item' : 'itens'} ·{' '}
                    {TIPO_ENTREGA_LABEL[pedido.tipoEntrega]} · {formatHorario(pedido.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-ink-primary">
                  {formatCentavos(pedido.valorTotalCentavos)}
                </span>
                <OrderStatusBadge status={pedido.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
