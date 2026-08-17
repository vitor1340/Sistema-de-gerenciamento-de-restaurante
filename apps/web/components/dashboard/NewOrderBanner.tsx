import Link from 'next/link';
import { Bell } from 'lucide-react';
import type { DashboardSummaryDTO } from '@comandai/shared-types';
import { formatCentavos } from '@/lib/format';

export function NewOrderBanner({
  pedido,
}: {
  pedido: NonNullable<DashboardSummaryDTO['ultimoPedidoNovo']>;
}) {
  return (
    <Link
      href="/pedidos"
      className="mb-6 flex items-center justify-between rounded-2xl border border-brand/20 bg-brand-soft px-5 py-4 transition hover:opacity-90"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
          <Bell size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-primary">Novo pedido recebido!</p>
          <p className="text-xs text-ink-secondary">
            #{pedido.numero} · {pedido.clienteNome} · {formatCentavos(pedido.valorTotalCentavos)}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-brand">Ver pedido →</span>
    </Link>
  );
}
