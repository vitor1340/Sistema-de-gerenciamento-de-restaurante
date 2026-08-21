import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type { PedidoResumoDTO } from '@comandai/shared-types';
import { PedidosManager } from '@/components/pedidos/PedidosManager';

export default async function PedidosPage() {
  const token = await getSessionToken();

  const pedidos = await apiFetch<PedidoResumoDTO[]>('/pedidos?limit=100', token);

  return <PedidosManager pedidosIniciais={pedidos} />;
}
