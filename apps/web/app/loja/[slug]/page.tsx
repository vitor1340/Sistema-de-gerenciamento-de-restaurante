import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { LojaDTO } from '@comandai/shared-types';
import { LojaView } from '@/components/loja/LojaView';

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let loja: LojaDTO;
  try {
    loja = await apiFetch<LojaDTO>(`/loja/${slug}`, undefined);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <LojaView loja={loja} />;
}
