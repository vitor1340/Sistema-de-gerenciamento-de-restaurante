'use client';

import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { PedidoResumoDTO, StatusPedido } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatCentavos, formatHorario } from '@/lib/format';
import {
  ACAO_STATUS_LABEL,
  STATUS_LABEL,
  TIPO_ENTREGA_LABEL,
  TRANSICOES_STATUS_PEDIDO,
} from '@/lib/labels';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

const ABAS: { label: string; status: StatusPedido | 'TODOS' }[] = [
  { label: 'Todos', status: 'TODOS' },
  ...(Object.keys(STATUS_LABEL) as StatusPedido[]).map((status) => ({
    label: STATUS_LABEL[status],
    status,
  })),
];

export function PedidosManager({ pedidosIniciais }: { pedidosIniciais: PedidoResumoDTO[] }) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [abaAtiva, setAbaAtiva] = useState<StatusPedido | 'TODOS'>('TODOS');
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [erroId, setErroId] = useState<string | null>(null);

  const pedidosFiltrados = useMemo(
    () => (abaAtiva === 'TODOS' ? pedidos : pedidos.filter((p) => p.status === abaAtiva)),
    [pedidos, abaAtiva],
  );

  async function avancarStatus(pedido: PedidoResumoDTO, novoStatus: StatusPedido) {
    setAtualizandoId(pedido.id);
    setErroId(null);
    try {
      const atualizado = await apiFetch<{ status: StatusPedido }>(
        `/pedidos/${pedido.id}/status`,
        token,
        { method: 'PATCH', body: JSON.stringify({ status: novoStatus }) },
      );
      setPedidos((atual) =>
        atual.map((p) => (p.id === pedido.id ? { ...p, status: atualizado.status } : p)),
      );
    } catch {
      setErroId(pedido.id);
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-primary">Pedidos</h1>
        <p className="text-sm text-ink-secondary">Acompanhe e avance o status dos pedidos.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {ABAS.map((aba) => (
          <button
            key={aba.status}
            onClick={() => setAbaAtiva(aba.status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              abaAtiva === aba.status
                ? 'border-brand bg-brand text-white'
                : 'border-border text-ink-secondary hover:bg-page'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
          <ClipboardList className="mb-2 text-ink-muted" size={24} />
          <p className="text-sm font-medium text-ink-primary">Nenhum pedido aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((pedido) => {
            const proximos = TRANSICOES_STATUS_PEDIDO[pedido.status];
            return (
              <div
                key={pedido.id}
                className="rounded-2xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-ink-primary">
                    #{pedido.numero} · {pedido.clienteNome}
                  </p>
                  <p className="text-xs text-ink-secondary">
                    {pedido.itensCount} {pedido.itensCount === 1 ? 'item' : 'itens'} ·{' '}
                    {TIPO_ENTREGA_LABEL[pedido.tipoEntrega]} · {formatHorario(pedido.createdAt)} ·{' '}
                    {formatCentavos(pedido.valorTotalCentavos)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
                  <OrderStatusBadge status={pedido.status} />
                  {proximos.map((status) => (
                    <button
                      key={status}
                      onClick={() => avancarStatus(pedido, status)}
                      disabled={atualizandoId === pedido.id}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                        status === 'CANCELADO'
                          ? 'border-danger/30 text-danger hover:bg-danger/10'
                          : 'border-brand/30 text-brand hover:bg-brand-soft'
                      }`}
                    >
                      {ACAO_STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>

                {erroId === pedido.id && (
                  <p className="mt-2 text-xs text-danger sm:basis-full">
                    Não foi possível atualizar o status. Tente novamente.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
