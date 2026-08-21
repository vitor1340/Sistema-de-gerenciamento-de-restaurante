import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { PedidoStatusPublicoDTO } from '@comandai/shared-types';
import { PedidoStatusView } from '@/components/loja/PedidoStatusView';

export default async function PedidoStatusPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  let pedido: PedidoStatusPublicoDTO;
  try {
    pedido = await apiFetch<PedidoStatusPublicoDTO>(`/loja/${slug}/pedidos/${id}`, undefined);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <PedidoStatusView pedido={pedido} slug={slug} />;
}
